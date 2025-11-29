// MonadFlow SDK 核心类

/// <reference types="../types/ethereum" />

import { ethers } from 'ethers';
import { 
  MONAD_FLOW_ABI, 
  MONAD_TESTNET, 
  MONAD_TESTNET_CHAIN_ID,
  DEFAULT_CONTRACT_ADDRESS 
} from '../config/constants';
import { 
  ensureCorrectNetwork, 
  isMetaMaskInstalled,
  getWalletState 
} from '../utils/wallet';
import type {
  MonadFlowSDKConfig,
  TCCTransaction,
  TCCState,
  FundsLockedCallback,
  TransactionConfirmedCallback,
  TransactionCancelledCallback,
} from '../types';

export class MonadFlowSDK {
  private contractAddress: string;
  private rpcUrl?: string;
  private chainId: number;
  private networkConfig: typeof MONAD_TESTNET;
  private provider: ethers.BrowserProvider | ethers.JsonRpcProvider | null = null;
  private contract: ethers.Contract | null = null;
  private signer: ethers.JsonRpcSigner | null = null;
  private eventListeners: {
    fundsLocked?: FundsLockedCallback;
    confirmed?: TransactionConfirmedCallback;
    cancelled?: TransactionCancelledCallback;
  } = {};
  private cleanupFunctions: (() => void)[] = [];

  constructor(config: MonadFlowSDKConfig) {
    this.contractAddress = config.contractAddress || DEFAULT_CONTRACT_ADDRESS;
    this.rpcUrl = config.rpcUrl;
    this.chainId = config.chainId || MONAD_TESTNET_CHAIN_ID;
    this.networkConfig = config.networkConfig || MONAD_TESTNET;
  }

  /**
   * 初始化 SDK（浏览器环境）
   */
  async initBrowser(): Promise<void> {
    if (!isMetaMaskInstalled()) {
      throw new Error('请安装 MetaMask');
    }

    if (!window.ethereum) {
      throw new Error('MetaMask 不可用');
    }

    // 确保连接到正确的网络
    await ensureCorrectNetwork();

    // 创建 provider
    this.provider = new ethers.BrowserProvider(window.ethereum);

    // 验证网络连接
    try {
      const network = await this.provider.getNetwork();
      const currentChainId = Number(network.chainId);

      if (currentChainId !== this.chainId) {
        throw new Error(`请切换到 Monad Testnet 网络 (当前: ${currentChainId}, 需要: ${this.chainId})`);
      }
    } catch (networkErr: any) {
      if (networkErr.message?.includes('RPC') || networkErr.message?.includes('405') || networkErr.message?.includes('fetch')) {
        throw new Error('RPC 连接失败，请检查网络连接或稍后重试');
      }
      throw networkErr;
    }

    // 创建合约实例
    this.contract = new ethers.Contract(
      this.contractAddress,
      MONAD_FLOW_ABI,
      this.provider
    );
  }

  /**
   * 初始化 SDK（Node.js 环境）
   */
  async initNode(privateKey?: string): Promise<void> {
    if (!this.rpcUrl) {
      throw new Error('Node.js 环境需要提供 rpcUrl');
    }

    // 创建 provider
    this.provider = new ethers.JsonRpcProvider(this.rpcUrl);

    // 创建合约实例
    this.contract = new ethers.Contract(
      this.contractAddress,
      MONAD_FLOW_ABI,
      this.provider
    );

    // 如果提供了私钥，创建 signer
    if (privateKey) {
      const wallet = new ethers.Wallet(privateKey, this.provider);
      this.signer = wallet as any;
      this.contract = this.contract.connect(wallet);
    }
  }

