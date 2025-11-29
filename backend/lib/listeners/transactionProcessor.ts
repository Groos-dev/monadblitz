// 交易处理器
import { ethers } from 'ethers';
import { generateImage } from '../services/imageService';
import { contract, wallet, provider } from './contractListener';

/**
 * 处理交易：生成图片并确认/取消
 */
export async function processTransaction(
  txId: string,
  user: string,
  amount: bigint,
  timeout: number,
  lockTime: number
) {
  console.log('🚀 开始处理交易:', txId);

  try {
    // Step 1: 生成图片（模拟，sleep 10秒）
    console.log('📸 开始生成图片...');
    const result = await generateImage('AI Generated Image', 10);

    // Step 2: 根据结果确认或取消交易
    if (result.success && result.ipfsHash) {
      await confirmTransaction(txId, result.ipfsHash);
    } else {
      await cancelTransaction(txId, result.error || '生成失败', lockTime, timeout);
    }

  } catch (error: any) {
    console.error('❌ 处理交易失败:', error);

    // 发生错误时取消交易
    try {
      await cancelTransaction(txId, `处理失败: ${error.message}`, lockTime, timeout);
    } catch (cancelError) {
      console.error('❌ 取消交易也失败:', cancelError);
    }
  }
}

/**
 * 确认交易（成功）
 */
async function confirmTransaction(txId: string, ipfsHash: string) {
  try {
    console.log('✅ 图片生成成功，确认交易...');
    console.log('📦 IPFS Hash:', ipfsHash);

    if (!contract || !wallet) {
      throw new Error('合约或钱包未初始化');
    }

    // 将 IPFS hash 转换为 bytes32
    const hashBytes = ethers.id(ipfsHash);

    // 构建 NFT tokenURI（使用 IPFS 格式）
    const tokenURI = `ipfs://${ipfsHash}`;

    // 使用服务提供商钱包调用 confirmTransaction（带 tokenURI 以铸造 NFT）
    const contractWithSigner = contract.connect(wallet);
    const tx = await contractWithSigner.confirmTransaction(txId, hashBytes, tokenURI);

    console.log('📝 确认交易已发送:', tx.hash);
    console.log('🎨 NFT TokenURI:', tokenURI);

    const receipt = await tx.wait();
    console.log('✅ 交易已确认!');
    console.log('📍 区块号:', receipt?.blockNumber);
    console.log('💸 服务提供商已收到资金');
    console.log('🎨 NFT 已自动铸造给用户\n');

  } catch (error) {
    console.error('❌ 确认交易失败:', error);
    throw error;
  }
}

/**
 * 取消交易（失败）
 * 注意：服务商取消需要等待超时，如果还没超时会等待
 */
async function cancelTransaction(txId: string, reason: string, lockTime: number, timeout: number) {
  try {
    console.log('❌ 图片生成失败，准备取消交易...');
    console.log('📝 失败原因:', reason);

    if (!contract || !wallet || !provider) {
      throw new Error('合约、钱包或提供商未初始化');
    }

    // 检查是否已超时（使用链上时间更准确）
    const currentBlock = await provider.getBlock('latest');
    if (!currentBlock) {
      throw new Error('无法获取当前区块');
    }

    const currentTime = Number(currentBlock.timestamp);
    const elapsed = currentTime - lockTime;
    const remaining = timeout - elapsed;

    if (remaining > 0) {
      console.log(`⏳ 服务商取消需要等待超时，还需等待约 ${remaining} 秒...`);
      console.log('💡 提示：根据合约规则，服务商取消交易需要等待超时');

      // 等待超时（加1秒缓冲）
      const waitTime = (remaining + 1) * 1000;
      console.log(`⏰ 等待 ${waitTime / 1000} 秒...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      console.log('✅ 超时时间已到，可以取消交易');
    }

    // 使用服务提供商钱包调用 cancelTransaction
    const contractWithSigner = contract.connect(wallet);
    const tx = await contractWithSigner.cancelTransaction(txId, reason);

    console.log('📝 取消交易已发送:', tx.hash);

    const receipt = await tx.wait();
    console.log('✅ 交易已取消，用户资金已退还');
    console.log('📍 区块号:', receipt?.blockNumber);
    console.log('💰 用户已收到退款\n');

  } catch (error: any) {
    console.error('❌ 取消交易失败:', error);

    // 如果是超时错误，提示用户手动取消
    if (error.message && error.message.includes('Not timeout')) {
      console.log('💡 提示：交易还未超时，用户可以在前端手动取消');
    }

    throw error;
  }
}
