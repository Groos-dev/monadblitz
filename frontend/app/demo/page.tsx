'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useWallet } from '@/lib/hooks/useWallet';
import { useMonadFlow } from '@/lib/hooks/useMonadFlow';
import { formatAddress, formatBalance } from '@/lib/utils/formatters';
import AIGenerationDemo from '@/components/Demo/AIGenerationDemo';

export default function DemoPage() {
  const wallet = useWallet();
  const [activeDemo, setActiveDemo] = useState<'ai' | 'cross-chain' | 'api' | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            ← MonadFlow Protocol
          </Link>

          {/* Wallet */}
          <div>
            {!wallet.isConnected ? (
              <button
                onClick={wallet.connect}
                disabled={wallet.isLoading || !wallet.isMetaMaskInstalled}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition disabled:opacity-50"
              >
                {!wallet.isMetaMaskInstalled ? '请安装 MetaMask' : '连接钱包'}
              </button>
            ) : (
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {formatAddress(wallet.account!)}
                  </div>
                  <div className="font-bold">
                    {formatBalance(wallet.balance!)} MON
                  </div>
                </div>
                <button
                  onClick={wallet.disconnect}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                >
                  断开
                </button>
              </div>
            )}

            {wallet.error && (
              <div className="mt-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div className="text-sm text-red-600 dark:text-red-400 font-medium">
                  {wallet.error}
                </div>
                {wallet.error.includes('Monad Testnet') && (
                  <button
                    onClick={wallet.addMonadNetwork}
                    className="mt-2 text-xs text-red-600 dark:text-red-400 underline hover:no-underline"
                  >
                    点击添加 Monad Testnet 网络
                  </button>
                )}
              </div>
            )}

            {wallet.isConnected && wallet.chainId !== '0x279F' && (
              <div className="mt-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <div className="text-sm text-yellow-600 dark:text-yellow-400 font-medium mb-2">
                  ⚠️ 请切换到 Monad Testnet 网络
                </div>
                <button
                  onClick={wallet.addMonadNetwork}
                  className="text-xs text-yellow-600 dark:text-yellow-400 underline hover:no-underline"
                >
                  点击切换网络
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Demo Selection */}
        {!activeDemo ? (
          <div className="max-w-5xl mx-auto">
            <h1 className="text-4xl font-bold mb-4 text-center">
              选择演示场景
            </h1>
            <p className="text-center text-gray-600 dark:text-gray-400 mb-12">
              体验 MonadFlow TCC 协议在不同场景下的应用
            </p>

            <div className="grid md:grid-cols-3 gap-6">
              {/* AI Generation */}
              <button
                onClick={() => setActiveDemo('ai')}
                className="p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition text-left group"
              >
                <div className="text-6xl mb-4 group-hover:scale-110 transition">🎨</div>
                <h3 className="text-2xl font-bold mb-2">AI 图片生成</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  防止算力白嫖的 Pay-to-Gen 服务
                </p>
                <div className="flex items-center text-purple-600 dark:text-purple-400">
                  <span>查看演示</span>
                  <span className="ml-2 group-hover:translate-x-2 transition">→</span>
                </div>
              </button>

              {/* Cross-Chain (Coming Soon) */}
              <div className="p-8 bg-gray-100 dark:bg-gray-700/50 rounded-2xl shadow opacity-50 cursor-not-allowed">
                <div className="text-6xl mb-4">🌉</div>
                <h3 className="text-2xl font-bold mb-2">跨链代购</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Monad 支付，全链消费
                </p>
                <div className="text-gray-500">
                  即将推出
                </div>
              </div>

              {/* API Gateway (Coming Soon) */}
              <div className="p-8 bg-gray-100 dark:bg-gray-700/50 rounded-2xl shadow opacity-50 cursor-not-allowed">
                <div className="text-6xl mb-4">🔌</div>
                <h3 className="text-2xl font-bold mb-2">API 网关</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  链上结算的 API 服务
                </p>
                <div className="text-gray-500">
                  即将推出
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            <button
              onClick={() => setActiveDemo(null)}
              className="mb-8 px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
            >
              ← 返回选择
            </button>

            {activeDemo === 'ai' && <AIGenerationDemo />}
          </>
        )}
      </div>
    </div>
  );
}
