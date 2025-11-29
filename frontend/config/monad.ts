import { MonadNetworkConfig } from '@/types';

export const MONAD_TESTNET: MonadNetworkConfig = {
  chainId: '0x279F', // 10143 in hex
  chainName: 'Monad Testnet',
  nativeCurrency: {
    name: 'Monad',
    symbol: 'MON',
    decimals: 18,
  },
  rpcUrls: ['https://testnet-rpc.monad.xyz'],
  blockExplorerUrls: ['https://testnet.monadexplorer.com'],
};

export const MONAD_TESTNET_CHAIN_ID = 10143;
export const MONAD_TESTNET_CHAIN_ID_HEX = '0x279F';

// 合约地址配置
export const CONTRACTS = {
  MonadFlowController: '0x386DcCcDd27870636848745394A139D44aF96403',
  MonadFlowNFT: '0xFCdF7798E0315D02A63306F2545CB8bd67F5BaE1',
};

// 服务提供商地址配置
export const SERVICE_PROVIDER = {
  // 平台服务商收款地址
  address: '0xc66B6bC7955f3572748905c5Ba724021c6bfFe15',
  // 服务商名称（用于显示）
  name: 'MonadFlow AI Service',
};
