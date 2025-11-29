'use client';

import { useEffect, useState, useRef } from 'react';

interface TransactionLog {
  id: string;
  timestamp: Date;
  type: 'lock' | 'confirm' | 'cancel' | 'timeout';
  user: string;
  service: string;
  amount: string;
  txHash: string;
}

// 生成随机地址
function generateAddress(): string {
  return '0x' + Array.from({ length: 40 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join('');
}

// 生成随机交易哈希
function generateTxHash(): string {
  return '0x' + Array.from({ length: 64 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join('');
}

// 生成随机金额（0.1 - 10 MON）
function generateAmount(): string {
  return (Math.random() * 9.9 + 0.1).toFixed(4);
}

// 生成模拟交易日志
function generateMockLog(): TransactionLog {
  const types: Array<'lock' | 'confirm' | 'cancel' | 'timeout'> =
    ['lock', 'confirm', 'cancel', 'timeout'];
  const type = types[Math.floor(Math.random() * types.length)];

  return {
    id: Math.random().toString(36).substring(7),
    timestamp: new Date(),
    type,
    user: generateAddress(),
    service: generateAddress(),
    amount: generateAmount(),
    txHash: generateTxHash(),
  };
}

// 格式化时间
function formatTime(date: Date): string {
  return date.toLocaleTimeString('zh-CN', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

// 格式化地址
function formatAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

// 获取交易类型图标和颜色
function getTypeInfo(type: TransactionLog['type']) {
  switch (type) {
    case 'lock':
      return { icon: '🔒', color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' };
    case 'confirm':
      return { icon: '✅', color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20' };
    case 'cancel':
      return { icon: '❌', color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20' };
    case 'timeout':
      return { icon: '⏰', color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20' };
  }
}

// 获取交易类型文本
function getTypeText(type: TransactionLog['type']): string {
  switch (type) {
    case 'lock':
      return '锁定资金';
    case 'confirm':
      return '确认交易';
    case 'cancel':
      return '取消交易';
    case 'timeout':
      return '交易超时';
  }
}

export default function TransactionLog() {
  const [logs, setLogs] = useState<TransactionLog[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isScrolling, setIsScrolling] = useState(true);

  // 初始化：生成50条历史日志
  useEffect(() => {
    const initialLogs = Array.from({ length: 50 }, () => generateMockLog());
    // 设置不同的时间戳，模拟历史记录
    initialLogs.forEach((log, index) => {
      log.timestamp = new Date(Date.now() - (50 - index) * 2000);
    });
    setLogs(initialLogs);
  }, []);

  // 定期添加新日志
  useEffect(() => {
    const interval = setInterval(() => {
      setLogs(prev => {
        const newLog = generateMockLog();
        const updated = [...prev, newLog];
        // 保持最多200条日志
        return updated.slice(-200);
      });
    }, Math.random() * 2000 + 1000); // 1-3秒随机间隔

    return () => clearInterval(interval);
  }, []);

  // 自动滚动到底部
  useEffect(() => {
    if (isScrolling && scrollContainerRef.current) {
      // 使用 requestAnimationFrame 确保 DOM 更新后再滚动
      requestAnimationFrame(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTo({
            top: scrollContainerRef.current.scrollHeight,
            behavior: 'smooth',
          });
        }
      });
    }
  }, [logs, isScrolling]);

  // 处理滚动事件
  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    // 如果用户滚动到接近底部，恢复自动滚动
    setIsScrolling(scrollHeight - scrollTop - clientHeight < 100);
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">实时交易日志</h2>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span className={`w-2 h-2 rounded-full ${isScrolling ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></span>
          <span>{logs.length} 条记录</span>
        </div>
      </div>

      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto space-y-2 pr-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent"
        style={{
          scrollBehavior: 'smooth',
        }}
      >
        {logs.map((log, index) => {
          const typeInfo = getTypeInfo(log.type);
          return (
            <div
              key={`${log.id}-${index}`}
              className={`p-3 rounded-lg border transition-all ${
                typeInfo.bg
              } border-gray-200 dark:border-gray-700 hover:shadow-md`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <span className="text-2xl flex-shrink-0">{typeInfo.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`font-semibold ${typeInfo.color}`}>
                        {getTypeText(log.type)}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatTime(log.timestamp)}
                      </span>
                    </div>
                    <div className="text-sm space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600 dark:text-gray-400">用户:</span>
                        <span className="font-mono text-xs">{formatAddress(log.user)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600 dark:text-gray-400">服务商:</span>
                        <span className="font-mono text-xs">{formatAddress(log.service)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600 dark:text-gray-400">金额:</span>
                        <span className="font-semibold text-purple-600 dark:text-purple-400">
                          {log.amount} MON
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600 dark:text-gray-400">TX:</span>
                        <span className="font-mono text-xs text-gray-700 dark:text-gray-300">
                          {formatAddress(log.txHash)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
