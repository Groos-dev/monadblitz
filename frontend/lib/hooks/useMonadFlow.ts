// MonadFlow 合约交互 Hook
import { useState, useCallback } from 'react';
import { ethers } from 'ethers';
import { CONTRACTS, MONAD_TESTNET, MONAD_TESTNET_CHAIN_ID } from '@/config/monad';
import { MONAD_FLOW_ABI } from '@/config/contract-abi';
import type { TCCTransaction, TCCState } from '@/types';

export const useMonadFlow = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 切换到 Monad Testnet 网络
  const switchToMonadNetwork = useCallback(async (): Promise<boolean> => {
    if (!window.ethereum) {
      throw new Error('请安装 MetaMask');
    }

    try {
      // 先尝试直接切换
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: MONAD_TESTNET.chainId }],
        });
        return true;
      } catch (switchError: any) {
        // 如果网络不存在，则添加网络
        if (switchError.code === 4902 || switchError.code === -32603) {
          try {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [MONAD_TESTNET],
            });
            return true;
          } catch (addError: any) {
            console.error('Failed to add network:', addError);
            throw new Error('无法添加 Monad Testnet 网络，请手动添加');
          }
        } else if (switchError.code === 4001) {
          throw new Error('用户拒绝了切换网络请求');
        } else {
          throw switchError;
        }
      }
    } catch (err: any) {
      console.error('Switch network error:', err);
      throw err;
    }
  }, []);

  // 检查并确保连接到正确的网络
  const ensureCorrectNetwork = useCallback(async (): Promise<void> => {
    if (!window.ethereum) {
      throw new Error('请安装 MetaMask');
    }

    try {
      // 使用 eth_chainId 方法获取当前链 ID（更可靠）
      const chainIdHex = await window.ethereum.request({
        method: 'eth_chainId',
      }) as string;
      const currentChainId = parseInt(chainIdHex, 16);

      if (currentChainId !== MONAD_TESTNET_CHAIN_ID) {
        console.log(`当前网络: ${currentChainId}, 需要切换到: ${MONAD_TESTNET_CHAIN_ID}`);
        await switchToMonadNetwork();

        // 等待网络切换完成
        await new Promise(resolve => setTimeout(resolve, 1000));

        // 再次验证
        const newChainIdHex = await window.ethereum.request({
          method: 'eth_chainId',
        }) as string;
        const newChainId = parseInt(newChainIdHex, 16);

        if (newChainId !== MONAD_TESTNET_CHAIN_ID) {
          throw new Error('网络切换失败，请手动切换到 Monad Testnet');
        }
      }
    } catch (err: any) {
      console.error('Network check error:', err);
      if (err.message) {
        throw err;
      }
      throw new Error('无法验证网络连接，请确保 MetaMask 已连接到 Monad Testnet');
    }
  }, [switchToMonadNetwork]);

  // 获取合约实例
  const getContract = useCallback(async (withSigner = false) => {
    if (!window.ethereum) {
      throw new Error('请安装 MetaMask');
    }

    try {
      // 确保连接到正确的网络
      await ensureCorrectNetwork();

      const provider = new ethers.BrowserProvider(window.ethereum);

      // 验证网络连接（双重检查）
      try {
        const network = await provider.getNetwork();
        const chainId = Number(network.chainId);

        if (chainId !== MONAD_TESTNET_CHAIN_ID) {
          // 如果还是不对，尝试再次切换
          await switchToMonadNetwork();
          throw new Error(`请切换到 Monad Testnet 网络 (当前: ${chainId}, 需要: ${MONAD_TESTNET_CHAIN_ID})`);
        }
      } catch (networkErr: any) {
        // 如果是网络错误，提供更友好的提示
        if (networkErr.message?.includes('RPC') || networkErr.message?.includes('405') || networkErr.message?.includes('fetch')) {
          throw new Error('RPC 连接失败，请检查网络连接或稍后重试');
        }
        throw networkErr;
      }

      if (withSigner) {
        const signer = await provider.getSigner();
        return new ethers.Contract(CONTRACTS.MonadFlowController, MONAD_FLOW_ABI, signer);
      }

      return new ethers.Contract(CONTRACTS.MonadFlowController, MONAD_FLOW_ABI, provider);
    } catch (err: any) {
      console.error('Get contract error:', err);

      // 提供更友好的错误信息
      if (err.message?.includes('405') || err.message?.includes('RPC') || err.message?.includes('fetch')) {
        throw new Error('RPC 连接失败，请检查网络连接或稍后重试');
      }

      throw err;
    }
  }, [ensureCorrectNetwork, switchToMonadNetwork]);

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

      // 更友好的错误提示
      let errorMessage = '锁定资金失败';
      if (err.message?.includes('user rejected') || err.code === 4001) {
        errorMessage = '用户取消了交易';
      } else if (err.message?.includes('insufficient funds') || err.message?.includes('余额')) {
        errorMessage = '余额不足，请确保账户有足够的 MON';
      } else if (err.message?.includes('network') || err.message?.includes('RPC') || err.message?.includes('405') || err.message?.includes('fetch')) {
        errorMessage = '网络连接失败，请检查网络连接或稍后重试';
      } else if (err.message?.includes('Monad Testnet') || err.message?.includes('切换到')) {
        errorMessage = err.message;
      } else if (err.message?.includes('无法验证网络连接')) {
        errorMessage = err.message;
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      throw new Error(errorMessage);
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
    switchToMonadNetwork,
  };
};
