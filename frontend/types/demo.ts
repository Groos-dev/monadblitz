// 演示相关类型定义

export interface DemoScenario {
  id: string;
  title: string;
  description: string;
  category: 'ai' | 'cross-chain' | 'api';
  icon: string;
  steps: DemoStep[];
  mockData: any;
}

export interface DemoStep {
  id: string;
  title: string;
  description: string;
  duration: number;  // ms
  visualization?: 'transaction' | 'service' | 'result';
}

// AI 生成场景
export interface AIGenerationDemo {
  prompt: string;
  lockAmount: string;
  generationTime: number;
  resultImage?: string;
  steps: DemoStep[];
}

// 跨链代购场景
export interface CrossChainDemo {
  sourceChain: string;
  targetChain: string;
  asset: {
    type: 'NFT' | 'Token';
    name: string;
    image?: string;
    价格?: string;
  };
  lockAmount: string;
  steps: DemoStep[];
}

// API 网关场景
export interface APIGatewayDemo {
  apiName: string;
  callCount: number;
  pricePerCall: string;
  totalAmount: string;
  steps: DemoStep[];
}

export interface ArchitectureLayer {
  name: string;
  description: string;
  components: string[];
  color: string;
}
