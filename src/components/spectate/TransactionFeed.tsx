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

  const isBankruptcyRelated = tx.narrative && (tx.narrative.includes('bankruptcy') || tx.narrative.includes('BANKRUPT'));
  const isLargeTrade = tx.amount >= 10;
  
  // Detect special transaction types from skill_type or narrative
  const txType = tx.skill_type as string;
  const isLoan = txType === 'loan';
  const isInvestment = txType === 'investment';
  const isPartnership = txType === 'partnership';
  const isSabotage = txType === 'sabotage';
  const isRecruit = txType === 'recruitment';
  const isSpecialAction = isLoan || isInvestment || isPartnership || isSabotage || isRecruit;
  const backfired = isSabotage && tx.narrative?.includes('BACKFIRED');

  // Extract reasoning from narrative.
  // New narratives use "[reason] ..." delimiter. Legacy narratives use the old regex as fallback.
  let reasoning = '';
  if (tx.narrative) {
    const reasonTagMatch = tx.narrative.match(/\[reason\]\s*(.+)$/);
    if (reasonTagMatch?.[1] && reasonTagMatch[1].trim().length > 5) {
      reasoning = reasonTagMatch[1].trim();
    } else {
      // Legacy fallback: extract text after the structured part
      const legacyMatch = tx.narrative.match(/(?:LOAN|INVESTMENT|PARTNERSHIP|SABOTAGE.*?BACKFIRED|SABOTAGE|RECRUIT|bought).*?(?:epochs?|total|sales)\.\s*(.+)$/);
      if (legacyMatch?.[1] && legacyMatch[1].trim().length > 10) {
        reasoning = legacyMatch[1].trim();
      }
    }
  }

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
        isSabotage
          ? backfired 
            ? 'bg-orange-500/10 border-orange-500/40 shadow-orange-500/10 shadow-lg'
            : 'bg-red-500/10 border-red-500/40 shadow-red-500/10 shadow-lg'
          : isBankruptcyRelated 
          ? 'bg-red-500/5 border-red-500/30 shadow-red-500/10 shadow-lg' 
          : isLoan
          ? 'bg-blue-500/5 border-blue-500/30 shadow-blue-500/10 shadow-lg'
          : isInvestment
          ? 'bg-purple-500/5 border-purple-500/30 shadow-purple-500/10 shadow-lg'
          : isPartnership
          ? 'bg-cyan-500/5 border-cyan-500/30 shadow-cyan-500/10 shadow-lg'
          : isRecruit
          ? 'bg-amber-500/5 border-amber-500/30 shadow-amber-500/10 shadow-lg'
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
          className={`shrink-0 text-xs font-bold ${
            isSabotage ? 'text-red-400' 
            : isLoan ? 'text-blue-400'
            : isInvestment ? 'text-purple-400'
            : isPartnership ? 'text-cyan-400'
            : isRecruit ? 'text-amber-400'
            : 'text-[var(--text-tertiary)]'
          }`}
          animate={isLargeTrade || isSabotage ? { x: [0, 2, -2, 0] } : {}}
          transition={{ duration: 0.5, repeat: (isLargeTrade || isSabotage) ? Infinity : 0, repeatDelay: 2 }}
        >
          {isSabotage ? '⚔️' : isLoan ? '💰→' : isInvestment ? '📈→' : isPartnership ? '🤝' : isRecruit ? '🔗→' : '→'}
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
        {isLargeTrade && !isBankruptcyRelated && !isSpecialAction && (
          <motion.span 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] rounded-md font-bold border border-emerald-500/30"
          >
            💰 {t('largeTrade')}
          </motion.span>
        )}
        {isLoan && (
          <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}
            className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-[10px] rounded-md font-bold border border-blue-500/30">
            💰 LOAN
          </motion.span>
        )}
        {isInvestment && (
          <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}
            className="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-[10px] rounded-md font-bold border border-purple-500/30">
            📈 INVEST
          </motion.span>
        )}
        {isPartnership && (
          <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}
            className="px-2 py-0.5 bg-cyan-500/20 text-cyan-400 text-[10px] rounded-md font-bold border border-cyan-500/30">
            🤝 PARTNER
          </motion.span>
        )}
        {isSabotage && (
          <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}
            className={`px-2 py-0.5 text-[10px] rounded-md font-bold border ${
              backfired 
                ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' 
                : 'bg-red-500/20 text-red-400 border-red-500/30'
            }`}>
            {backfired ? '💥 BACKFIRED' : '🗡️ SABOTAGE'}
          </motion.span>
        )}
        {isRecruit && (
          <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}
            className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-[10px] rounded-md font-bold border border-amber-500/30">
            🔗 RECRUIT
          </motion.span>
        )}
      </div>

      {/* Agent's strategic reasoning */}
      {reasoning && (
        <div className={`mt-2 pt-2 border-t ${
          isSabotage ? 'border-red-500/20' 
          : isLoan ? 'border-blue-500/20'
          : isInvestment ? 'border-purple-500/20'
          : isPartnership ? 'border-cyan-500/20'
          : isBankruptcyRelated ? 'border-red-500/20' 
          : 'border-[var(--border)]'
        }`}>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed line-clamp-3 italic">
            💭 &ldquo;{reasoning}&rdquo;
          </p>
        </div>
      )}
      {/* Fallback: show cleaned narrative if no reasoning extracted */}
      {!reasoning && tx.narrative && (
        <div className={`mt-2 pt-2 border-t ${
          isBankruptcyRelated ? 'border-red-500/20' : 'border-[var(--border)]'
        }`}>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed line-clamp-2">
            {tx.narrative.replace(/\[reason\]\s*/g, '')}
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
