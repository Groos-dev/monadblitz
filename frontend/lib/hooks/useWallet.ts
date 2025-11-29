import { useState, useEffect, useCallback } from 'react';
import { WalletState, MetaMaskError } from '@/types';
import { MONAD_TESTNET, MONAD_TESTNET_CHAIN_ID_HEX } from '@/config/monad';

export const useWallet = () => {
  const [walletState, setWalletState] = useState<WalletState>({
    account: null,
    balance: null,
    chainId: null,
    isConnected: false,
    isLoading: false,
  });
  const [error, setError] = useState<string | null>(null);
  // 使用 state 存储 MetaMask 安装状态，避免 hydration 错误
  const [isMetaMaskInstalled, setIsMetaMaskInstalled] = useState<boolean>(false);

  // 在客户端检查 MetaMask 是否安装
  useEffect(() => {
    setIsMetaMaskInstalled(typeof window !== 'undefined' && typeof window.ethereum !== 'undefined');
  }, []);

  const getBalance = useCallback(async (account: string): Promise<string> => {
    if (!window.ethereum) return '0';

    try {
      const balance = await window.ethereum.request({
        method: 'eth_getBalance',
        params: [account, 'latest'],
      }) as string;

      // 简单的 wei 转 ether
      const balanceInEther = parseInt(balance, 16) / 1e18;
      console.log('Balance fetched:', {
        hex: balance,
        wei: parseInt(balance, 16),
        ether: balanceInEther
      });
      return balanceInEther.toString();
    } catch (err) {
      console.error('Error getting balance:', err);
      return '0';
    }
  }, []);

  const getChainId = useCallback(async (): Promise<string | null> => {
    if (!window.ethereum) return null;

    try {
      const chainId = await window.ethereum.request({ method: 'eth_chainId' }) as string;
      return chainId;
    } catch (err) {
      console.error('Error getting chain ID:', err);
      return null;
    }
  }, []);

  const connect = useCallback(async () => {
    if (!isMetaMaskInstalled) {
      setError('MetaMask is not installed. Please install MetaMask extension.');
      return;
    }

    setWalletState((prev) => ({ ...prev, isLoading: true }));
    setError(null);

    if (!window.ethereum) {
      setError('MetaMask is not installed.');
      setWalletState((prev) => ({ ...prev, isLoading: false }));
      return;
    }

    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      }) as string[];

      if (accounts.length > 0) {
        const account = accounts[0];
        const balance = await getBalance(account);
        const chainId = await getChainId();

        setWalletState({
          account,
          balance,
          chainId,
          isConnected: true,
          isLoading: false,
        });

        if (chainId !== MONAD_TESTNET_CHAIN_ID_HEX) {
          setError('Please switch to Monad Testnet network.');
        }
      }
    } catch (err) {
      const error = err as MetaMaskError;
      console.error('Error connecting wallet:', error);

      if (error.code === 4001) {
        setError('Connection request was rejected.');
      } else {
        setError(`Failed to connect: ${error.message}`);
      }

      setWalletState((prev) => ({ ...prev, isLoading: false }));
    }
  }, [isMetaMaskInstalled, getBalance, getChainId]);

  const disconnect = useCallback(() => {
    setWalletState({
      account: null,
      balance: null,
      chainId: null,
      isConnected: false,
      isLoading: false,
    });
    setError(null);
  }, []);

  const refreshBalance = useCallback(async () => {
    if (!walletState.account) return;

    const balance = await getBalance(walletState.account);
    setWalletState((prev) => ({ ...prev, balance }));
  }, [walletState.account, getBalance]);

  const addMonadNetwork = useCallback(async () => {
    if (!isMetaMaskInstalled) {
      setError('MetaMask is not installed.');
      return;
    }

    if (!window.ethereum) return false;

    try {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [MONAD_TESTNET],
      });

      const chainId = await getChainId();
      setWalletState((prev) => ({ ...prev, chainId }));
      setError(null);

      return true;
    } catch (err) {
      const error = err as MetaMaskError;
      console.error('Error adding network:', error);

      if (error.code === 4001) {
        setError('Request to add network was rejected.');
      } else {
        setError(`Failed to add network: ${error.message}`);
      }

      return false;
    }
  }, [isMetaMaskInstalled, getChainId]);

  // 监听账户和网络变化
  useEffect(() => {
    if (!isMetaMaskInstalled) return;

    const handleAccountsChanged = async (...args: unknown[]) => {
      const accounts = args[0] as string[];
      if (accounts && accounts.length > 0) {
        const account = accounts[0];
        const balance = await getBalance(account);
        const chainId = await getChainId();

        setWalletState((prev) => ({
          ...prev,
          account,
          balance,
          chainId,
          isConnected: true,
        }));
      } else {
        disconnect();
      }
    };

    const handleChainChanged = async (...args: unknown[]) => {
      const chainId = args[0] as string;
      setWalletState((prev) => ({ ...prev, chainId }));

      if (walletState.account) {
        const balance = await getBalance(walletState.account);
        setWalletState((prev) => ({ ...prev, balance }));
      }

      if (chainId !== MONAD_TESTNET_CHAIN_ID_HEX) {
        setError('Please switch to Monad Testnet network.');
      } else {
        setError(null);
      }
    };

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
    }

    return () => {
      if (window.ethereum?.removeListener) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, [isMetaMaskInstalled, getBalance, getChainId, disconnect, walletState.account]);

  // 检查初始连接状态
  useEffect(() => {
    const checkConnection = async () => {
      if (!isMetaMaskInstalled || !window.ethereum) return;

      try {
        const accounts = await window.ethereum.request({
          method: 'eth_accounts',
        }) as string[];

        if (accounts && accounts.length > 0) {
          const account = accounts[0];
          const balance = await getBalance(account);
          const chainId = await getChainId();

          setWalletState({
            account,
            balance,
            chainId,
            isConnected: true,
            isLoading: false,
          });
        }
      } catch (err) {
        console.error('Error checking connection:', err);
      }
    };

    checkConnection();
  }, [isMetaMaskInstalled, getBalance, getChainId]);

  return {
    ...walletState,
    error,
    connect,
    disconnect,
    refreshBalance,
    addMonadNetwork,
    isMetaMaskInstalled,
  };
};
