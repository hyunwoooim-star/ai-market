'use client';

import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import {
  AGENT_EMOJI,
  type SpectateTransaction,
  type EpochEventCard,
} from '@/lib/spectate-mock-data';

interface Props {
  transactions: SpectateTransaction[];
  epochEvents: EpochEventCard[];
}

interface FeedItem {
  type: 'transaction' | 'epoch';
  key: string;
  epoch: number;
  createdAt: string;
  data: SpectateTransaction | EpochEventCard;
}

export default function TransactionFeed({ transactions, epochEvents }: Props) {
  const t = useTranslations('spectate');
  const scrollRef = useRef<HTMLDivElement>(null);

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
      createdAt: '',
      data: ev,
    });
  }

  items.sort((a, b) => {
    if (a.epoch !== b.epoch) return b.epoch - a.epoch;
    if (a.type !== b.type) return a.type === 'epoch' ? -1 : 1;
    return 0;
  });

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [transactions.length]);

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-[var(--border)]">
        <h2 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider flex items-center gap-2">
          <span>📡</span>
          <span>{t('transactionFeed')}</span>
          <span className="text-[10px] font-normal text-[var(--text-tertiary)]">
            {t('transactionCount', { count: transactions.length })}
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
            <span className="text-sm">{t('noTransactionsYet')}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function TransactionRow({ tx, index }: { tx: SpectateTransaction; index: number }) {
  const t = useTranslations('spectate');
  const tAgents = useTranslations('agents');

  let buyerName: string;
  try { buyerName = tAgents(`${tx.buyer_id}.name`); } catch { buyerName = tx.buyer_id; }
  let sellerName: string;
  try { sellerName = tAgents(`${tx.seller_id}.name`); } catch { sellerName = tx.seller_id; }

  const buyerEmoji = AGENT_EMOJI[tx.buyer_id] || '🤖';
  const sellerEmoji = AGENT_EMOJI[tx.seller_id] || '🤖';

  const isBankruptcyRelated = tx.narrative && (tx.narrative.includes('bankruptcy') || tx.narrative.includes('파산'));
  const isLargeTrade = tx.amount >= 10;

  const timeStr = new Date(tx.created_at).toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: -10, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.02, type: 'spring', stiffness: 400, damping: 25 }}
      className={`border rounded-xl p-3 transition-all hover:scale-[1.01] ${
        isBankruptcyRelated 
          ? 'bg-red-500/5 border-red-500/30 shadow-red-500/10 shadow-lg' 
          : isLargeTrade
          ? 'bg-emerald-500/5 border-emerald-500/30 shadow-emerald-500/10 shadow-lg'
          : 'bg-[var(--surface)] border-[var(--border)] hover:border-[var(--accent)]/30'
      }`}
    >
      <div className="flex items-center gap-2 text-sm min-w-0">
        <span className="flex items-center gap-1 font-semibold text-[var(--text-primary)] truncate shrink min-w-0">
          <span className="shrink-0">{buyerEmoji}</span>
          <span className="truncate">{buyerName}</span>
        </span>
        <motion.span 
          className="text-[var(--text-tertiary)] shrink-0"
          animate={isLargeTrade ? { x: [0, 2, -2, 0] } : {}}
          transition={{ duration: 0.5, repeat: isLargeTrade ? Infinity : 0, repeatDelay: 2 }}
        >
          →
        </motion.span>
        <span className="flex items-center gap-1 font-semibold text-[var(--text-primary)] truncate shrink min-w-0">
          <span className="shrink-0">{sellerEmoji}</span>
          <span className="truncate">{sellerName}</span>
        </span>
        <span className="ml-auto text-[10px] text-[var(--text-tertiary)] font-mono whitespace-nowrap shrink-0">
          E{tx.epoch} · {timeStr}
        </span>
      </div>

      <div className="flex items-center gap-2 mt-2 flex-wrap">
        <span className="px-2 py-0.5 bg-[var(--accent)]/10 text-[var(--accent)] text-xs rounded-md font-semibold">
          {tx.skill_type}
        </span>
        <span className={`font-mono font-bold text-sm ${
          isLargeTrade ? 'text-emerald-300' : 'text-emerald-400'
        }`}>
          ${tx.amount.toFixed(2)}
        </span>
        <span className="text-[10px] text-[var(--text-tertiary)] font-mono">
          {t('fee')} ${tx.fee.toFixed(2)}
        </span>
        
        {isBankruptcyRelated && (
          <motion.span 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="px-2 py-0.5 bg-red-500/20 text-red-400 text-[10px] rounded-md font-bold border border-red-500/30"
          >
            💀 {t('bankruptcyRelated')}
          </motion.span>
        )}
        {isLargeTrade && !isBankruptcyRelated && (
          <motion.span 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] rounded-md font-bold border border-emerald-500/30"
          >
            💰 {t('largeTrade')}
          </motion.span>
        )}
      </div>

      {tx.narrative && (
        <div className={`mt-2 pt-2 border-t ${
          isBankruptcyRelated ? 'border-red-500/20' : 'border-[var(--border)]'
        }`}>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed line-clamp-2">
            {tx.narrative}
          </p>
        </div>
      )}
    </motion.div>
  );
}

