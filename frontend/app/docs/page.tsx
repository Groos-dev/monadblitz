'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState<string>('installation');

  const sections = [
    { id: 'installation', title: '安装', icon: '📦' },
    { id: 'quickstart', title: '快速开始', icon: '🚀' },
    { id: 'react', title: 'React 集成', icon: '⚛️' },
    { id: 'vue', title: 'Vue 集成', icon: '💚' },
    { id: 'vanilla', title: '原生 JS', icon: '📜' },
    { id: 'api', title: 'API 参考', icon: '📚' },
    { id: 'faq', title: '常见问题', icon: '❓' },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-purple-600 hover:text-purple-700 dark:text-purple-400 mb-4"
          >
            ← 返回首页
          </Link>
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            MonadFlow SDK 接入文档
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            详细的前端集成指南，支持 React、Vue 和原生 JavaScript
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sticky top-8">
              <h2 className="font-bold mb-4 text-lg">目录</h2>
              <nav className="space-y-2">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => {
                      setActiveSection(section.id);
                      document.getElementById(section.id)?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className={`w-full text-left px-4 py-2 rounded-lg transition ${
                      activeSection === section.id
                        ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-semibold'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <span className="mr-2">{section.icon}</span>
                    {section.title}
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          {/* Content */}
          <div className="flex-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 prose prose-lg dark:prose-invert max-w-none">
              {/* 安装 */}
              <section id="installation" className="mb-12">
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
                  <span>📦</span> 安装
                </h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-semibold mb-2">使用 npm</h3>
                    <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg overflow-x-auto">
                      <code>npm install @monadblitz/sdk ethers</code>
                    </pre>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">使用 yarn</h3>
                    <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg overflow-x-auto">
                      <code>yarn add @monadblitz/sdk ethers</code>
                    </pre>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">使用 pnpm</h3>
                    <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg overflow-x-auto">
                      <code>pnpm add @monadblitz/sdk ethers</code>
                    </pre>
                  </div>
                </div>
              </section>

              {/* 快速开始 */}
              <section id="quickstart" className="mb-12">
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
                  <span>🚀</span> 快速开始
                </h2>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg mb-6">
                  <h3 className="text-xl font-semibold mb-4">基础使用</h3>
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                    <code>{`import { MonadFlowSDK } from '@monadblitz/sdk';

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

console.log('交易 ID:', txId);`}</code>
                  </pre>
                </div>
              </section>

              {/* React 集成 */}
              <section id="react" className="mb-12">
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
                  <span>⚛️</span> React 集成示例
                </h2>
                
                <div className="mb-6">
                  <h3 className="text-xl font-semibold mb-4">创建自定义 Hook</h3>
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                    <code>{`// hooks/useMonadFlowSDK.ts
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
  };
}`}</code>
                  </pre>
                </div>

                <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold mb-4">在组件中使用</h3>
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                    <code>{`'use client';

import { useState } from 'react';
import { useMonadFlowSDK } from '@/hooks/useMonadFlowSDK';

export default function PaymentDemo() {
  const {
    initialized,
    loading,
    error,
    init,
    lockFunds,
  } = useMonadFlowSDK();

  const [txId, setTxId] = useState<string | null>(null);

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
      setTxId(id);
      alert('资金锁定成功，交易 ID: ' + id);
    } catch (err) {
      alert('锁定失败: ' + (err as Error).message);
    }
  };

  return (
    <div className="p-4">
      {!initialized && (
        <button onClick={handleInit}>
          初始化 SDK
        </button>
      )}
      {initialized && (
        <button onClick={handleLockFunds} disabled={loading}>
          {loading ? '处理中...' : '锁定资金 (0.1 MON)'}
        </button>
      )}
      {txId && <p>交易 ID: {txId}</p>}
      {error && <div>错误: {error}</div>}
    </div>
  );
}`}</code>
                  </pre>
                </div>
              </section>

              {/* Vue 集成 */}
              <section id="vue" className="mb-12">
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
                  <span>💚</span> Vue 集成示例
                </h2>
                <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold mb-4">创建 Composable</h3>
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                    <code>{`// composables/useMonadFlowSDK.ts
import { ref, onUnmounted } from 'vue';
import { MonadFlowSDK } from '@monadblitz/sdk';

export function useMonadFlowSDK() {
  const sdk = ref<MonadFlowSDK | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const initialized = ref(false);

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
  };
}`}</code>
                  </pre>
                </div>
              </section>

              {/* 原生 JS */}
              <section id="vanilla" className="mb-12">
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
                  <span>📜</span> 原生 JavaScript 示例
                </h2>
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                  <code>{`import { MonadFlowSDK } from '@monadblitz/sdk';

