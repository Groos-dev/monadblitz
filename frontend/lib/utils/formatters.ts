// 格式化工具函数

export const formatAddress = (address: string, chars = 4): string => {
  if (!address) return '';
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
};

export const formatBalance = (balance: string | number): string => {
  const num = typeof balance === 'string' ? parseFloat(balance) : balance;
  if (isNaN(num)) return '0';

  if (num < 0.0001 && num > 0) {
    return '< 0.0001';
  }

  return num.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 4,
  });
};

export const formatTime = (timestamp: number): string => {
  const date = new Date(timestamp * 1000);
  return date.toLocaleString('zh-CN');
};

export const formatDuration = (seconds: number): string => {
  if (seconds < 60) return `${seconds}秒`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}分钟`;
  return `${Math.floor(seconds / 3600)}小时`;
};

export const formatTxHash = (hash: string, chars = 6): string => {
  if (!hash) return '';
  return `${hash.slice(0, chars + 2)}...${hash.slice(-chars)}`;
};

export const getExplorerUrl = (hash: string, type: 'tx' | 'address' = 'tx'): string => {
  const baseUrl = 'https://explorer.testnet.monad.xyz';
  return `${baseUrl}/${type}/${hash}`;
};
