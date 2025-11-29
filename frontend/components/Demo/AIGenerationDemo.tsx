'use client';

import { useState } from 'react';
import { useWallet } from '@/lib/hooks/useWallet';
import { useMonadFlow } from '@/lib/hooks/useMonadFlow';
import { TCCStep } from '@/types';
import { getTCCSteps, simulateTCCFlow } from '@/lib/mock/tcc-flow';
import { mockAIPrompts } from '@/lib/mock/ai-service';

// Mock 图片（实际项目中可以替换为真实 AI 生成）
const MOCK_AI_IMAGES = [
  'https://picsum.photos/seed/monad1/512/512',
  'https://picsum.photos/seed/monad2/512/512',
  'https://picsum.photos/seed/monad3/512/512',
  'https://picsum.photos/seed/monad4/512/512',
];

export default function AIGenerationDemo() {
  const wallet = useWallet();
  const monadFlow = useMonadFlow();

  const [prompt, setPrompt] = useState(mockAIPrompts[0]);
  const [steps, setSteps] = useState<TCCStep[]>(getTCCSteps('ai'));
  const [currentStep, setCurrentStep] = useState(-1);
  const [txId, setTxId] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  // 服务提供商地址（演示用，实际应该是真实的服务商地址）
  const SERVICE_ADDRESS = '0x1234567890123456789012345678901234567890';
  const LOCK_AMOUNT = '0.1'; // 0.1 MON
  const TIMEOUT = 300; // 5分钟

  const handleStartDemo = async () => {
    if (!wallet.isConnected) {
      alert('请先连接钱包');
      return;
    }

    setIsRunning(true);
    setCurrentStep(0);
    setResultImage(null);

    try {
      // Step 1: Try - 用户发起请求
      const updatedSteps = [...steps];
      updatedSteps[0].status = 'active';
      setSteps([...updatedSteps]);
      await new Promise(resolve => setTimeout(resolve, 1000));
      updatedSteps[0].status = 'completed';
      setSteps([...updatedSteps]);

      // Step 2: Lock - 锁定资金（真实合约交互）
      setCurrentStep(1);
      updatedSteps[1].status = 'active';
      setSteps([...updatedSteps]);

      console.log('开始锁定资金...');
      const transactionId = await monadFlow.lockFunds(
        SERVICE_ADDRESS,
        LOCK_AMOUNT,
        TIMEOUT
      );

      console.log('资金锁定成功，交易ID:', transactionId);
      setTxId(transactionId);

      updatedSteps[1].status = 'completed';
      updatedSteps[1].txHash = transactionId;
      setSteps([...updatedSteps]);

      // Step 3: Execute - 模拟 AI 生成
      setCurrentStep(2);
      updatedSteps[2].status = 'active';
      setSteps([...updatedSteps]);

      console.log('模拟 AI 生成中...');
      await new Promise(resolve => setTimeout(resolve, 3000)); // 模拟生成时间

      const mockImage = MOCK_AI_IMAGES[Math.floor(Math.random() * MOCK_AI_IMAGES.length)];
      setResultImage(mockImage);

      updatedSteps[2].status = 'completed';
      setSteps([...updatedSteps]);

      // Step 4: Confirm - 确认交易（真实合约交互）
      setCurrentStep(3);
      updatedSteps[3].status = 'active';
      setSteps([...updatedSteps]);

      // 模拟 IPFS hash
      const mockIPFSHash = `QmHash${Date.now()}`;
      console.log('确认交易，结果hash:', mockIPFSHash);

      // 注意：实际场景中，这应该由服务提供商调用
      // 这里为了演示，我们模拟了这个步骤
      await new Promise(resolve => setTimeout(resolve, 2000));

      updatedSteps[3].status = 'completed';
      setSteps([...updatedSteps]);

      // Step 5: Complete
      setCurrentStep(4);
      updatedSteps[4].status = 'active';
      setSteps([...updatedSteps]);

      await new Promise(resolve => setTimeout(resolve, 1000));

      updatedSteps[4].status = 'completed';
      setSteps([...updatedSteps]);

      console.log('演示完成！');

    } catch (error: any) {
      console.error('演示失败:', error);
      alert(`演示失败: ${error.message || '未知错误'}`);

      const updatedSteps = [...steps];
      if (currentStep >= 0) {
        updatedSteps[currentStep].status = 'failed';
        setSteps([...updatedSteps]);
      }
    } finally {
      setIsRunning(false);
    }
  };

  const handleReset = () => {
    setSteps(getTCCSteps('ai'));
    setCurrentStep(-1);
    setTxId(null);
    setResultImage(null);
    setIsRunning(false);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold mb-2">🎨 AI 图片生成演示</h2>
        <p className="text-gray-600 dark:text-gray-400">
          体验基于 TCC 协议的防白嫖 AI 服务
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Left: Input & Control */}
        <div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-6">
            <h3 className="text-xl font-bold mb-4">生成设置</h3>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Prompt
              </label>
              <select
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                disabled={isRunning}
                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              >
                {mockAIPrompts.map((p, i) => (
                  <option key={i} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <div className="mb-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span>价格:</span>
                  <span className="font-bold">{LOCK_AMOUNT} MON</span>
                </div>
                <div className="flex justify-between">
                  <span>超时:</span>
                  <span className="font-bold">{TIMEOUT / 60} 分钟</span>
                </div>
                <div className="flex justify-between">
                  <span>服务商:</span>
                  <span className="font-mono text-xs">{SERVICE_ADDRESS.slice(0, 10)}...</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleStartDemo}
              disabled={isRunning || !wallet.isConnected || monadFlow.loading}
              className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-bold"
            >
              {isRunning ? '生成中...' : '🚀 开始生成'}
            </button>

            {txId && (
              <button
                onClick={handleReset}
                disabled={isRunning}
                className="w-full mt-2 px-6 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
              >
                重置演示
              </button>
            )}
          </div>

          {/* Result Image */}
          {resultImage && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
              <h3 className="text-xl font-bold mb-4">✨ 生成结果</h3>
              <img
                src={resultImage}
                alt="AI Generated"
                className="w-full rounded-lg shadow-lg"
              />
              <p className="mt-4 text-sm text-gray-600 dark:text-gray-400 text-center">
                📌 实际项目中，这里会显示真实的 AI 生成图片
              </p>
            </div>
          )}
        </div>

        {/* Right: TCC Flow */}
        <div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
            <h3 className="text-xl font-bold mb-6">TCC 流程</h3>

            <div className="space-y-4">
              {steps.map((step, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-2 transition ${
                    step.status === 'completed'
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                      : step.status === 'active'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 animate-pulse'
                      : step.status === 'failed'
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-2xl">
                          {step.status === 'completed' ? '✓' :
                           step.status === 'active' ? '⏳' :
                           step.status === 'failed' ? '✗' : '○'}
                        </span>
                        <h4 className="font-bold">{step.name}</h4>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {step.description}
                      </p>
                      {step.txHash && (
                        <p className="text-xs text-purple-600 dark:text-purple-400 mt-1 font-mono">
                          TX: {step.txHash.slice(0, 20)}...
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {txId && (
              <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <div className="text-sm">
                  <div className="font-bold mb-1">交易 ID:</div>
                  <div className="font-mono text-xs break-all text-purple-600 dark:text-purple-400">
                    {txId}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
        <h4 className="font-bold mb-2">💡 演示说明</h4>
        <ul className="text-sm space-y-1 text-gray-700 dark:text-gray-300">
          <li>• 点击"开始生成"后，会在 Monad 测试网上锁定 {LOCK_AMOUNT} MON</li>
          <li>• 资金锁定后，模拟 AI 服务开始生成图片</li>
          <li>• 生成完成后，服务商确认交易并自动结算</li>
          <li>• 全程受智能合约保护，确保双方权益</li>
          <li>• 🎨 图片为 Mock 数据，演示 TCC 流程</li>
        </ul>
      </div>
    </div>
  );
}
