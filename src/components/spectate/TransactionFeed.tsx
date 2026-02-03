'use client';

import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AGENT_NAMES,
  AGENT_EMOJI,
  type SpectateTransaction,
  type EpochEventCard,
} from '@/lib/spectate-mock-data';

interface Props {
  transactions: SpectateTransaction[];
  epochEvents: EpochEventCard[];
}

// Merge transactions and epoch events into a unified timeline
interface FeedItem {
  type: 'transaction' | 'epoch';
  key: string;
  epoch: number;
  createdAt: string;
  data: SpectateTransaction | EpochEventCard;
}

export default function TransactionFeed({ transactions, epochEvents }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Build timeline
  const items: FeedItem[] = [];

  for (const tx of transactions) {
    items.push({
      type: 'transaction',
      key: tx.id,
      epoch: tx.epoch,
      createdAt: tx.created_at,
      data: tx,
    });
  }

  for (const ev of epochEvents) {
    items.push({
      type: 'epoch',
      key: `epoch-${ev.epoch}`,
      epoch: ev.epoch,
      createdAt: '', // Will sort by epoch
      data: ev,
    });
  }

  // Sort: newest first, epoch events before transactions in same epoch
  items.sort((a, b) => {
    if (a.epoch !== b.epoch) return b.epoch - a.epoch;
    if (a.type !== b.type) return a.type === 'epoch' ? -1 : 1;
    return 0;
  });

  // Auto-scroll to top when new items
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [transactions.length]);

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-[var(--border)]">
        <h2 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider flex items-center gap-2">
          <span>📡</span>
          <span>거래 피드</span>
          <span className="text-[10px] font-normal text-[var(--text-tertiary)]">
            {transactions.length}건
          </span>
        </h2>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-2 space-y-2">
        <AnimatePresence initial={false}>
          {items.map((item, i) =>
            item.type === 'epoch' ? (
              <EpochEventRow key={item.key} event={item.data as EpochEventCard} index={i} />
            ) : (
              <TransactionRow key={item.key} tx={item.data as SpectateTransaction} index={i} />
            )
          )}
        </AnimatePresence>

        {items.length === 0 && (
          <div className="flex flex-col items-center justify-center h-48 text-[var(--text-tertiary)]">
            <span className="text-3xl mb-2">📭</span>
            <span className="text-sm">아직 거래가 없습니다</span>
          </div>
        )}
      </div>
    </div>
  );
}

function TransactionRow({ tx, index }: { tx: SpectateTransaction; index: number }) {
  const buyerName = AGENT_NAMES[tx.buyer_id] || tx.buyer_id;
  const sellerName = AGENT_NAMES[tx.seller_id] || tx.seller_id;
  const buyerEmoji = AGENT_EMOJI[tx.buyer_id] || '🤖';
  const sellerEmoji = AGENT_EMOJI[tx.seller_id] || '🤖';

  const timeStr = new Date(tx.created_at).toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: -10, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.02, type: 'spring', stiffness: 400, damping: 25 }}
      className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-3 hover:border-[var(--accent)]/30 transition-colors"
    >
      {/* Header: buyer → seller */}
      <div className="flex items-center gap-2 text-sm">
        <span className="flex items-center gap-1 font-semibold text-[var(--text-primary)]">
          <span>{buyerEmoji}</span>
          <span>{buyerName}</span>
        </span>
        <span className="text-[var(--text-tertiary)]">→</span>
        <span className="flex items-center gap-1 font-semibold text-[var(--text-primary)]">
          <span>{sellerEmoji}</span>
          <span>{sellerName}</span>
        </span>
        <span className="ml-auto text-[10px] text-[var(--text-tertiary)] font-mono">
          E{tx.epoch} · {timeStr}
        </span>
      </div>

      {/* Skill + Amount */}
      <div className="flex items-center gap-2 mt-2">
        <span className="px-2 py-0.5 bg-[var(--accent)]/10 text-[var(--accent)] text-xs rounded-md font-semibold">
          {tx.skill_type}
        </span>
        <span className="font-mono font-bold text-sm text-emerald-400">
          ${tx.amount.toFixed(2)}
        </span>
        <span className="text-[10px] text-[var(--text-tertiary)] font-mono">
          수수료 ${tx.fee.toFixed(2)}
        </span>
      </div>

      {/* Narrative */}
      {tx.narrative && (
        <p className="mt-2 text-xs text-[var(--text-secondary)] leading-relaxed line-clamp-2">
          {tx.narrative}
        </p>
      )}
    </motion.div>
  );
}

function EpochEventRow({ event, index }: { event: EpochEventCard; index: number }) {
  const styleMap: Record<string, { bg: string; border: string; icon: string; textColor: string }> = {
    boom: {
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/30',
      icon: '🚀',
      textColor: 'text-emerald-400',
    },
    recession: {
      bg: 'bg-red-500/10',
      border: 'border-red-500/30',
      icon: '📉',
      textColor: 'text-red-400',
    },
    opportunity: {
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/30',
      icon: '⚡',
      textColor: 'text-amber-400',
    },
    normal: {
      bg: 'bg-slate-500/5',
      border: 'border-slate-500/20',
      icon: '📋',
      textColor: 'text-slate-400',
    },
  };

  const style = styleMap[event.type] || styleMap.normal;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.02 }}
      className={`${style.bg} ${style.border} border rounded-xl p-3 text-center`}
    >
      <div className="flex items-center justify-center gap-2">
        <span className="text-lg">{style.icon}</span>
        <span className={`text-xs font-bold uppercase tracking-wider ${style.textColor}`}>
          에포크 #{event.epoch}
        </span>
        <span className="text-lg">{style.icon}</span>
      </div>
      <p className={`text-xs mt-1 ${style.textColor}`}>
        {event.description}
      </p>
    </motion.div>
  );
}
