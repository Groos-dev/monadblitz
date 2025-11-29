// TCC 流程模拟数据

import { TCCTransaction, TCCStep, TCCState } from '@/types';

export const createMockTransaction = (
  service: string,
  amount: string
): TCCTransaction => ({
  id: `tx_${Date.now()}`,
  user: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
  service,
  amount,
  state: 'idle',
  lockTime: 0,
  timeout: 300, // 5分钟
});

export const getTCCSteps = (scenario: 'ai' | 'cross-chain' | 'api'): TCCStep[] => {
  const baseSteps: TCCStep[] = [
    {
      name: 'Try',
      state: 'trying',
      description: '用户发起请求，收到 x402 响应',
      status: 'pending',
    },
    {
      name: 'Lock',
      state: 'locked',
      description: '在 Monad 链上锁定资金',
      status: 'pending',
    },
    {
      name: 'Execute',
      state: 'executing',
      description: '链下服务开始执行',
      status: 'pending',
    },
    {
      name: 'Confirm',
      state: 'confirming',
      description: '服务完成，提交证明并结算',
      status: 'pending',
    },
    {
      name: 'Complete',
      state: 'confirmed',
      description: '交易完成，资产交付',
      status: 'pending',
    },
  ];

  // 根据场景自定义描述
  if (scenario === 'ai') {
    baseSteps[2].description = 'AI 模型开始生成图片';
    baseSteps[3].description = '图片生成完成，上传 IPFS';
    baseSteps[4].description = 'NFT 铸造完成';
  } else if (scenario === 'cross-chain') {
    baseSteps[2].description = 'Relayer 在目标链上购买 NFT';
    baseSteps[3].description = '跨链桥接资产到 Monad';
    baseSteps[4].description = 'NFT 交付给用户';
  } else if (scenario === 'api') {
    baseSteps[2].description = 'API 调用执行';
    baseSteps[3].description = 'API 响应验证';
    baseSteps[4].description = '结算完成';
  }

  return baseSteps;
};

// 模拟 TCC 流程自动进展
export const simulateTCCFlow = async (
  steps: TCCStep[],
  onStepChange: (currentStepIndex: number, updatedSteps: TCCStep[]) => void,
  config: { delay?: number } = {}
): Promise<void> => {
  const delay = config.delay || 2000; // 每步默认 2秒
  const updatedSteps = [...steps];

  for (let i = 0; i < updatedSteps.length; i++) {
    // 设置当前步骤为 active
    updatedSteps[i].status = 'active';
    updatedSteps[i].timestamp = Date.now();
    onStepChange(i, [...updatedSteps]);

    // 等待
    await new Promise(resolve => setTimeout(resolve, delay));

    // 完成当前步骤
    updatedSteps[i].status = 'completed';
    updatedSteps[i].txHash = `0x${Math.random().toString(16).slice(2, 66)}`;
    onStepChange(i, [...updatedSteps]);

    // 短暂延迟后进入下一步
    if (i < updatedSteps.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
};

// 预设的服务配置
export const mockServices = {
  aiGeneration: {
    id: 'ai-gen-001',
    name: 'AI Image Generation',
    description: 'Stable Diffusion 图片生成服务',
    price: '0.1',
    timeout: 300,
    provider: '0xAI...Service',
    category: 'ai' as const,
  },
  crossChain: {
    id: 'cross-chain-001',
    name: 'Cross-Chain NFT Purchase',
    description: '跨链 NFT 代购服务',
    price: '100',
    timeout: 600,
    provider: '0xRelay...Service',
    category: 'cross-chain' as const,
  },
  apiGateway: {
    id: 'api-gateway-001',
    name: 'Premium API Gateway',
    description: '高级 API 调用服务',
    price: '0.01',
    timeout: 60,
    provider: '0xAPI...Service',
    category: 'api' as const,
  },
};
