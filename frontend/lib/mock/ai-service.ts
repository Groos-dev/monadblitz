// AI 服务模拟数据

import { AIGenerationDemo, DemoStep } from '@/types';

export const mockAIPrompts = [
  'A futuristic cityscape on Monad blockchain',
  'Digital art of TCC protocol visualization',
  'Abstract representation of cross-chain bridge',
  'Cyberpunk style MonadFlow logo',
];

export const mockAIImages = [
  '/images/demo/ai-result-1.jpg',
  '/images/demo/ai-result-2.jpg',
  '/images/demo/ai-result-3.jpg',
  '/images/demo/ai-result-4.jpg',
];

export const createAIGenerationDemo = (
  prompt?: string,
  customSteps?: DemoStep[]
): AIGenerationDemo => {
  const selectedPrompt = prompt || mockAIPrompts[Math.floor(Math.random() * mockAIPrompts.length)];

  const defaultSteps: DemoStep[] = [
    {
      id: 'step-1',
      title: '发起请求',
      description: `提交 Prompt: "${selectedPrompt}"`,
      duration: 1000,
      visualization: 'transaction',
    },
    {
      id: 'step-2',
      title: '收到 x402',
      description: '服务器返回 402 Payment Required',
      duration: 500,
    },
    {
      id: 'step-3',
      title: '锁定资金',
      description: '在 Monad 链上锁定 0.1 MON',
      duration: 1500,
      visualization: 'transaction',
    },
    {
      id: 'step-4',
      title: 'GPU 开始渲染',
      description: 'Stable Diffusion 模型生成中...',
      duration: 3000,
      visualization: 'service',
    },
    {
      id: 'step-5',
      title: '上传 IPFS',
      description: '图片生成完成，上传至 IPFS',
      duration: 2000,
    },
    {
      id: 'step-6',
      title: '链上确认',
      description: '提交 IPFS Hash，自动结算',
      duration: 1500,
      visualization: 'transaction',
    },
    {
      id: 'step-7',
      title: 'NFT 铸造',
      description: 'NFT 铸造完成并交付',
      duration: 1000,
      visualization: 'result',
    },
  ];

  return {
    prompt: selectedPrompt,
    lockAmount: '0.1',
    generationTime: defaultSteps.reduce((sum, step) => sum + step.duration, 0),
    resultImage: mockAIImages[Math.floor(Math.random() * mockAIImages.length)],
    steps: customSteps || defaultSteps,
  };
};

// 模拟 AI 生成过程
export const simulateAIGeneration = async (
  onProgress: (step: number, total: number, message: string) => void
): Promise<string> => {
  const steps = [
    { message: '初始化 AI 模型...', duration: 800 },
    { message: '生成初始图像...', duration: 1500 },
    { message: '优化细节...', duration: 1200 },
    { message: '应用风格转换...', duration: 1000 },
    { message: '最终渲染...', duration: 800 },
    { message: '上传到 IPFS...', duration: 1000 },
  ];

  for (let i = 0; i < steps.length; i++) {
    onProgress(i + 1, steps.length, steps[i].message);
    await new Promise(resolve => setTimeout(resolve, steps[i].duration));
  }

  // 返回模拟的 IPFS hash
  return `ipfs://Qm${Math.random().toString(36).substring(2, 48)}`;
};
