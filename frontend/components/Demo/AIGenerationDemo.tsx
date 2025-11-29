'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@/lib/hooks/useWallet';
import { useMonadFlow } from '@/lib/hooks/useMonadFlow';
import { useNFT } from '@/lib/hooks/useNFT';
import { TCCStep } from '@/types';
import { getTCCSteps, simulateTCCFlow } from '@/lib/mock/tcc-flow';
import { mockAIPrompts } from '@/lib/mock/ai-service';
import { SERVICE_PROVIDER, CONTRACTS } from '@/config/monad';

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
  const nft = useNFT();

  const [prompt, setPrompt] = useState(mockAIPrompts[0]);
  const [steps, setSteps] = useState<TCCStep[]>(getTCCSteps('ai'));
  const [currentStep, setCurrentStep] = useState(-1);
  const [txId, setTxId] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [serviceWallet, setServiceWallet] = useState<typeof wallet | null>(null);
  const [useServiceWallet, setUseServiceWallet] = useState(false);
  const [nftTokenId, setNftTokenId] = useState<string | null>(null);
  const [nftInfo, setNftInfo] = useState<any>(null);
  const [checkingNFT, setCheckingNFT] = useState(false);

  // 服务提供商地址
  // 如果使用服务提供商钱包模式，则使用连接的钱包地址；否则使用配置的平台服务商地址
  const SERVICE_ADDRESS = useServiceWallet && serviceWallet?.account
    ? serviceWallet.account
    : SERVICE_PROVIDER.address;
  const LOCK_AMOUNT = '0.1'; // 0.1 MON
  const TIMEOUT = 300; // 5分钟

  // 轮询检查 NFT 是否已铸造
  useEffect(() => {
    // 检查 NFT 合约是否已部署
    if (!CONTRACTS.MonadFlowNFT || CONTRACTS.MonadFlowNFT === '') {
      console.log('⚠️ NFT 合约未部署，跳过 NFT 检查');
      return;
    }

    if (!txId || nftInfo) return;

    let intervalId: NodeJS.Timeout;
    let attempts = 0;
    const maxAttempts = 60; // 最多检查 60 次（5 分钟）

    const checkNFT = async () => {
      if (attempts >= maxAttempts) {
        console.log('⏰ NFT 检查超时');
        clearInterval(intervalId);
        setCheckingNFT(false);
        return;
      }

      attempts++;
      console.log(`🔍 检查 NFT (${attempts}/${maxAttempts})...`);

      try {
        const tokenId = await nft.getTokenIdByTxId(txId);
        if (tokenId) {
          console.log('✅ 找到 NFT Token ID:', tokenId);
          setNftTokenId(tokenId);

          const info = await nft.getNFTInfo(tokenId);
          if (info) {
            console.log('✅ NFT 信息:', info);
            setNftInfo(info);
            clearInterval(intervalId);
            setCheckingNFT(false);

            // 更新步骤 4（Complete）为已完成
            setSteps(prevSteps => {
              const updatedSteps = [...prevSteps];
              if (updatedSteps[4]) {
                updatedSteps[4].status = 'completed';
              }
              return updatedSteps;
            });
          }
        }
      } catch (error: any) {
        console.error('检查 NFT 失败:', error);
        // 如果是 NFT 合约未部署的错误，停止检查
        if (error.message && error.message.includes('NFT 合约未部署')) {
          console.log('⚠️ NFT 合约未部署，停止检查');
          clearInterval(intervalId);
          setCheckingNFT(false);
        }
      }
    };

    // 立即检查一次
    setCheckingNFT(true);
    checkNFT();

    // 每 5 秒检查一次
    intervalId = setInterval(checkNFT, 5000);

    return () => {
      clearInterval(intervalId);
      setCheckingNFT(false);
    };
  }, [txId, nftInfo, nft]);

  const handleStartDemo = async () => {
    if (!wallet.isConnected) {
      alert('请先连接钱包');
      return;
    }

    // 检查网络连接（支持多种格式：'0x279F' 或 10143）
    const currentChainId = wallet.chainId;
    console.log('🔍 当前网络 Chain ID:', currentChainId, typeof currentChainId);

    // 转换为数字进行比较（更可靠）
    let currentChainIdNum: number;
    if (typeof currentChainId === 'string') {
      if (currentChainId.startsWith('0x') || currentChainId.startsWith('0X')) {
        currentChainIdNum = parseInt(currentChainId, 16);
      } else {
        currentChainIdNum = parseInt(currentChainId, 10);
      }
    } else {
      currentChainIdNum = Number(currentChainId);
    }

    const isMonadTestnet = currentChainIdNum === 10143;
    console.log('🔍 网络检查结果:', { currentChainIdNum, isMonadTestnet, expected: 10143 });

    if (!isMonadTestnet) {
      const shouldSwitch = confirm(
        `当前未连接到 Monad Testnet 网络。\n\n当前网络: ${currentChainId} (${currentChainIdNum})\n需要网络: 0x279F (10143)\n\n是否自动切换到 Monad Testnet？\n\n（如果选择"取消"，请手动在 MetaMask 中切换网络）`
      );

      if (shouldSwitch) {
        try {
          await monadFlow.switchToMonadNetwork();
          // 等待网络切换
          await new Promise(resolve => setTimeout(resolve, 1500));
          // 刷新钱包状态
          window.location.reload();
          return;
        } catch (error: any) {
          alert(`网络切换失败: ${error.message || '未知错误'}\n\n请手动在 MetaMask 中切换到 Monad Testnet 网络`);
          return;
        }
      } else {
        return;
      }
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

      // 如果使用服务提供商钱包，则真实调用合约
      if (useServiceWallet && serviceWallet?.isConnected && txId) {
        try {
          // 注意：这里需要切换到服务提供商的钱包来调用 confirmTransaction
          // 为了演示，我们提示用户切换钱包
          alert('请切换到服务提供商钱包以确认交易\n\n在 MetaMask 中切换到服务提供商账户，然后点击"继续确认"');

          // 实际场景中，服务提供商会在后台自动调用
          // 这里为了演示，我们等待用户手动确认
          await new Promise(resolve => setTimeout(resolve, 2000));

          // 如果用户已经切换到服务提供商钱包，可以调用 confirmTransaction
          // const serviceMonadFlow = useMonadFlow(); // 需要基于服务提供商钱包创建新的实例
          // await serviceMonadFlow.confirmTransaction(txId, mockIPFSHash);

          console.log('服务提供商确认交易（演示模式）');
        } catch (error) {
          console.error('确认交易失败:', error);
          throw error;
        }
      } else {
        // 演示模式：说明这是服务提供商的操作
        console.log('服务提供商确认交易（模拟模式）');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

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
    setNftTokenId(null);
    setNftInfo(null);
    setCheckingNFT(false);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold mb-2">🎨 AI 图片生成演示</h2>
        <p className="text-gray-600 dark:text-gray-400">
          体验基于 TCC 协议的防白嫖 AI 服务
        </p>

        {/* 服务提供商钱包切换 */}
        <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg max-w-2xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="text-left">
              <p className="text-sm font-medium mb-1">💡 演示模式说明</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                TCC 流程需要两个角色：
                <br />• <strong>用户钱包</strong>：锁定资金（Try）
                <br />• <strong>服务提供商钱包</strong>：确认交易（Confirm）
              </p>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={useServiceWallet}
                onChange={(e) => {
                  setUseServiceWallet(e.target.checked);
                  if (e.target.checked && !serviceWallet) {
                    // 提示用户连接服务提供商钱包
                    alert('请连接服务提供商钱包\n\n在 MetaMask 中切换到服务提供商账户');
                  }
                }}
                className="w-4 h-4"
              />
              <span className="text-sm">使用服务提供商钱包</span>
            </label>
          </div>
          {useServiceWallet && serviceWallet?.account && (
            <p className="text-xs text-green-600 dark:text-green-400 mt-2">
              ✅ 服务提供商: {serviceWallet.account.slice(0, 10)}...
            </p>
          )}
        </div>
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
                title="选择 AI 生成提示词"
                aria-label="选择 AI 生成提示词"
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
                  <span className="font-mono text-xs" title={SERVICE_ADDRESS}>
                    {SERVICE_ADDRESS.slice(0, 10)}...
                  </span>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-gray-500">平台:</span>
                  <span className="text-xs text-gray-500">{SERVICE_PROVIDER.name}</span>
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

          {/* Result Image & NFT */}
          {(resultImage || nftInfo) && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
              <h3 className="text-xl font-bold mb-4">✨ 生成结果</h3>

              {resultImage && (
                <img
                  src={resultImage}
                  alt="AI Generated"
                  className="w-full rounded-lg shadow-lg mb-4"
                />
              )}

              {/* NFT 铸造状态 */}
              {checkingNFT && !nftInfo && (
                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="animate-spin">⏳</div>
                    <h4 className="font-bold">正在铸造 NFT...</h4>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    后端服务正在确认交易并铸造 NFT，请稍候...
                  </p>
                </div>
              )}

              {nftInfo && (
                <div className="mt-4 p-6 bg-gradient-to-br from-green-50 via-purple-50 to-pink-50 dark:from-green-900/20 dark:via-purple-900/20 dark:to-pink-900/20 rounded-xl border-2 border-green-400 dark:border-green-600 shadow-lg">
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <span className="text-4xl animate-bounce">🎉</span>
                    <h4 className="text-xl font-bold text-green-700 dark:text-green-300">NFT 铸造成功！</h4>
                    <span className="text-4xl animate-bounce">✨</span>
                  </div>

                  <div className="text-center mb-4 p-3 bg-white dark:bg-gray-800 rounded-lg">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">您的 AI 艺术作品已永久上链</div>
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      Token #{nftInfo.tokenId}
                    </div>
                  </div>

                  <div className="text-sm space-y-2">
                    <div className="p-3 bg-white dark:bg-gray-800 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400">所有者:</span>
                        <span className="font-mono text-xs font-semibold" title={nftInfo.owner}>
                          {nftInfo.owner.slice(0, 6)}...{nftInfo.owner.slice(-4)}
                        </span>
                      </div>
                    </div>
                    <div className="p-3 bg-white dark:bg-gray-800 rounded-lg">
                      <div className="text-gray-600 dark:text-gray-400 mb-2 text-center">Token URI:</div>
                      <div className="font-mono text-xs break-all text-purple-600 dark:text-purple-400 text-center">
                        {nftInfo.tokenURI}
                      </div>
                    </div>
                    {CONTRACTS.MonadFlowNFT && (
                      <div className="pt-3 space-y-2">
                        <a
                          href={`https://testnet.monadexplorer.com/address/${CONTRACTS.MonadFlowNFT}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-center py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition font-medium"
                        >
                          🔗 在区块链浏览器中查看 NFT
                        </a>
                        <a
                          href="/nft-verify"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-center py-2 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg transition font-medium"
                        >
                          🔍 验证 NFT 详情
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {!nftInfo && !checkingNFT && resultImage && (
                <>
                  {!CONTRACTS.MonadFlowNFT || CONTRACTS.MonadFlowNFT === '' ? (
                    <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-300 dark:border-yellow-700">
                      <div className="flex items-start gap-2">
                        <span className="text-xl">⚠️</span>
                        <div className="flex-1">
                          <h4 className="font-bold text-yellow-800 dark:text-yellow-200 mb-1">
                            NFT 合约未部署
                          </h4>
                          <p className="text-xs text-yellow-700 dark:text-yellow-300 mb-2">
                            当前部署的合约版本不支持 NFT 铸造功能。
                          </p>
                          <p className="text-xs text-yellow-700 dark:text-yellow-300 font-mono bg-yellow-100 dark:bg-yellow-900/30 p-2 rounded">
                            cd contracts && npx hardhat run scripts/deploy.ts --network monadTestnet
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="mt-4 text-sm text-gray-600 dark:text-gray-400 text-center">
                      📌 等待后端确认交易并铸造 NFT...
                    </p>
                  )}
                </>
              )}
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
          <li>• <strong>用户钱包</strong>：点击"开始生成"后，会在 Monad 测试网上锁定 {LOCK_AMOUNT} MON</li>
          <li>• <strong>资金锁定</strong>：资金锁定后，模拟 AI 服务开始生成图片</li>
          <li>• <strong>服务提供商</strong>：生成完成后，服务商使用自己的钱包确认交易并自动结算</li>
          <li>• <strong>安全保障</strong>：全程受智能合约保护，确保双方权益</li>
          <li>• 🎨 <strong>演示数据</strong>：图片为 Mock 数据，演示 TCC 流程</li>
        </ul>
        <div className="mt-4 p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
          <p className="text-xs font-medium">📌 演示提示：</p>
          <p className="text-xs mt-1">
            完整演示需要两个钱包账户：
            <br />1. 用户账户（当前连接）→ 锁定资金
            <br />2. 服务提供商账户 → 确认交易
            <br />可以在 MetaMask 中切换账户来模拟两个角色
          </p>
        </div>
      </div>
    </div>
  );
}
