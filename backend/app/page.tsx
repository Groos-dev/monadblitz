import TransactionLog from '../components/TransactionLog';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">🚀 MonadFlow Backend Service</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Backend service is running. Monitoring real-time transactions on Monad Testnet.
          </p>
          <div className="flex gap-4 text-sm">
            <a
              href="/api/health"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              /api/health
            </a>
            <span className="text-gray-400">•</span>
            <a
              href="/api/status"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              /api/status
            </a>
          </div>
        </div>

        {/* Transaction Log */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 h-[calc(100vh-200px)]">
          <TransactionLog />
        </div>
      </div>
    </div>
  );
}
