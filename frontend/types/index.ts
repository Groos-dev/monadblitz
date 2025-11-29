// 统一导出所有类型

export * from './tcc';
export * from './demo';

// Monad 相关类型 (从 demo 复用)
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

export interface WalletState {
  account: string | null;
  balance: string | null;
  chainId: string | null;
  isConnected: boolean;
  isLoading: boolean;
}

export interface MetaMaskError {
  code: number;
  message: string;
}
