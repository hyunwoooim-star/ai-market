'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useConnection } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';

function truncateAddress(address: string): string {
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

export default function WalletButton() {
  const { publicKey, connected, connect, disconnect, connecting, wallet, select, wallets } = useWallet();
  const { connection } = useConnection();
  const [balance, setBalance] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Fetch balance when connected
  useEffect(() => {
    if (!publicKey || !connection) {
      setBalance(null);
      return;
    }

    let cancelled = false;

    const fetchBalance = async () => {
      try {
        const lamports = await connection.getBalance(publicKey);
        if (!cancelled) {
          setBalance(lamports / LAMPORTS_PER_SOL);
        }
      } catch {
        if (!cancelled) setBalance(null);
      }
    };

    fetchBalance();
    const id = connection.onAccountChange(publicKey, (info) => {
      if (!cancelled) setBalance(info.lamports / LAMPORTS_PER_SOL);
    });

    return () => {
      cancelled = true;
      connection.removeAccountChangeListener(id);
    };
  }, [publicKey, connection]);

  const handleConnect = useCallback(async () => {
    try {
      // Auto-select Phantom if available
      if (!wallet) {
        const phantom = wallets.find(w => w.adapter.name === 'Phantom');
        if (phantom) {
          select(phantom.adapter.name);
          return; // connect will auto-trigger via autoConnect
        }
      }
      await connect();
    } catch (err) {
      console.error('Wallet connect error:', err);
    }
  }, [wallet, wallets, select, connect]);

  const handleCopy = useCallback(() => {
    if (publicKey) {
      navigator.clipboard.writeText(publicKey.toBase58());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [publicKey]);

  const handleDisconnect = useCallback(() => {
    disconnect();
    setOpen(false);
  }, [disconnect]);

  // Not connected state
  if (!connected || !publicKey) {
    return (
      <button
        onClick={handleConnect}
        disabled={connecting}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
      >
        {/* Phantom / Solana icon */}
        <svg width="16" height="16" viewBox="0 0 128 128" fill="none">
          <circle cx="64" cy="64" r="64" fill="url(#sol-grad)" />
          <path d="M37.4 88.5a3.2 3.2 0 012.3-1h51.6c1.5 0 2.2 1.8 1.1 2.8l-10.7 10.8a3.2 3.2 0 01-2.3 1H27.8c-1.5 0-2.2-1.8-1.1-2.8L37.4 88.5z" fill="#fff"/>
          <path d="M37.4 27a3.3 3.3 0 012.3-1h51.6c1.5 0 2.2 1.7 1.1 2.7L81.7 39.5a3.2 3.2 0 01-2.3 1H27.8c-1.5 0-2.2-1.8-1.1-2.8L37.4 27z" fill="#fff"/>
          <path d="M81.7 57.5a3.2 3.2 0 00-2.3-1H27.8c-1.5 0-2.2 1.8-1.1 2.8l10.7 10.8a3.2 3.2 0 002.3 1h51.6c1.5 0 2.2-1.8 1.1-2.8L81.7 57.5z" fill="#fff"/>
          <defs>
            <linearGradient id="sol-grad" x1="0" y1="128" x2="128" y2="0">
              <stop stopColor="#9945FF"/>
              <stop offset="0.5" stopColor="#7962E7"/>
              <stop offset="1" stopColor="#00D18C"/>
            </linearGradient>
          </defs>
        </svg>
        {connecting ? '연결 중...' : '지갑 연결'}
      </button>
    );
  }

  // Connected state
  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
      >
        {/* Green dot indicator */}
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span>{truncateAddress(publicKey.toBase58())}</span>
        {balance !== null && (
          <span className="text-xs text-indigo-400 dark:text-indigo-400">
            {balance.toFixed(2)} SOL
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-10 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg py-2 z-50">
          {/* Wallet info */}
          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Devnet 연결됨</p>
            </div>
            <p className="text-sm font-mono text-gray-900 dark:text-white break-all">
              {publicKey.toBase58()}
            </p>
            {balance !== null && (
              <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400 mt-1">
                {balance.toFixed(4)} SOL
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="py-1">
            <button
              onClick={handleCopy}
              className="w-full text-left px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              {copied ? '✅ 복사됨!' : '📋 주소 복사'}
            </button>
            <a
              href={`https://explorer.solana.com/address/${publicKey.toBase58()}?cluster=devnet`}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full text-left px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              🔍 Explorer에서 보기
            </a>
          </div>

          {/* Disconnect */}
          <div className="border-t border-gray-100 dark:border-gray-700 pt-1">
            <button
              onClick={handleDisconnect}
              className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              연결 해제
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
