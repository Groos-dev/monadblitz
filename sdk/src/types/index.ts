// SDK 类型定义

// TCC 状态类型
export type TCCState =
  | 'idle'      // 初始状态
  | 'trying'    // 尝试锁定中
  | 'locked'    // 已锁定
  | 'executing' // 执行中
  | 'confirming'// 确认中
  | 'confirmed' // 已确认
  | 'cancelled' // 已取消
  | 'timeout';  // 超时

// TCC 交易信息
export interface TCCTransaction {
  id: string;
  user: string;
  service: string;
  amount: string;
  state: TCCState;
  lockTime: number;
  executeTime?: number;
  confirmTime?: number;
  timeout: number;
  result?: string;  // IPFS hash 或其他结果证明
}

// Monad 网络配置
export interface MonadNetworkConfig {
  chainId: string;
  chainName: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls: string[];
  blockExplorerUrls: string[];
}

// 钱包状态
export interface WalletState {
  account: string | null;
  balance: string | null;
  chainId: string | null;
  isConnected: boolean;
}

// MetaMask 错误
export interface MetaMaskError {
  code: number;
  message: string;
}

// SDK 配置选项
export interface MonadFlowSDKConfig {
  contractAddress: string;
  rpcUrl?: string;
  chainId?: number;
  networkConfig?: MonadNetworkConfig;
}

// 事件监听器类型
export interface FundsLockedEvent {
  txId: string;
  user: string;
  service: string;
  amount: string;
  timeout: number;
  event?: any;
}

export interface TransactionConfirmedEvent {
  txId: string;
  resultHash: string;
  timestamp: number;
  event?: any;
}

export interface TransactionCancelledEvent {
  txId: string;
  reason: string;
  timestamp: number;
  event?: any;
}

// 事件回调类型
export type FundsLockedCallback = (data: FundsLockedEvent) => void;
export type TransactionConfirmedCallback = (data: TransactionConfirmedEvent) => void;
export type TransactionCancelledCallback = (data: TransactionCancelledEvent) => void;
