// 配置管理
export const config = {
  servicePrivateKey: process.env.SERVICE_PRIVATE_KEY || '',
  monadRpcUrl: process.env.MONAD_RPC_URL || 'https://testnet-rpc.monad.xyz',
  contractAddress: process.env.CONTRACT_ADDRESS || '0x8AA865E227346122E734c7A4df5836Fd2Ab48218',
};

// 验证配置
export function validateConfig() {
  if (!config.servicePrivateKey || config.servicePrivateKey.includes('your_service_provider_private_key')) {
    console.warn('⚠️  警告: SERVICE_PRIVATE_KEY 未配置或使用占位符');
    console.log('💡 请在 backend/.env.local 文件中设置服务提供商的私钥');
    return false;
  }
  return true;
}
