# MonadFlow SDK

MonadFlow Protocol SDK - 基于 Monad 区块链的 TCC (Try-Confirm-Cancel) 原子化支付协议 SDK。

## 📚 文档

- [前端接入文档](./docs/FRONTEND_INTEGRATION.md) - 详细的前端集成指南（React、Vue、原生 JS）
- [API 文档](#api-文档) - 完整的 API 参考

## 安装

```bash
npm install @monadblitz/sdk ethers
# 或
yarn add @monadblitz/sdk ethers
# 或
pnpm add @monadblitz/sdk ethers
```

## 快速开始

### 浏览器环境

```typescript
import { MonadFlowSDK } from '@monadblitz/sdk';

// 创建 SDK 实例
const sdk = new MonadFlowSDK({
  contractAddress: '0x8AA865E227346122E734c7A4df5836Fd2Ab48218',
});

// 初始化（浏览器环境）
await sdk.initBrowser();

// 锁定资金
const txId = await sdk.lockFunds(
  '0xc66B6bC7955f3572748905c5Ba724021c6bfFe15', // 服务提供商地址
  '0.1', // 金额 (MON)
  300 // 超时时间（秒）
);

// 获取交易信息
const transaction = await sdk.getTransaction(txId);
console.log('Transaction:', transaction);

// 确认交易
await sdk.confirmTransaction(txId, 'ipfs-hash-here');

// 或取消交易
await sdk.cancelTransaction(txId, 'User cancelled');
```

### Node.js 环境

```typescript
import { MonadFlowSDK } from '@monadblitz/sdk';

// 创建 SDK 实例
const sdk = new MonadFlowSDK({
  contractAddress: '0x8AA865E227346122E734c7A4df5836Fd2Ab48218',
  rpcUrl: 'https://testnet-rpc.monad.xyz',
});

// 初始化（Node.js 环境，需要私钥用于签名）
await sdk.initNode('your-private-key-here');

// 使用 SDK...
```

## API 文档

### MonadFlowSDK

#### 构造函数

```typescript
new MonadFlowSDK(config: MonadFlowSDKConfig)
```

**配置选项：**
- `contractAddress`: 合约地址（必需）
- `rpcUrl`: RPC URL（Node.js 环境必需）
- `chainId`: 链 ID（可选，默认 10143）
- `networkConfig`: 网络配置（可选）

#### 方法

##### `initBrowser()`
初始化 SDK（浏览器环境），会自动切换到 Monad Testnet 网络。

##### `initNode(privateKey?: string)`
初始化 SDK（Node.js 环境），需要提供 RPC URL 和可选的私钥。

##### `lockFunds(serviceAddress: string, amount: string, timeout?: number): Promise<string>`
锁定资金，返回交易 ID。

##### `confirmTransaction(txId: string, resultHash: string): Promise<void>`
确认交易。

##### `cancelTransaction(txId: string, reason?: string): Promise<void>`
取消交易。

##### `getTransaction(txId: string): Promise<TCCTransaction>`
获取交易信息。

##### `isTimeout(txId: string): Promise<boolean>`
检查交易是否超时。

##### `listenToEvents(onFundsLocked?, onConfirmed?, onCancelled?): Promise<() => void>`
监听合约事件，返回清理函数。

##### `getWalletState(): Promise<WalletState>`
获取钱包状态（仅浏览器环境）。

##### `cleanup()`
清理资源，移除所有事件监听器。

## 事件监听

```typescript
const cleanup = await sdk.listenToEvents(
  // FundsLocked 事件
  (data) => {
    console.log('Funds locked:', data);
  },
  // TransactionConfirmed 事件
  (data) => {
    console.log('Transaction confirmed:', data);
  },
  // TransactionCancelled 事件
  (data) => {
    console.log('Transaction cancelled:', data);
  }
);

// 清理监听器
cleanup();
```

## 类型定义

SDK 提供了完整的 TypeScript 类型定义：

- `TCCState`: TCC 状态类型
- `TCCTransaction`: 交易信息
- `MonadNetworkConfig`: 网络配置
- `WalletState`: 钱包状态
- `MonadFlowSDKConfig`: SDK 配置

## 网络配置

默认使用 Monad Testnet：
- Chain ID: 10143
- RPC URL: https://testnet-rpc.monad.xyz
- 浏览器: https://testnet.monadexplorer.com

## 许可证

MIT
