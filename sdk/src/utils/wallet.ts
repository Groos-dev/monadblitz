// 钱包工具函数

/// <reference types="../types/ethereum" />

import { ethers } from 'ethers';
import { MONAD_TESTNET, MONAD_TESTNET_CHAIN_ID, MONAD_TESTNET_CHAIN_ID_HEX } from '../config/constants';
import type { WalletState, MetaMaskError } from '../types';

/**
 * 检查 MetaMask 是否安装
 */
export function isMetaMaskInstalled(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  return typeof window.ethereum !== 'undefined';
}

/**
 * 获取账户余额
 */
export async function getBalance(account: string, provider?: ethers.Provider): Promise<string> {
  if (typeof window === 'undefined' || !window.ethereum) {
    return '0';
  }

  try {
    let balance: bigint;
    
    if (provider) {
      balance = await provider.getBalance(account);
    } else {
      const balanceHex = await window.ethereum.request({
        method: 'eth_getBalance',
        params: [account, 'latest'],
      }) as string;
      balance = BigInt(balanceHex);
    }

    // 转换为 ether
    const balanceInEther = Number(balance) / 1e18;
    return balanceInEther.toString();
  } catch (err) {
    console.error('Error getting balance:', err);
    return '0';
  }
}

/**
 * 获取当前链 ID
 */
export async function getChainId(): Promise<string | null> {
  if (typeof window === 'undefined' || !window.ethereum) {
    return null;
  }

  try {
    const chainId = await window.ethereum.request({ method: 'eth_chainId' }) as string;
    return chainId;
  } catch (err) {
    console.error('Error getting chain ID:', err);
    return null;
  }
}

/**
 * 连接到钱包
 */
export async function connectWallet(): Promise<string[]> {
  if (!isMetaMaskInstalled()) {
    throw new Error('MetaMask is not installed. Please install MetaMask extension.');
  }

  if (!window.ethereum) {
    throw new Error('MetaMask is not available.');
  }

  try {
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts',
    }) as string[];
    return accounts;
  } catch (err) {
    const error = err as MetaMaskError;
    if (error.code === 4001) {
      throw new Error('Connection request was rejected.');
    }
    throw new Error(`Failed to connect: ${error.message}`);
  }
}

/**
 * 获取当前连接的账户
 */
export async function getCurrentAccounts(): Promise<string[]> {
  if (typeof window === 'undefined' || !window.ethereum) {
    return [];
  }

  try {
    const accounts = await window.ethereum.request({
      method: 'eth_accounts',
    }) as string[];
    return accounts;
  } catch (err) {
    console.error('Error getting accounts:', err);
    return [];
  }
}

/**
 * 获取钱包状态
 */
export async function getWalletState(provider?: ethers.Provider): Promise<WalletState> {
  const accounts = await getCurrentAccounts();
  
  if (accounts.length === 0) {
    return {
      account: null,
      balance: null,
      chainId: null,
      isConnected: false,
    };
  }

  const account = accounts[0];
  const balance = await getBalance(account, provider);
  const chainId = await getChainId();

  return {
    account,
    balance,
    chainId,
    isConnected: true,
  };
}

/**
 * 切换到 Monad Testnet 网络
 */
export async function switchToMonadNetwork(): Promise<boolean> {
  if (!isMetaMaskInstalled()) {
    throw new Error('MetaMask is not installed');
  }

  if (!window.ethereum) {
    throw new Error('MetaMask is not available');
  }

  try {
    // 先尝试直接切换
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: MONAD_TESTNET.chainId }],
      });
      return true;
    } catch (switchError: any) {
      // 如果网络不存在，则添加网络
      if (switchError.code === 4902 || switchError.code === -32603) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [MONAD_TESTNET],
          });
          return true;
        } catch (addError: any) {
          console.error('Failed to add network:', addError);
          throw new Error('无法添加 Monad Testnet 网络，请手动添加');
        }
      } else if (switchError.code === 4001) {
        throw new Error('用户拒绝了切换网络请求');
      } else {
        throw switchError;
      }
    }
  } catch (err: any) {
    console.error('Switch network error:', err);
    throw err;
  }
}

/**
 * 确保连接到正确的网络
 */
export async function ensureCorrectNetwork(): Promise<void> {
  if (!isMetaMaskInstalled()) {
    throw new Error('MetaMask is not installed');
  }

  if (!window.ethereum) {
    throw new Error('MetaMask is not available');
  }

  try {
    const chainIdHex = await window.ethereum.request({
      method: 'eth_chainId',
    }) as string;
    const currentChainId = parseInt(chainIdHex, 16);

    if (currentChainId !== MONAD_TESTNET_CHAIN_ID) {
      console.log(`当前网络: ${currentChainId}, 需要切换到: ${MONAD_TESTNET_CHAIN_ID}`);
      await switchToMonadNetwork();

      // 等待网络切换完成
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 再次验证
      const newChainIdHex = await window.ethereum.request({
        method: 'eth_chainId',
      }) as string;
      const newChainId = parseInt(newChainIdHex, 16);

      if (newChainId !== MONAD_TESTNET_CHAIN_ID) {
        throw new Error('网络切换失败，请手动切换到 Monad Testnet');
      }
    }
  } catch (err: any) {
    console.error('Network check error:', err);
    if (err.message) {
      throw err;
    }
    throw new Error('无法验证网络连接，请确保 MetaMask 已连接到 Monad Testnet');
  }
}
