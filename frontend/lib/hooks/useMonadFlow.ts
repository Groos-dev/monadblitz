// MonadFlow 合约交互 Hook
import { useState, useCallback } from 'react';
import { ethers } from 'ethers';
import { CONTRACTS } from '@/config/monad';
import { MONAD_FLOW_ABI } from '@/config/contract-abi';
import type { TCCTransaction, TCCState } from '@/types';

export const useMonadFlow = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 获取合约实例
  const getContract = useCallback(async (withSigner = false) => {
    if (!window.ethereum) {
      throw new Error('Please install MetaMask');
    }

    const provider = new ethers.BrowserProvider(window.ethereum);

    if (withSigner) {
      const signer = await provider.getSigner();
      return new ethers.Contract(CONTRACTS.MonadFlowController, MONAD_FLOW_ABI, signer);
    }

    return new ethers.Contract(CONTRACTS.MonadFlowController, MONAD_FLOW_ABI, provider);
  }, []);

  // 锁定资金 (Try)
  const lockFunds = useCallback(async (
    serviceAddress: string,
    amount: string,
    timeout: number = 300
  ): Promise<string> => {
    setLoading(true);
    setError(null);

    try {
      const contract = await getContract(true);
      const value = ethers.parseEther(amount);

      console.log('Locking funds:', { serviceAddress, amount, timeout, value: value.toString() });

      const tx = await contract.lockFunds(serviceAddress, timeout, { value });
      console.log('Transaction sent:', tx.hash);

      const receipt = await tx.wait();
      console.log('Transaction confirmed:', receipt);

      // 从事件中提取 txId
      const event = receipt.logs.find((log: any) => {
        try {
          const parsed = contract.interface.parseLog(log);
          return parsed?.name === 'FundsLocked';
        } catch {
          return false;
        }
      });

      if (event) {
        const parsed = contract.interface.parseLog(event);
        const txId = parsed?.args[0];
        console.log('TCC Transaction ID:', txId);
        return txId;
      }

      throw new Error('Failed to get transaction ID from event');
    } catch (err: any) {
      console.error('Lock funds error:', err);
      setError(err.message || 'Failed to lock funds');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getContract]);

  // 确认交易 (Confirm)
  const confirmTransaction = useCallback(async (
    txId: string,
    resultHash: string
  ): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const contract = await getContract(true);
      const hashBytes = ethers.id(resultHash); // 将字符串转为 bytes32

      console.log('Confirming transaction:', { txId, resultHash, hashBytes });

      const tx = await contract.confirmTransaction(txId, hashBytes);
      await tx.wait();

      console.log('Transaction confirmed successfully');
    } catch (err: any) {
      console.error('Confirm transaction error:', err);
      setError(err.message || 'Failed to confirm transaction');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getContract]);

  // 取消交易 (Cancel)
  const cancelTransaction = useCallback(async (
    txId: string,
    reason: string = 'User cancelled'
  ): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const contract = await getContract(true);

      console.log('Cancelling transaction:', { txId, reason });

      const tx = await contract.cancelTransaction(txId, reason);
      await tx.wait();

      console.log('Transaction cancelled successfully');
    } catch (err: any) {
      console.error('Cancel transaction error:', err);
      setError(err.message || 'Failed to cancel transaction');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getContract]);

  // 获取交易信息
  const getTransaction = useCallback(async (txId: string): Promise<TCCTransaction> => {
    try {
      const contract = await getContract(false);

      const tx = await contract.getTransaction(txId);

      // 转换状态
      const stateMap: TCCState[] = [
        'idle', 'trying', 'locked', 'executing', 'confirmed', 'cancelled', 'timeout'
      ];

      return {
        id: txId,
        user: tx.user,
        service: tx.service,
        amount: ethers.formatEther(tx.amount),
        state: stateMap[tx.state] || 'idle',
        lockTime: Number(tx.lockTime),
        timeout: Number(tx.timeout),
        result: tx.resultHash !== ethers.ZeroHash ? tx.resultHash : undefined,
      };
    } catch (err: any) {
      console.error('Get transaction error:', err);
      throw err;
    }
  }, [getContract]);

  // 检查是否超时
  const isTimeout = useCallback(async (txId: string): Promise<boolean> => {
    try {
      const contract = await getContract(false);
      return await contract.isTransactionTimeout(txId);
    } catch (err: any) {
      console.error('Check timeout error:', err);
      return false;
    }
  }, [getContract]);

  // 监听合约事件
  const listenToEvents = useCallback(async (
    onFundsLocked?: (data: any) => void,
    onConfirmed?: (data: any) => void,
    onCancelled?: (data: any) => void
  ) => {
    try {
      const contract = await getContract(false);

      if (onFundsLocked) {
        contract.on('FundsLocked', (txId, user, service, amount, timeout, event) => {
          onFundsLocked({ txId, user, service, amount: ethers.formatEther(amount), timeout, event });
        });
      }

      if (onConfirmed) {
        contract.on('TransactionConfirmed', (txId, resultHash, timestamp, event) => {
          onConfirmed({ txId, resultHash, timestamp, event });
        });
      }

      if (onCancelled) {
        contract.on('TransactionCancelled', (txId, reason, timestamp, event) => {
          onCancelled({ txId, reason, timestamp, event });
        });
      }

      // 返回清理函数
      return () => {
        contract.removeAllListeners();
      };
    } catch (err: any) {
      console.error('Listen to events error:', err);
    }
  }, [getContract]);

  return {
    loading,
    error,
    lockFunds,
    confirmTransaction,
    cancelTransaction,
    getTransaction,
    isTimeout,
    listenToEvents,
  };
};
