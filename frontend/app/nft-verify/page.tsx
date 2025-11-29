'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ethers } from 'ethers';
import { useWallet } from '@/lib/hooks/useWallet';
import { useNFT, NFTInfo } from '@/lib/hooks/useNFT';
import { CONTRACTS } from '@/config/monad';
import { formatAddress } from '@/lib/utils/formatters';

// 将 IPFS URI 转换为可访问的 URL
function getIPFSImageUrl(tokenURI: string): string | null {
  if (!tokenURI) return null;

  // 处理 ipfs:// 格式
  if (tokenURI.startsWith('ipfs://')) {
    const hash = tokenURI.replace('ipfs://', '');
    return `https://ipfs.io/ipfs/${hash}`;
  }

  // 处理 https://ipfs.io/ipfs/ 格式
  if (tokenURI.startsWith('https://ipfs.io/ipfs/')) {
    return tokenURI;
  }

  // 处理其他格式
  return tokenURI;
}

export default function NFTVerifyPage() {
  const wallet = useWallet();
  const nft = useNFT();

  const [searchType, setSearchType] = useState<'txId' | 'tokenId'>('txId');
  const [searchValue, setSearchValue] = useState('');
  const [nftInfo, setNftInfo] = useState<NFTInfo | null>(null);
  const [totalSupply, setTotalSupply] = useState<string | null>(null);
  const [nftName, setNftName] = useState<string | null>(null);
  const [nftSymbol, setNftSymbol] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);

  // 获取 NFT 合约基本信息
  useEffect(() => {
    async function fetchContractInfo() {
      if (!CONTRACTS.MonadFlowNFT || !window.ethereum) return;

      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const { MONAD_FLOW_NFT_ABI } = await import('@/config/contract-abi');
        const contract = new ethers.Contract(CONTRACTS.MonadFlowNFT, MONAD_FLOW_NFT_ABI, provider);

        const [name, symbol, supply] = await Promise.all([
          contract.name(),
          contract.symbol(),
          contract.totalSupply(),
        ]);

        setNftName(name);
        setNftSymbol(symbol);
        setTotalSupply(supply.toString());
      } catch (err) {
        console.error('Failed to fetch contract info:', err);
      }
    }

    fetchContractInfo();
  }, []);

  // 处理搜索
  const handleSearch = async () => {
    if (!searchValue.trim()) {
      alert('请输入搜索值');
      return;
    }

    try {
      setNftInfo(null);
      setImageUrl(null);
      setImageError(false);

      if (searchType === 'txId') {
        // 通过交易ID查询
        const txId = searchValue.trim();
        // 确保 txId 是有效的 bytes32 格式
        let formattedTxId = txId;
        if (!txId.startsWith('0x')) {
          formattedTxId = '0x' + txId;
        }

        const tokenId = await nft.getTokenIdByTxId(formattedTxId);
        if (!tokenId) {
          alert('未找到该交易ID对应的NFT');
          return;
        }

        const info = await nft.getNFTInfo(tokenId);
        setNftInfo(info);
      } else {
        // 通过Token ID查询
        const tokenId = searchValue.trim();
        const info = await nft.getNFTInfo(tokenId);
        if (!info) {
          alert('未找到该Token ID对应的NFT');
          return;
        }
        setNftInfo(info);
      }
    } catch (err: any) {
      console.error('Search error:', err);
      alert(err.message || '查询失败');
    }
  };

  // 当获取到NFT信息后，尝试加载图片
  useEffect(() => {
    if (nftInfo?.tokenURI) {
      const url = getIPFSImageUrl(nftInfo.tokenURI);
      if (url) {
        setImageUrl(url);
        setImageError(false);
      }
    }
  }, [nftInfo]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <Link
            href="/"
            className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent"
          >
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
                </div>
                <button
                  onClick={wallet.disconnect}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                >
                  断开
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
            <h1 className="text-3xl font-bold mb-2">🎨 NFT 验证工具</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              验证 MonadFlow NFT 的铸造状态和详细信息
            </p>

            {/* Contract Info */}
            {!CONTRACTS.MonadFlowNFT ? (
              <div className="mb-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border-2 border-yellow-500">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">⚠️</span>
                  <h3 className="font-bold text-yellow-700 dark:text-yellow-400">
                    NFT 合约地址未配置
                  </h3>
                </div>
                <p className="text-sm text-yellow-600 dark:text-yellow-500">
                  请在 <code className="bg-yellow-100 dark:bg-yellow-900 px-2 py-1 rounded">frontend/config/monad.ts</code> 中配置 MonadFlowNFT 合约地址
                </p>
              </div>
            ) : (
              nftName && nftSymbol && totalSupply !== null && (
                <div className="mb-8 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">合约名称</div>
                      <div className="font-bold">{nftName}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">代币符号</div>
                      <div className="font-bold">{nftSymbol}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">总供应量</div>
                      <div className="font-bold">{totalSupply}</div>
                    </div>
                  </div>
                  <div className="mt-4 text-center">
                    <a
                      href={`https://testnet.monadexplorer.com/address/${CONTRACTS.MonadFlowNFT}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-purple-600 dark:text-purple-400 hover:underline"
                    >
                      在浏览器中查看合约 →
                    </a>
                  </div>
                </div>
              )
            )}

            {/* Search Section */}
            <div className="mb-8">
              <div className="flex gap-4 mb-4">
                <button
                  onClick={() => {
                    setSearchType('txId');
                    setSearchValue('');
                    setNftInfo(null);
                  }}
                  className={`px-4 py-2 rounded-lg transition ${
                    searchType === 'txId'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  通过交易ID查询
                </button>
                <button
                  onClick={() => {
                    setSearchType('tokenId');
                    setSearchValue('');
                    setNftInfo(null);
                  }}
                  className={`px-4 py-2 rounded-lg transition ${
                    searchType === 'tokenId'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  通过Token ID查询
                </button>
              </div>

              <div className="flex gap-4">
                <input
                  type="text"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder={searchType === 'txId' ? '输入交易ID (0x...)' : '输入Token ID'}
                  disabled={!CONTRACTS.MonadFlowNFT}
                  className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button
                  onClick={handleSearch}
                  disabled={nft.loading || !searchValue.trim() || !CONTRACTS.MonadFlowNFT}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {nft.loading ? '查询中...' : '查询'}
                </button>
              </div>
            </div>

            {/* Error Display */}
            {nft.error && (
              <div className="mb-8 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div className="text-red-600 dark:text-red-400 font-medium">
                  ❌ {nft.error}
                </div>
              </div>
            )}

            {/* NFT Info Display */}
            {nftInfo && (
              <div className="space-y-6">
                <div className="p-6 bg-green-50 dark:bg-green-900/20 rounded-lg border-2 border-green-500">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-3xl">✅</span>
                    <h2 className="text-2xl font-bold text-green-700 dark:text-green-400">
                      NFT 验证成功
                    </h2>
                  </div>
                  <p className="text-green-600 dark:text-green-400">
                    该 NFT 已成功铸造并存在于区块链上
                  </p>
                </div>

                {/* NFT Image */}
                {imageUrl && (
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h3 className="text-lg font-bold mb-4">🖼️ NFT 图片</h3>
                    <div className="flex justify-center">
                      {!imageError ? (
                        <img
                          src={imageUrl}
                          alt="NFT"
                          className="max-w-full max-h-96 rounded-lg shadow-lg"
                          onError={() => setImageError(true)}
                        />
                      ) : (
                        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                          <div className="text-4xl mb-2">🖼️</div>
                          <div>无法加载图片</div>
                          <div className="text-sm mt-2">Token URI: {nftInfo.tokenURI}</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* NFT Details */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                  <h3 className="text-lg font-bold mb-4">📋 NFT 详细信息</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-600">
                      <span className="text-gray-600 dark:text-gray-400">Token ID:</span>
                      <span className="font-mono font-bold">{nftInfo.tokenId}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-600">
                      <span className="text-gray-600 dark:text-gray-400">所有者地址:</span>
                      <span className="font-mono text-sm">{formatAddress(nftInfo.owner)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-600">
                      <span className="text-gray-600 dark:text-gray-400">交易ID:</span>
                      <span className="font-mono text-xs break-all">{nftInfo.txId}</span>
                    </div>
                    <div className="flex justify-between items-start py-2">
                      <span className="text-gray-600 dark:text-gray-400">Token URI:</span>
                      <div className="text-right flex-1 ml-4">
                        <div className="font-mono text-xs break-all mb-2">{nftInfo.tokenURI}</div>
                        {imageUrl && !imageError && (
                          <a
                            href={imageUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-purple-600 dark:text-purple-400 hover:underline"
                          >
                            查看原图 →
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Blockchain Links */}
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
                  <h3 className="text-lg font-bold mb-4">🔗 区块链浏览器</h3>
                  <div className="space-y-2">
                    {CONTRACTS.MonadFlowNFT && (
                      <a
                        href={`https://testnet.monadexplorer.com/address/${CONTRACTS.MonadFlowNFT}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block p-3 bg-white dark:bg-gray-800 rounded-lg hover:shadow-md transition"
                      >
                        <div className="flex justify-between items-center">
                          <span>查看 NFT 合约</span>
                          <span>→</span>
                        </div>
                      </a>
                    )}
                    <a
                      href={`https://testnet.monadexplorer.com/address/${nftInfo.owner}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-3 bg-white dark:bg-gray-800 rounded-lg hover:shadow-md transition"
                    >
                      <div className="flex justify-between items-center">
                        <span>查看所有者地址</span>
                        <span>→</span>
                      </div>
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* Empty State */}
            {!nftInfo && !nft.loading && (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <div className="text-6xl mb-4">🔍</div>
                <div className="text-lg">输入交易ID或Token ID开始查询</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
