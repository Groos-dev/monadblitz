import { MonadNetworkConfig } from '@/types';

export const MONAD_TESTNET: MonadNetworkConfig = {
  chainId: '0x279F', // 10143 in hex
  chainName: 'Monad Testnet',
  nativeCurrency: {
    name: 'Monad',
    symbol: 'MON',
    decimals: 18,
  },
  rpcUrls: ['https://testnet-rpc.monad.xyz/'],
  blockExplorerUrls: ['https://testnet.monadexplorer.com'],
};

export const MONAD_TESTNET_CHAIN_ID = 10143;
export const MONAD_TESTNET_CHAIN_ID_HEX = '0x279F';

// 合约地址配置 (部署后更新)
export const CONTRACTS = {
  MonadFlowController: '0x8AA865E227346122E734c7A4df5836Fd2Ab48218', // TODO: 部署后更新
};