function EpochEventRow({ event, index }: { event: EpochEventCard; index: number }) {
  const t = useTranslations('spectate');

  const styleMap: Record<string, { 
    bg: string; 
    border: string; 
    icon: string; 
    textColor: string;
    shadowColor: string;
    pulse: boolean;
  }> = {
    boom: {
      bg: 'bg-gradient-to-r from-emerald-500/15 to-green-500/10',
      border: 'border-emerald-500/40',
      icon: '🚀',
      textColor: 'text-emerald-300',
      shadowColor: 'shadow-emerald-500/20',
      pulse: true,
    },
    recession: {
      bg: 'bg-gradient-to-r from-red-500/15 to-rose-500/10',
      border: 'border-red-500/40',
      icon: '📉',
      textColor: 'text-red-300',
      shadowColor: 'shadow-red-500/20',
      pulse: false,
    },
    opportunity: {
      bg: 'bg-gradient-to-r from-amber-500/15 to-yellow-500/10',
      border: 'border-amber-500/40',
      icon: '⚡',
      textColor: 'text-amber-300',
      shadowColor: 'shadow-amber-500/20',
      pulse: true,
    },
    normal: {
      bg: 'bg-gradient-to-r from-slate-500/8 to-gray-500/5',
      border: 'border-slate-500/25',
      icon: '📊',
      textColor: 'text-slate-300',
      shadowColor: 'shadow-slate-500/10',
      pulse: false,
    },
  };

  const style = styleMap[event.type] || styleMap.normal;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ 
        delay: index * 0.02, 
        type: 'spring',
        stiffness: 300,
        damping: 20
      }}
      className={`relative ${style.bg} ${style.border} ${style.shadowColor} border rounded-xl p-4 text-center shadow-lg overflow-hidden`}
    >
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
      </div>

      <div className="relative z-10">
        <div className="flex items-center justify-center gap-3 mb-2">
          <motion.span 
            className="text-2xl"
            animate={style.pulse ? { 
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            } : {}}
            transition={{ 
              duration: 2, 
              repeat: Infinity,
              repeatType: 'reverse'
            }}
          >
            {style.icon}
          </motion.span>
          <span className={`text-sm font-bold uppercase tracking-widest ${style.textColor}`}>
            {t('epochLabel', { epoch: event.epoch })}
          </span>
          <motion.span 
            className="text-2xl"
            animate={style.pulse ? { 
              scale: [1, 1.1, 1],
              rotate: [0, -5, 5, 0]
            } : {}}
            transition={{ 
              duration: 2, 
              repeat: Infinity,
              repeatType: 'reverse',
              delay: 0.5
            }}
          >
            {style.icon}
          </motion.span>
        </div>
        
        <p className={`text-sm font-medium leading-relaxed ${style.textColor}`}>
          {event.description}
        </p>

        {event.type !== 'normal' && (
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ delay: 0.5, duration: 1 }}
            className={`mt-3 h-0.5 ${
              event.type === 'boom' ? 'bg-emerald-400' :
              event.type === 'recession' ? 'bg-red-400' :
              'bg-amber-400'
            } rounded-full`}
          />
        )}
      </div>

      {style.pulse && (
        <motion.div
          className="absolute inset-0 rounded-xl border-2 border-current opacity-20"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{ color: style.textColor.replace('text-', '') }}
        />
      )}
    </motion.div>
  );
}
