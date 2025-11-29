# 前端接入文档

本文档说明如何在前端项目中使用 MonadFlow SDK。

## 目录

- [安装](#安装)
- [快速开始](#快速开始)
- [React 集成示例](#react-集成示例)
- [Vue 集成示例](#vue-集成示例)
- [原生 JavaScript 示例](#原生-javascript-示例)
- [API 参考](#api-参考)
- [常见问题](#常见问题)

## 安装

### 使用 npm

```bash
npm install @monadblitz/sdk ethers
```

### 使用 yarn

```bash
yarn add @monadblitz/sdk ethers
```

### 使用 pnpm

```bash
pnpm add @monadblitz/sdk ethers
```

## 快速开始

### 基础使用

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

console.log('交易 ID:', txId);
```

## React 集成示例

### 创建自定义 Hook

```typescript
// hooks/useMonadFlowSDK.ts
import { useState, useEffect, useCallback } from 'react';
import { MonadFlowSDK } from '@monadblitz/sdk';
import type { TCCTransaction } from '@monadblitz/sdk';

export function useMonadFlowSDK() {
  const [sdk, setSdk] = useState<MonadFlowSDK | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  // 初始化 SDK
  const init = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const sdkInstance = new MonadFlowSDK({
        contractAddress: '0x8AA865E227346122E734c7A4df5836Fd2Ab48218',
      });

      await sdkInstance.initBrowser();
      setSdk(sdkInstance);
      setInitialized(true);
    } catch (err: any) {
      setError(err.message || '初始化失败');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // 锁定资金
  const lockFunds = useCallback(async (
    serviceAddress: string,
    amount: string,
    timeout: number = 300
  ): Promise<string> => {
    if (!sdk) {
      throw new Error('SDK 未初始化');
    }

    try {
      setLoading(true);
      setError(null);
      return await sdk.lockFunds(serviceAddress, amount, timeout);
    } catch (err: any) {
      setError(err.message || '锁定资金失败');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [sdk]);

  // 确认交易
  const confirmTransaction = useCallback(async (
    txId: string,
    resultHash: string
  ): Promise<void> => {
    if (!sdk) {
      throw new Error('SDK 未初始化');
    }

    try {
      setLoading(true);
      setError(null);
      await sdk.confirmTransaction(txId, resultHash);
    } catch (err: any) {
      setError(err.message || '确认交易失败');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [sdk]);

  // 取消交易
  const cancelTransaction = useCallback(async (
    txId: string,
    reason: string = 'User cancelled'
  ): Promise<void> => {
    if (!sdk) {
      throw new Error('SDK 未初始化');
    }

    try {
      setLoading(true);
      setError(null);
      await sdk.cancelTransaction(txId, reason);
    } catch (err: any) {
      setError(err.message || '取消交易失败');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [sdk]);

  // 获取交易信息
  const getTransaction = useCallback(async (
    txId: string
  ): Promise<TCCTransaction> => {
    if (!sdk) {
      throw new Error('SDK 未初始化');
    }

    try {
      return await sdk.getTransaction(txId);
    } catch (err: any) {
      setError(err.message || '获取交易信息失败');
      throw err;
    }
  }, [sdk]);

  // 清理资源
  useEffect(() => {
    return () => {
      if (sdk) {
        sdk.cleanup();
      }
    };
  }, [sdk]);

  return {
    sdk,
    loading,
    error,
    initialized,
    init,
    lockFunds,
    confirmTransaction,
    cancelTransaction,
    getTransaction,
  };
}
```

### 在组件中使用

```typescript
// components/PaymentDemo.tsx
'use client';

import { useState } from 'react';
import { useMonadFlowSDK } from '@/hooks/useMonadFlowSDK';

export default function PaymentDemo() {
  const {
    initialized,
    loading,
    error,
    init,
    lockFunds,
    getTransaction,
  } = useMonadFlowSDK();

  const [txId, setTxId] = useState<string | null>(null);
  const [transaction, setTransaction] = useState<any>(null);

  // 初始化 SDK
  const handleInit = async () => {
    try {
      await init();
      alert('SDK 初始化成功');
    } catch (err) {
      alert('初始化失败: ' + (err as Error).message);
    }
  };

  // 锁定资金
  const handleLockFunds = async () => {
    try {
      const id = await lockFunds(
        '0xc66B6bC7955f3572748905c5Ba724021c6bfFe15',
        '0.1',
        300
      );
      setTxId(id);
      alert('资金锁定成功，交易 ID: ' + id);
    } catch (err) {
      alert('锁定失败: ' + (err as Error).message);
    }
  };

  // 查询交易
  const handleGetTransaction = async () => {
    if (!txId) return;

    try {
      const tx = await getTransaction(txId);
      setTransaction(tx);
    } catch (err) {
      alert('查询失败: ' + (err as Error).message);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">MonadFlow 支付演示</h1>

      {!initialized && (
        <button
          onClick={handleInit}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          初始化 SDK
        </button>
      )}

      {initialized && (
        <div className="space-y-4">
          <button
            onClick={handleLockFunds}
            disabled={loading}
            className="px-4 py-2 bg-green-500 text-white rounded disabled:opacity-50"
          >
            {loading ? '处理中...' : '锁定资金 (0.1 MON)'}
          </button>

          {txId && (
            <div>
              <p className="text-sm text-gray-600">交易 ID: {txId}</p>
              <button
                onClick={handleGetTransaction}
                className="px-4 py-2 bg-gray-500 text-white rounded mt-2"
              >
                查询交易状态
              </button>
            </div>
          )}

          {transaction && (
            <div className="mt-4 p-4 bg-gray-100 rounded">
              <h3 className="font-bold">交易信息</h3>
              <pre className="text-sm mt-2">
                {JSON.stringify(transaction, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="mt-4 p-4 bg-red-100 text-red-700 rounded">
          错误: {error}
        </div>
      )}
    </div>
  );
}
```

### 事件监听示例

```typescript
// hooks/useMonadFlowEvents.ts
import { useEffect, useRef } from 'react';
import { MonadFlowSDK } from '@monadblitz/sdk';

export function useMonadFlowEvents(sdk: MonadFlowSDK | null) {
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!sdk) return;

    // 设置事件监听
    sdk.listenToEvents(
      // FundsLocked 事件
      (data) => {
        console.log('资金已锁定:', data);
        // 处理资金锁定事件
      },
      // TransactionConfirmed 事件
      (data) => {
        console.log('交易已确认:', data);
        // 处理交易确认事件
      },
      // TransactionCancelled 事件
      (data) => {
        console.log('交易已取消:', data);
        // 处理交易取消事件
      }
    ).then((cleanup) => {
      cleanupRef.current = cleanup;
    });

    // 清理函数
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
      }
    };
  }, [sdk]);
}
```

## Vue 集成示例

### 创建 Composable

```typescript
// composables/useMonadFlowSDK.ts
import { ref, onUnmounted } from 'vue';
import { MonadFlowSDK } from '@monadblitz/sdk';
import type { TCCTransaction } from '@monadblitz/sdk';

export function useMonadFlowSDK() {
  const sdk = ref<MonadFlowSDK | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const initialized = ref(false);

  // 初始化 SDK
  const init = async () => {
    try {
      loading.value = true;
      error.value = null;

      const sdkInstance = new MonadFlowSDK({
        contractAddress: '0x8AA865E227346122E734c7A4df5836Fd2Ab48218',
      });

      await sdkInstance.initBrowser();
      sdk.value = sdkInstance;
      initialized.value = true;
    } catch (err: any) {
      error.value = err.message || '初始化失败';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // 锁定资金
  const lockFunds = async (
    serviceAddress: string,
    amount: string,
    timeout: number = 300
  ): Promise<string> => {
    if (!sdk.value) {
      throw new Error('SDK 未初始化');
    }

    try {
      loading.value = true;
      error.value = null;
      return await sdk.value.lockFunds(serviceAddress, amount, timeout);
    } catch (err: any) {
      error.value = err.message || '锁定资金失败';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // 清理资源
  onUnmounted(() => {
    if (sdk.value) {
      sdk.value.cleanup();
    }
  });

  return {
    sdk,
    loading,
    error,
    initialized,
    init,
    lockFunds,
  };
}
```

### 在组件中使用

```vue
<!-- components/PaymentDemo.vue -->
<template>
  <div class="p-4">
    <h1 class="text-2xl font-bold mb-4">MonadFlow 支付演示</h1>

    <button
      v-if="!initialized"
      @click="handleInit"
      class="px-4 py-2 bg-blue-500 text-white rounded"
    >
      初始化 SDK
    </button>

    <div v-else class="space-y-4">
      <button
        @click="handleLockFunds"
        :disabled="loading"
        class="px-4 py-2 bg-green-500 text-white rounded disabled:opacity-50"
      >
        {{ loading ? '处理中...' : '锁定资金 (0.1 MON)' }}
      </button>

      <div v-if="txId" class="mt-4">
        <p class="text-sm text-gray-600">交易 ID: {{ txId }}</p>
      </div>
    </div>

    <div v-if="error" class="mt-4 p-4 bg-red-100 text-red-700 rounded">
      错误: {{ error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useMonadFlowSDK } from '@/composables/useMonadFlowSDK';

const { initialized, loading, error, init, lockFunds } = useMonadFlowSDK();
const txId = ref<string | null>(null);

const handleInit = async () => {
  try {
    await init();
    alert('SDK 初始化成功');
  } catch (err) {
    alert('初始化失败: ' + (err as Error).message);
  }
};

const handleLockFunds = async () => {
  try {
    const id = await lockFunds(
      '0xc66B6bC7955f3572748905c5Ba724021c6bfFe15',
      '0.1',
      300
    );
    txId.value = id;
    alert('资金锁定成功，交易 ID: ' + id);
  } catch (err) {
    alert('锁定失败: ' + (err as Error).message);
  }
};
</script>
```

## 原生 JavaScript 示例

```html
<!DOCTYPE html>
<html>
<head>
  <title>MonadFlow SDK 示例</title>
  <script src="https://cdn.ethers.io/lib/ethers-6.0.umd.min.js"></script>
  <script type="module">
    import { MonadFlowSDK } from './node_modules/@monadblitz/sdk/dist/index.js';

    let sdk = null;

    // 初始化 SDK
    async function initSDK() {
      try {
        sdk = new MonadFlowSDK({
          contractAddress: '0x8AA865E227346122E734c7A4df5836Fd2Ab48218',
        });

        await sdk.initBrowser();
        console.log('SDK 初始化成功');
        document.getElementById('status').textContent = 'SDK 已初始化';
      } catch (error) {
        console.error('初始化失败:', error);
        document.getElementById('status').textContent = '初始化失败: ' + error.message;
      }
    }

    // 锁定资金
    async function lockFunds() {
      if (!sdk) {
        alert('请先初始化 SDK');
        return;
      }

      try {
        const txId = await sdk.lockFunds(
          '0xc66B6bC7955f3572748905c5Ba724021c6bfFe15',
          '0.1',
          300
        );
        console.log('交易 ID:', txId);
        document.getElementById('txId').textContent = '交易 ID: ' + txId;
      } catch (error) {
        console.error('锁定失败:', error);
        alert('锁定失败: ' + error.message);
      }
    }

    // 页面加载时初始化
    window.addEventListener('load', () => {
      document.getElementById('initBtn').addEventListener('click', initSDK);
      document.getElementById('lockBtn').addEventListener('click', lockFunds);
    });
  </script>
</head>
<body>
  <h1>MonadFlow SDK 示例</h1>
  <div id="status">未初始化</div>
  <button id="initBtn">初始化 SDK</button>
  <button id="lockBtn">锁定资金</button>
  <div id="txId"></div>
</body>
</html>
```

## API 参考

### MonadFlowSDK 类

#### 构造函数

```typescript
new MonadFlowSDK(config: MonadFlowSDKConfig)
```

#### 方法

- `initBrowser(): Promise<void>` - 初始化 SDK（浏览器环境）
- `lockFunds(serviceAddress: string, amount: string, timeout?: number): Promise<string>` - 锁定资金
- `confirmTransaction(txId: string, resultHash: string): Promise<void>` - 确认交易
- `cancelTransaction(txId: string, reason?: string): Promise<void>` - 取消交易
- `getTransaction(txId: string): Promise<TCCTransaction>` - 获取交易信息
- `isTimeout(txId: string): Promise<boolean>` - 检查是否超时
- `listenToEvents(onFundsLocked?, onConfirmed?, onCancelled?): Promise<() => void>` - 监听事件
- `getWalletState(): Promise<WalletState>` - 获取钱包状态
- `cleanup(): void` - 清理资源

详细 API 文档请参考 [README.md](../README.md)。

## 常见问题

### 1. MetaMask 未安装

如果用户未安装 MetaMask，SDK 会抛出错误。建议在初始化前检查：

```typescript
if (typeof window.ethereum === 'undefined') {
  alert('请安装 MetaMask');
  return;
}
```

### 2. 网络切换失败

如果自动切换网络失败，可以提示用户手动切换：

```typescript
try {
  await sdk.initBrowser();
} catch (error) {
  if (error.message.includes('网络')) {
    alert('请手动切换到 Monad Testnet 网络');
  }
}
```

### 3. 交易被拒绝

用户可能拒绝交易，需要处理这种情况：

```typescript
try {
  await sdk.lockFunds(serviceAddress, amount);
} catch (error) {
  if (error.message.includes('rejected') || error.code === 4001) {
    console.log('用户取消了交易');
  }
}
```

### 4. 余额不足

检查用户余额：

```typescript
const walletState = await sdk.getWalletState();
const balance = parseFloat(walletState.balance || '0');
if (balance < parseFloat(amount)) {
  alert('余额不足');
  return;
}
```

### 5. 事件监听器未清理

确保在组件卸载时清理事件监听器：

```typescript
useEffect(() => {
  return () => {
    if (sdk) {
      sdk.cleanup();
    }
  };
}, [sdk]);
```

## 完整示例项目

查看完整的前端集成示例，请参考项目中的：
- `frontend/lib/hooks/useMonadFlow.ts` - React Hook 实现
- `frontend/components/Demo/AIGenerationDemo.tsx` - 完整演示组件

## 支持

如有问题，请提交 Issue 或查看项目文档。