  /**
   * 获取合约实例（带签名器）
   */
  private async getContract(withSigner = false): Promise<ethers.Contract> {
    if (!this.contract) {
      throw new Error('SDK 未初始化，请先调用 initBrowser() 或 initNode()');
    }

    if (withSigner) {
      if (!this.provider) {
        throw new Error('Provider 未初始化');
      }

      // 浏览器环境
      if (this.provider instanceof ethers.BrowserProvider) {
        if (!window.ethereum) {
          throw new Error('MetaMask 不可用');
        }
        await ensureCorrectNetwork();
        this.signer = await this.provider.getSigner();
        return this.contract.connect(this.signer);
      }

      // Node.js 环境
      if (this.signer) {
        return this.contract.connect(this.signer);
      }

      throw new Error('未提供签名器，Node.js 环境需要提供私钥');
    }

    return this.contract;
  }

  /**
   * 锁定资金 (Try)
   */
  async lockFunds(
    serviceAddress: string,
    amount: string,
    timeout: number = 300
  ): Promise<string> {
    try {
      const contract = await this.getContract(true);
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

      throw new Error(errorMessage);
    }
  }

  /**
   * 确认交易 (Confirm)
   */
  async confirmTransaction(txId: string, resultHash: string): Promise<void> {
    try {
      const contract = await this.getContract(true);
      const hashBytes = ethers.id(resultHash); // 将字符串转为 bytes32

      console.log('Confirming transaction:', { txId, resultHash, hashBytes });

      const tx = await contract.confirmTransaction(txId, hashBytes);
      await tx.wait();

      console.log('Transaction confirmed successfully');
    } catch (err: any) {
      console.error('Confirm transaction error:', err);
      throw err;
    }
  }

  /**
   * 取消交易 (Cancel)
   */
  async cancelTransaction(txId: string, reason: string = 'User cancelled'): Promise<void> {
    try {
      const contract = await this.getContract(true);

      console.log('Cancelling transaction:', { txId, reason });

      const tx = await contract.cancelTransaction(txId, reason);
      await tx.wait();

      console.log('Transaction cancelled successfully');
    } catch (err: any) {
      console.error('Cancel transaction error:', err);
      throw err;
    }
  }

  /**
   * 获取交易信息
   */
  async getTransaction(txId: string): Promise<TCCTransaction> {
    try {
      const contract = await this.getContract(false);

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
  }

  /**
   * 检查是否超时
   */
  async isTimeout(txId: string): Promise<boolean> {
    try {
      const contract = await this.getContract(false);
      return await contract.isTransactionTimeout(txId);
    } catch (err: any) {
      console.error('Check timeout error:', err);
      return false;
    }
  }

  /**
   * 监听合约事件
   */
  async listenToEvents(
    onFundsLocked?: FundsLockedCallback,
    onConfirmed?: TransactionConfirmedCallback,
    onCancelled?: TransactionCancelledCallback
  ): Promise<() => void> {
    try {
      const contract = await this.getContract(false);

      this.eventListeners = {
        fundsLocked: onFundsLocked,
        confirmed: onConfirmed,
        cancelled: onCancelled,
      };

      // 设置事件监听器
      if (onFundsLocked) {
        contract.on('FundsLocked', (txId, user, service, amount, timeout, event) => {
          onFundsLocked({ 
            txId, 
            user, 
            service, 
            amount: ethers.formatEther(amount), 
            timeout, 
            event 
          });
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
      const cleanup = () => {
        contract.removeAllListeners();
        this.eventListeners = {};
      };

      this.cleanupFunctions.push(cleanup);
      return cleanup;
    } catch (err: any) {
      console.error('Listen to events error:', err);
      throw err;
    }
  }

  /**
   * 获取钱包状态
   */
  async getWalletState() {
    if (!this.provider) {
      throw new Error('SDK 未初始化');
    }
    return await getWalletState(this.provider);
  }

  /**
   * 清理资源
   */
  cleanup(): void {
    // 移除所有事件监听器
    this.cleanupFunctions.forEach(fn => fn());
    this.cleanupFunctions = [];
    this.eventListeners = {};
  }
}
