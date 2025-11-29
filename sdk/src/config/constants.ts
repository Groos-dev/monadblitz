// SDK 常量配置

import { MonadNetworkConfig } from '../types';

// Monad Testnet 默认配置
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

// 默认合约地址
export const DEFAULT_CONTRACT_ADDRESS = '0x8AA865E227346122E734c7A4df5836Fd2Ab48218';

// MonadFlowController ABI
export const MONAD_FLOW_ABI = [
  // Events
  "event FundsLocked(bytes32 indexed txId, address indexed user, address indexed service, uint256 amount, uint256 timeout)",
  "event TransactionConfirmed(bytes32 indexed txId, bytes32 resultHash, uint256 timestamp)",
  "event TransactionCancelled(bytes32 indexed txId, string reason, uint256 timestamp)",

  // Functions
  "function lockFunds(address service, uint256 timeout) external payable returns (bytes32 txId)",
  "function confirmTransaction(bytes32 txId, bytes32 resultHash) external",
  "function cancelTransaction(bytes32 txId, string calldata reason) external",
  "function getTransaction(bytes32 txId) external view returns (tuple(address user, address service, uint256 amount, uint8 state, uint256 lockTime, uint256 timeout, bytes32 resultHash))",
  "function isTransactionTimeout(bytes32 txId) external view returns (bool)",
  "function batchGetStates(bytes32[] calldata txIds) external view returns (uint8[] memory)",
  "function withdrawServiceBalance() external",
  "function serviceBalances(address) external view returns (uint256)",
  "function platformFees() external view returns (uint256)",
] as const;
