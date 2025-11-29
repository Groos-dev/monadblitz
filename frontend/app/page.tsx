import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            MonadFlow Protocol
          </h1>
          <p className="text-2xl text-gray-600 dark:text-gray-300 mb-2">
            通用原子化支付基础设施
          </p>
          <p className="text-lg text-gray-500 dark:text-gray-400">
            基于 TCC 范式，连接链上资金与链下服务
          </p>
        </div>

        {/* Core Value */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
            <h2 className="text-3xl font-bold mb-6 text-center">解决 Web3 的"最后一公里"</h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-6 bg-red-50 dark:bg-red-900/20 rounded-xl">
                <div className="text-4xl mb-2">❌</div>
                <h3 className="font-bold mb-2">传统方式的问题</h3>
                <ul className="text-sm space-y-1 text-gray-700 dark:text-gray-300">
                  <li>• 先付后享 → 用户风险</li>
                  <li>• 先享后付 → 商家风险</li>
                  <li>• 无法保证原子性</li>
                </ul>
              </div>

              <div className="p-6 bg-green-50 dark:bg-green-900/20 rounded-xl">
                <div className="text-4xl mb-2">✅</div>
                <h3 className="font-bold mb-2">MonadFlow 方案</h3>
                <ul className="text-sm space-y-1 text-gray-700 dark:text-gray-300">
                  <li>• Try-Confirm-Cancel</li>
                  <li>• 双方零风险</li>
                  <li>• 原子化保证</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* TCC Flow */}
        <div className="max-w-5xl mx-auto mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">TCC 流程</h2>

          <div className="grid md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
              <div className="text-4xl mb-3">🔒</div>
              <h3 className="font-bold mb-2">Try</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                用户锁定资金
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
              <div className="text-4xl mb-3">⚡</div>
              <h3 className="font-bold mb-2">Execute</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                链下服务执行
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
              <div className="text-4xl mb-3">✓</div>
              <h3 className="font-bold mb-2">Confirm</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                提交证明结算
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
              <div className="text-4xl mb-3">🎁</div>
              <h3 className="font-bold mb-2">Complete</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                资产交付用户
              </p>
            </div>
          </div>
        </div>

        {/* Demo Link */}
        <div className="text-center mb-16">
          <Link
            href="/demo"
            className="inline-block px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-lg font-bold rounded-xl hover:from-purple-700 hover:to-blue-700 transition shadow-lg hover:shadow-xl"
          >
            🚀 查看实时演示
          </Link>
        </div>

        {/* Why Monad */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-2xl shadow-xl p-8">
            <h2 className="text-3xl font-bold mb-6 text-center">为什么选择 Monad?</h2>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-5xl mb-2">⚡</div>
                <h3 className="font-bold mb-2">极速最终性</h3>
                <p className="text-sm opacity-90">
                  1秒出块，TCC 流程几乎无感
                </p>
              </div>

              <div className="text-center">
                <div className="text-5xl mb-2">💰</div>
                <h3 className="font-bold mb-2">超低 Gas</h3>
                <p className="text-sm opacity-90">
                  微支付成为可能
                </p>
              </div>

              <div className="text-center">
                <div className="text-5xl mb-2">🔄</div>
                <h3 className="font-bold mb-2">10,000 TPS</h3>
                <p className="text-sm opacity-90">
                  支持大规模应用
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Use Cases */}
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">应用场景</h2>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition">
              <div className="text-4xl mb-3">🎨</div>
              <h3 className="font-bold mb-2">AI 生成服务</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                防止算力白嫖，确保服务交付
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition">
              <div className="text-4xl mb-3">🌉</div>
              <h3 className="font-bold mb-2">跨链代购</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Monad 支付，全链消费
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition">
              <div className="text-4xl mb-3">🔌</div>
              <h3 className="font-bold mb-2">API 网关</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                链上结算，杜绝坏账
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
