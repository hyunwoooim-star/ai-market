'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import type { SpectateTransaction, SpectateStats } from '@/lib/spectate-mock-data';

interface EventCard {
  id: string;
  type: 'bankruptcy' | 'large-trade' | 'warning' | 'ranking-change';
  emoji: string;
  title: string;
  description: string;
  agentName?: string;
  amount?: number;
  timestamp: string;
  priority: number;
}

interface Props {
  transactions: SpectateTransaction[];
  stats: SpectateStats;
  onEventClick?: (event: EventCard) => void;
}

export default function EventBanner({ transactions, stats, onEventClick }: Props) {
  const t = useTranslations('spectate');
  const tAgents = useTranslations('agents');

  const [events, setEvents] = useState<EventCard[]>([]);
  const [currentEventIndex, setCurrentEventIndex] = useState(0);

  const getAgentName = (agentId: string): string => {
    try { return tAgents(`${agentId}.name`); } catch { return agentId; }
  };

  useEffect(() => {
    const newEvents: EventCard[] = [];

    // 1. Bankruptcy events
    transactions.forEach(tx => {
      if (tx.narrative && (tx.narrative.includes('bankruptcy') || tx.narrative.includes('파산'))) {
        const agentName = getAgentName(tx.buyer_id);
        newEvents.push({
          id: `bankruptcy-${tx.id}`,
          type: 'bankruptcy',
          emoji: '💀',
          title: t('bankruptcyEvent'),
          description: t('agentBankrupt', { name: agentName }),
          agentName,
          timestamp: tx.created_at,
          priority: 100,
        });
      }
    });

    // 2. Large trade events ($10+)
    transactions.forEach(tx => {
      if (tx.amount >= 10) {
        const buyerName = getAgentName(tx.buyer_id);
        const sellerName = getAgentName(tx.seller_id);
        newEvents.push({
          id: `large-trade-${tx.id}`,
          type: 'large-trade',
          emoji: '💰',
          title: t('largeTradeEvent'),
          description: t('agentLargeTrade', { buyer: buyerName, seller: sellerName, amount: tx.amount.toFixed(2) }),
          amount: tx.amount,
          timestamp: tx.created_at,
          priority: 70,
        });
      }
    });

    // 3. Warning events (balance <= $10)
    (stats.agents || []).forEach(agent => {
      if (agent.balance <= 10 && agent.balance > 0 && agent.status !== 'bankrupt') {
        newEvents.push({
          id: `warning-${agent.id}`,
          type: 'warning',
          emoji: '⚠️',
          title: t('warningSignal'),
          description: t('agentWarning', { name: agent.name, balance: agent.balance.toFixed(2) }),
          agentName: agent.name,
          timestamp: new Date().toISOString(),
          priority: 50,
        });
      }
    });

    // 4. Ranking change events
    if (Math.random() > 0.7 && stats.agents?.length) {
      const randomAgent = stats.agents[Math.floor(Math.random() * stats.agents.length)];
      newEvents.push({
        id: `ranking-${Date.now()}`,
        type: 'ranking-change',
        emoji: '🔄',
        title: t('rankingChange'),
        description: t('agentRankingChange', { name: randomAgent.name }),
        agentName: randomAgent.name,
        timestamp: new Date().toISOString(),
        priority: 40,
      });
    }

    const sortedEvents = newEvents
      .sort((a, b) => b.priority - a.priority)
      .slice(0, 5);

    setEvents(sortedEvents);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactions, stats]);

  // Auto-slide
  useEffect(() => {
    if (events.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentEventIndex((prev) => (prev + 1) % events.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [events.length]);

  if (events.length === 0) return null;

  const currentEvent = events[currentEventIndex];

  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-emerald-500/10 border-b border-purple-500/20"
    >
      <div className="max-w-screen-2xl mx-auto px-4 py-3">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentEvent.id}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="flex items-center justify-between"
          >
            <div 
              className="flex items-center gap-3 cursor-pointer hover:scale-[1.02] transition-transform min-w-0 overflow-hidden"
              onClick={() => onEventClick?.(currentEvent)}
            >
              <motion.span 
                className="text-2xl shrink-0"
                animate={{ 
                  scale: currentEvent.type === 'bankruptcy' ? [1, 1.2, 1] : 1,
                  rotate: currentEvent.type === 'large-trade' ? [0, 10, -10, 0] : 0
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity,
                  repeatType: 'reverse'
                }}
              >
                {currentEvent.emoji}
              </motion.span>
              
              <div className="flex flex-col min-w-0">
                <span className={`text-sm font-bold truncate ${getEventColor(currentEvent.type)}`}>
                  {currentEvent.title}
                </span>
                <span className="text-xs text-[var(--text-secondary)] truncate">
                  {currentEvent.description}
                </span>
              </div>

              <div className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
              </div>
            </div>

            {events.length > 1 && (
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  {events.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentEventIndex(index)}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === currentEventIndex 
                          ? 'bg-purple-400' 
                          : 'bg-gray-400/30'
                      }`}
                    />
                  ))}
                </div>
                
                <span className="text-xs text-[var(--text-tertiary)] font-mono">
                  {currentEventIndex + 1}/{events.length}
                </span>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function getEventColor(type: string): string {
  const colors: Record<string, string> = {
    bankruptcy: 'text-red-400',
    'large-trade': 'text-emerald-400',
    warning: 'text-amber-400',
    'ranking-change': 'text-blue-400',
  };
  return colors[type] || 'text-[var(--text-primary)]';
}
