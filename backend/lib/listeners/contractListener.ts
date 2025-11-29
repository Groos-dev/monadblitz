// 合约事件监听器
import { ethers } from 'ethers';
import { config } from '../config';
import { processTransaction } from './transactionProcessor';

const MONAD_FLOW_ABI = [
  "event FundsLocked(bytes32 indexed txId, address indexed user, address indexed service, uint256 amount, uint256 timeout)",
  "function confirmTransaction(bytes32 txId, bytes32 resultHash, string memory tokenURI) external",
  "function confirmTransaction(bytes32 txId, bytes32 resultHash) external",
  "function cancelTransaction(bytes32 txId, string calldata reason) external",
];

let provider: ethers.JsonRpcProvider | null = null;
let contract: ethers.Contract | null = null;
let wallet: ethers.Wallet | null = null;
let isListening = false;
let pollingInterval: NodeJS.Timeout | null = null;
let lastBlockNumber = 0;
const processedTxIds = new Set<string>();

/**
 * 初始化合约监听器
 */
export async function initContractListener() {
  try {
    console.log('🔗 正在连接 Monad 测试网...');

    provider = new ethers.JsonRpcProvider(config.monadRpcUrl);
    contract = new ethers.Contract(config.contractAddress, MONAD_FLOW_ABI, provider);

    // 创建服务提供商钱包（用于确认/取消交易）
    wallet = new ethers.Wallet(config.servicePrivateKey, provider);
    console.log('💼 服务提供商地址:', wallet.address);

    // 验证余额
    const balance = await provider.getBalance(wallet.address);
    const balanceInEther = ethers.formatEther(balance);
    console.log('💰 服务提供商余额:', balanceInEther, 'MON');

    if (balance === 0n) {
      console.warn('⚠️  服务提供商余额为 0，可能无法确认交易');
    }

    return { provider, contract, wallet };
  } catch (error) {
    console.error('❌ 初始化合约监听器失败:', error);
    throw error;
  }
}

/**
 * 轮询查询新事件
 */
async function pollEvents() {
  if (!contract || !wallet || !provider) {
    return;
  }

  try {
    // 获取当前区块号
    const currentBlock = await provider.getBlockNumber();

    // 如果是第一次，从当前区块开始
    if (lastBlockNumber === 0) {
      lastBlockNumber = currentBlock;
      return; // 第一次不查询，只记录起始区块
    }

    // 只查询新的区块（从上次查询的下一个区块开始）
    const fromBlock = lastBlockNumber + 1;
    let toBlock = currentBlock;

    // 如果没有新区块，跳过
    if (fromBlock > toBlock) {
      return;
    }

    // 如果区块范围超过100，限制查询范围以避免 RPC 限制
    if (toBlock - fromBlock > 100) {
      console.log(`⚠️  区块范围过大 (${toBlock - fromBlock}), 限制为100个区块`);
      toBlock = fromBlock + 100;
      console.log(`📦 查询区块范围: ${fromBlock} - ${toBlock}`);
    }

    // 查询 FundsLocked 事件
    const filter = contract.filters.FundsLocked();
    const events = await contract.queryFilter(filter, fromBlock, toBlock);

    for (const event of events) {
      const txId = event.args[0] as string;

      // 跳过已处理的事件
      if (processedTxIds.has(txId)) {
        continue;
      }

      const user = event.args[1] as string;
      const service = event.args[2] as string;
      const amount = event.args[3] as bigint;
      const timeout = event.args[4] as bigint;

      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('🔔 收到 FundsLocked 事件');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📝 交易 ID:', txId);
      console.log('👤 用户地址:', user);
      console.log('💼 服务商地址:', service);
      console.log('💰 锁定金额:', ethers.formatEther(amount), 'MON');
      console.log('⏰ 超时时间:', timeout.toString(), '秒');

      // 获取区块时间戳作为 lockTime
      const block = await event.getBlock();
      const lockTime = Number(block.timestamp);
      console.log('🕐 锁定时间:', new Date(lockTime * 1000).toISOString());
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

      // 验证服务商地址
      if (service.toLowerCase() !== wallet.address.toLowerCase()) {
        console.log('⚠️  服务商地址不匹配，跳过处理');
        console.log('   期望:', wallet.address);
        console.log('   实际:', service);
        processedTxIds.add(txId); // 标记为已处理，避免重复
        continue;
      }

      // 标记为已处理
      processedTxIds.add(txId);

      // 处理交易（不等待完成，避免阻塞轮询）
      processTransaction(txId, user, amount, Number(timeout), lockTime).catch((error) => {
        console.error('❌ 处理交易失败:', error);
      });
    }

    // 更新最后处理的区块号
    lastBlockNumber = toBlock;
  } catch (error) {
    console.error('❌ 轮询事件失败:', error);
  }
}

/**
 * 开始监听 FundsLocked 事件（使用轮询方式）
 */
export async function startListening() {
  if (isListening) {
    console.log('⚠️  监听器已在运行');
    return;
  }

  try {
    await initContractListener();

    console.log('👂 开始监听 FundsLocked 事件（轮询模式）...');
    console.log('📍 合约地址:', config.contractAddress);

    if (!contract || !wallet || !provider) {
      throw new Error('合约、钱包或提供商未初始化');
    }

    // 获取初始区块号
    lastBlockNumber = await provider.getBlockNumber();
    console.log('📦 起始区块号:', lastBlockNumber);

    // 立即执行一次查询
    await pollEvents();

    // 每 5 秒轮询一次
    pollingInterval = setInterval(pollEvents, 5000);

    isListening = true;
    console.log('✅ 事件监听器已启动（轮询间隔: 5秒）\n');

  } catch (error) {
    console.error('❌ 启动监听器失败:', error);
    throw error;
  }
}

/**
 * 停止监听
 */
export function stopListening() {
  if (pollingInterval) {
    clearInterval(pollingInterval);
    pollingInterval = null;
  }
  isListening = false;
  lastBlockNumber = 0;
  processedTxIds.clear();
  console.log('🛑 已停止监听事件');
}

export { contract, wallet, provider };
