// 初始化脚本 - 在服务启动时自动运行
import { startListening } from './listeners/contractListener';
import { validateConfig } from './config';

let isInitialized = false;

export async function initBackend() {
  if (isInitialized) {
    console.log('⚠️  Backend already initialized');
    return;
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🚀 MonadFlow Backend Service');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // 验证配置
  if (!validateConfig()) {
    console.error('❌ 配置验证失败，无法启动事件监听器');
    return;
  }

  // 启动事件监听
  try {
    await startListening();
    isInitialized = true;
  } catch (error) {
    console.error('❌ 启动监听器失败:', error);
  }
}

// 自动初始化（在服务端环境）
if (typeof window === 'undefined' && process.env.NEXT_RUNTIME === 'nodejs') {
  // 延迟初始化，确保环境变量已加载
  setTimeout(() => {
    initBackend().catch(console.error);
  }, 1000);
}
