// NFT 查询 Hook
import { useState, useCallback } from 'react';
import { ethers } from 'ethers';
import { CONTRACTS } from '@/config/monad';
import { MONAD_FLOW_NFT_ABI } from '@/config/contract-abi';

export interface NFTInfo {
  tokenId: string;
  tokenURI: string;
  owner: string;
  txId: string;
}

export const useNFT = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 获取合约实例
  const getNFTContract = useCallback(async () => {
    if (!window.ethereum) {
      throw new Error('请安装 MetaMask');
    }

    if (!CONTRACTS.MonadFlowNFT) {
      throw new Error('NFT 合约地址未配置');
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    return new ethers.Contract(CONTRACTS.MonadFlowNFT, MONAD_FLOW_NFT_ABI, provider);
  }, []);

  // 根据交易 ID 获取 NFT Token ID
  const getTokenIdByTxId = useCallback(async (txId: string): Promise<string | null> => {
    try {
      const contract = await getNFTContract();
      const tokenId = await contract.getTokenIdByTxId(txId);
      return tokenId.toString() === '0' ? null : tokenId.toString();
    } catch (err: any) {
      console.error('Get token ID error:', err);
      return null;
    }
  }, [getNFTContract]);

  // 获取 NFT 信息
  const getNFTInfo = useCallback(async (tokenId: string): Promise<NFTInfo | null> => {
    try {
      setLoading(true);
      setError(null);

      const contract = await getNFTContract();

      const [tokenURI, owner, txId] = await Promise.all([
        contract.tokenURI(tokenId),
        contract.ownerOf(tokenId),
        contract.tokenToTxId(tokenId),
      ]);

      return {
        tokenId,
        tokenURI,
        owner,
        txId: ethers.hexlify(txId),
      };
    } catch (err: any) {
      console.error('Get NFT info error:', err);
      setError(err.message || '获取 NFT 信息失败');
      return null;
    } finally {
      setLoading(false);
    }
  }, [getNFTContract]);

  // 获取用户拥有的所有 NFT
  const getUserNFTs = useCallback(async (userAddress: string): Promise<NFTInfo[]> => {
    try {
      setLoading(true);
      setError(null);

      const contract = await getNFTContract();
      const balance = await contract.balanceOf(userAddress);

      // 注意：这里需要遍历所有 token，但 ERC721 没有直接的枚举方法
      // 实际项目中可以使用事件日志或索引服务
      // 这里简化处理，只返回总数
      console.log(`用户拥有 ${balance.toString()} 个 NFT`);

      return [];
    } catch (err: any) {
      console.error('Get user NFTs error:', err);
      setError(err.message || '获取用户 NFT 失败');
      return [];
    } finally {
      setLoading(false);
    }
  }, [getNFTContract]);

  return {
    loading,
    error,
    getTokenIdByTxId,
    getNFTInfo,
    getUserNFTs,
  };
};
