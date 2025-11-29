// TCC (Try-Confirm-Cancel) 核心类型定义

export type TCCState =
  | 'idle'      // 初始状态
  | 'trying'    // 尝试锁定中
  | 'locked'    // 已锁定
  | 'executing' // 执行中
  | 'confirming'// 确认中
  | 'confirmed' // 已确认
  | 'cancelled' // 已取消
  | 'timeout';  // 超时

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

export interface TCCStep {
  name: string;
  state: TCCState;
  description: string;
  timestamp?: number;
  txHash?: string;
  status: 'pending' | 'active' | 'completed' | 'failed';
}

export interface X402Response {
  status: 402;
  message: string;
  paymentRequired: {
    amount: string;
    token: string;
    recipient: string;
    contractAddress: string;
    serviceId: string;
  };
  returnUrl?: string;
}

export interface ServiceConfig {
  id: string;
  name: string;
  description: string;
  price: string;
  timeout: number;  // 秒
  provider: string;
  category: 'ai' | 'api' | 'cross-chain' | 'other';
}

export interface TCCFlowConfig {
  autoProgress?: boolean;      // 自动进入下一步
  animationDuration?: number;  // 动画持续时间(ms)
  mockDelay?: number;          // 模拟延迟(ms)
}
