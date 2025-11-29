// 跨链代购模拟数据

import { CrossChainDemo, DemoStep } from '@/types';

export const mockNFTs = [
  {
    type: 'NFT' as const,
    name: 'Bored Ape #1234',
    image: '/images/demo/bayc.jpg',
    价格: '50 ETH',
  },
  {
    type: 'NFT' as const,
    name: 'CryptoPunk #5678',
    image: '/images/demo/punk.jpg',
    价格: '100 ETH',
  },
  {
    type: 'NFT' as const,
    name: 'Azuki #9012',
    image: '/images/demo/azuki.jpg',
    价格: '10 ETH',
  },
];

export const supportedChains = [
  { id: 'monad', name: 'Monad', icon: '🟣' },
  { id: 'ethereum', name: 'Ethereum', icon: '⟠' },
  { id: 'solana', name: 'Solana', icon: '◎' },
  { id: 'polygon', name: 'Polygon', icon: '🟪' },
];

export const createCrossChainDemo = (
  targetChain: string = 'ethereum',
  assetIndex: number = 0
): CrossChainDemo => {
  const asset = mockNFTs[assetIndex] || mockNFTs[0];

  const steps: DemoStep[] = [
    {
      id: 'step-1',
      title: '选择资产',
      description: `选择 ${targetChain} 上的 ${asset.name}`,
      duration: 1000,
    },
    {
      id: 'step-2',
      title: '获取报价',
      description: `Relayer 报价: ${asset.价格} + 手续费`,
      duration: 1500,
    },
    {
      id: 'step-3',
      title: '锁定资金',
      description: '在 Monad 上锁定等值 USDC',
      duration: 2000,
      visualization: 'transaction',
    },
    {
      id: 'step-4',
      title: 'Relayer 垫资',
      description: `Relayer 在 ${targetChain} 上购买 NFT`,
      duration: 3000,
      visualization: 'service',
    },
    {
      id: 'step-5',
      title: '跨链桥接',
      description: `NFT 通过桥接到 Monad`,
      duration: 2500,
    },
    {
      id: 'step-6',
      title: '结算',
      description: '确认交付，自动结算给 Relayer',
      duration: 1500,
      visualization: 'transaction',
    },
    {
      id: 'step-7',
      title: '完成',
      description: 'NFT 交付到用户钱包',
      duration: 1000,
      visualization: 'result',
    },
  ];

  return {
    sourceChain: 'Monad',
    targetChain,
    asset,
    lockAmount: '105000', // USDC
    steps,
  };
};

// 模拟跨链购买过程
export const simulateCrossChainPurchase = async (
  targetChain: string,
  onProgress: (step: number, total: number, message: string, txHash?: string) => void
): Promise<{ success: boolean; assetId: string }> => {
  const steps = [
    { message: `连接到 ${targetChain}...`, duration: 1000 },
    { message: '检查资产可用性...', duration: 800 },
    { message: '准备交易...', duration: 1200 },
    { message: '在目标链上购买...', duration: 2000, hasTx: true },
    { message: '等待确认...', duration: 1500 },
    { message: '启动跨链桥接...', duration: 1800, hasTx: true },
    { message: '等待桥接完成...', duration: 2000 },
    { message: '交付到 Monad...', duration: 1000, hasTx: true },
  ];

  for (let i = 0; i < steps.length; i++) {
    const txHash = steps[i].hasTx
      ? `0x${Math.random().toString(16).slice(2, 66)}`
      : undefined;

    onProgress(i + 1, steps.length, steps[i].message, txHash);
    await new Promise(resolve => setTimeout(resolve, steps[i].duration));
  }

  return {
    success: true,
    assetId: `monad-nft-${Date.now()}`,
  };
};

// 计算汇率和手续费
export const calculateCrossChainCost = (
  amount: string,
  sourceChain: string,
  targetChain: string
): {
  amount: string;
  fee: string;
  total: string;
  exchangeRate: number;
} => {
  const amountNum = parseFloat(amount);
  const feePercentage = 0.03; // 3% 手续费
  const fee = amountNum * feePercentage;
  const exchangeRate = 1.0; // 简化为 1:1

  return {
    amount: amount,
    fee: fee.toFixed(2),
    total: (amountNum + fee).toFixed(2),
    exchangeRate,
  };
};