let sdk = null;

// 初始化 SDK
async function initSDK() {
  sdk = new MonadFlowSDK({
    contractAddress: '0x8AA865E227346122E734c7A4df5836Fd2Ab48218',
  });

  await sdk.initBrowser();
  console.log('SDK 初始化成功');
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
  } catch (error) {
    console.error('锁定失败:', error);
  }
}`}</code>
                </pre>
              </section>

              {/* API 参考 */}
              <section id="api" className="mb-12">
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
                  <span>📚</span> API 参考
                </h2>
                <div className="space-y-6">
                  <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
                    <h3 className="text-xl font-semibold mb-3">MonadFlowSDK 类</h3>
                    <div className="space-y-4 text-sm">
                      <div>
                        <code className="text-purple-600 dark:text-purple-400">initBrowser()</code>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                          初始化 SDK（浏览器环境），会自动切换到 Monad Testnet 网络
                        </p>
                      </div>
                      <div>
                        <code className="text-purple-600 dark:text-purple-400">lockFunds(serviceAddress, amount, timeout?)</code>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                          锁定资金，返回交易 ID
                        </p>
                      </div>
                      <div>
                        <code className="text-purple-600 dark:text-purple-400">confirmTransaction(txId, resultHash)</code>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                          确认交易
                        </p>
                      </div>
                      <div>
                        <code className="text-purple-600 dark:text-purple-400">cancelTransaction(txId, reason?)</code>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                          取消交易
                        </p>
                      </div>
                      <div>
                        <code className="text-purple-600 dark:text-purple-400">getTransaction(txId)</code>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                          获取交易信息
                        </p>
                      </div>
                      <div>
                        <code className="text-purple-600 dark:text-purple-400">listenToEvents(onFundsLocked?, onConfirmed?, onCancelled?)</code>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                          监听合约事件，返回清理函数
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* 常见问题 */}
              <section id="faq" className="mb-12">
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
                  <span>❓</span> 常见问题
                </h2>
                <div className="space-y-6">
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-lg">
                    <h3 className="text-xl font-semibold mb-2">1. MetaMask 未安装</h3>
                    <p className="text-gray-700 dark:text-gray-300 mb-2">
                      如果用户未安装 MetaMask，SDK 会抛出错误。建议在初始化前检查：
                    </p>
                    <pre className="bg-gray-900 text-gray-100 p-3 rounded text-sm">
                      <code>{`if (typeof window.ethereum === 'undefined') {
  alert('请安装 MetaMask');
  return;
}`}</code>
                    </pre>
                  </div>

                  <div className="bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-lg">
                    <h3 className="text-xl font-semibold mb-2">2. 网络切换失败</h3>
                    <p className="text-gray-700 dark:text-gray-300 mb-2">
                      如果自动切换网络失败，可以提示用户手动切换：
                    </p>
                    <pre className="bg-gray-900 text-gray-100 p-3 rounded text-sm">
                      <code>{`try {
  await sdk.initBrowser();
} catch (error) {
  if (error.message.includes('网络')) {
    alert('请手动切换到 Monad Testnet 网络');
  }
}`}</code>
                    </pre>
                  </div>

                  <div className="bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-lg">
                    <h3 className="text-xl font-semibold mb-2">3. 交易被拒绝</h3>
                    <p className="text-gray-700 dark:text-gray-300 mb-2">
                      用户可能拒绝交易，需要处理这种情况：
                    </p>
                    <pre className="bg-gray-900 text-gray-100 p-3 rounded text-sm">
                      <code>{`try {
  await sdk.lockFunds(serviceAddress, amount);
} catch (error) {
  if (error.message.includes('rejected') || error.code === 4001) {
    console.log('用户取消了交易');
  }
}`}</code>
                    </pre>
                  </div>

                  <div className="bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-lg">
                    <h3 className="text-xl font-semibold mb-2">4. 余额不足</h3>
                    <p className="text-gray-700 dark:text-gray-300 mb-2">
                      检查用户余额：
                    </p>
                    <pre className="bg-gray-900 text-gray-100 p-3 rounded text-sm">
                      <code>{`const walletState = await sdk.getWalletState();
const balance = parseFloat(walletState.balance || '0');
if (balance < parseFloat(amount)) {
  alert('余额不足');
  return;
}`}</code>
                    </pre>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
