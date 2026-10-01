'use client';

import { useState, useEffect, useCallback } from 'react';

declare global {
  interface Window {
    midnight?: {
      mnLace?: {
        enable(): Promise<{
          getUsedAddresses(): Promise<string[]>;
          getChangeAddress?(): Promise<string>;
          getBalance?(): Promise<{ tStar: bigint; dust: bigint }>;
          signTx?(tx: unknown): Promise<unknown>;
          submitTx?(tx: unknown): Promise<string>;
        }>;
        isEnabled(): Promise<boolean>;
        apiVersion(): string;
        name(): string;
        icon(): string;
      };
    };
  }
}

export type WalletType = 'lace_extension' | 'demo_keypair';

export interface MidnightWalletState {
  isConnected: boolean;
  walletType: WalletType;
  address: string | null;
  network: string;
  balance: {
    tStar: string;
    dust: string;
  };
  isLaceAvailable: boolean;
  isLoading: boolean;
  error: string | null;
}

const STORAGE_KEY = 'zkrent_midnight_wallet_v2';
const DEFAULT_DEMO_ADDRESS = '0xmn_demo_74f9c1b3e8a2049d5c801b7a2d48f93e1a0b5c7e';

export function useMidnightWallet() {
  const [walletState, setWalletState] = useState<MidnightWalletState>({
    isConnected: false,
    walletType: 'demo_keypair',
    address: null,
    network: process.env.NEXT_PUBLIC_MIDNIGHT_NETWORK || 'Midnight Preprod Testnet',
    balance: {
      tStar: '1,500.00',
      dust: '10,000',
    },
    isLaceAvailable: false,
    isLoading: false,
    error: null,
  });

  // Detect Lace extension and restore saved session on mount
  useEffect(() => {
    const checkLaceAndRestore = () => {
      const available = typeof window !== 'undefined' && Boolean(window.midnight?.mnLace);
      
      let savedState: Partial<MidnightWalletState> | null = null;
      try {
        const stored = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
        if (stored) {
          savedState = JSON.parse(stored);
        }
      } catch {
        // Ignore JSON parse errors
      }

      setWalletState((prev) => ({
        ...prev,
        isLaceAvailable: available,
        ...(savedState?.isConnected ? {
          isConnected: true,
          walletType: savedState.walletType || 'demo_keypair',
          address: savedState.address || DEFAULT_DEMO_ADDRESS,
          balance: savedState.balance || prev.balance,
        } : {}),
      }));
    };

    checkLaceAndRestore();
    const timer = setTimeout(checkLaceAndRestore, 800);
    return () => clearTimeout(timer);
  }, []);

  // Connect using official Lace extension
  const connectLace = useCallback(async () => {
    setWalletState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      if (typeof window === 'undefined' || !window.midnight?.mnLace) {
        throw new Error('Midnight Lace wallet extension is not installed');
      }

      const api = await window.midnight.mnLace.enable();
      const addresses = await api.getUsedAddresses();
      const primaryAddress = addresses[0] || '0xmn_' + Math.random().toString(16).slice(2, 42);

      let balance = { tStar: '500.00', dust: '5,000' };
      if (api.getBalance) {
        try {
          const rawBal = await api.getBalance();
          balance = {
            tStar: (Number(rawBal.tStar) / 1_000_000).toFixed(2),
            dust: rawBal.dust.toString(),
          };
        } catch {
          // Fallback to initial display balance
        }
      }

      const newState: MidnightWalletState = {
        isConnected: true,
        walletType: 'lace_extension',
        address: primaryAddress,
        network: process.env.NEXT_PUBLIC_MIDNIGHT_NETWORK || 'Midnight Preprod Testnet',
        balance,
        isLaceAvailable: true,
        isLoading: false,
        error: null,
      };

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          isConnected: true,
          walletType: 'lace_extension',
          address: primaryAddress,
          balance,
        }));
      } catch {
        // Ignore localStorage quota errors
      }

      setWalletState(newState);
      return primaryAddress;
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to connect to Lace wallet';
      setWalletState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMsg,
      }));
      throw err;
    }
  }, []);

  // Connect using built-in deterministic demo keypair (ideal for hackathon / offline demos)
  const connectDemo = useCallback((customAddress?: string) => {
    const addr = customAddress || DEFAULT_DEMO_ADDRESS;
    const balance = {
      tStar: '2,500.00',
      dust: '25,000',
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        isConnected: true,
        walletType: 'demo_keypair',
        address: addr,
        balance,
      }));
    } catch {
      // Ignore localStorage errors
    }

    setWalletState((prev) => ({
      ...prev,
      isConnected: true,
      walletType: 'demo_keypair',
      address: addr,
      balance,
      isLoading: false,
      error: null,
    }));
    return addr;
  }, []);

  const disconnect = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore
    }
    setWalletState((prev) => ({
      ...prev,
      isConnected: false,
      address: null,
      error: null,
    }));
  }, []);

  return {
    ...walletState,
    connectLace,
    connectDemo,
    disconnect,
  };
}
