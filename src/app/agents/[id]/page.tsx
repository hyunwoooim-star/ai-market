'use client';

import { useState, useRef, useEffect, use } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { getAgent } from '@/data/agents';
import { CATEGORY_LABELS } from '@/types/agent';
import Navbar from '@/components/landing/Navbar';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export default function AgentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const agent = getAgent(id);
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!agent) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen pt-24 flex items-center justify-center">
          <div className="text-center">
            <p className="text-xl text-zinc-400">에이전트를 찾을 수 없습니다</p>
            <button onClick={() => router.push('/agents')} className="mt-4 text-violet-400 hover:underline">
              ← 목록으로
            </button>
          </div>
        </main>
      </>
    );
  }

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input.trim(),
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    setShowChat(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: agent.id,
          message: userMsg.content,
          history: messages.slice(-10),
        }),
      });

      if (!res.ok) throw new Error('API error');

      const data = await res.json();

      const assistantMsg: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.response || '죄송합니다, 응답을 생성하지 못했습니다.',
        timestamp: Date.now(),
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch {
      setMessages(prev => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: '⚠️ 일시적 오류가 발생했습니다. 다시 시도해주세요.',
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const placeholders: Record<string, string> = {
    'blog-master': '예: 강남역 근처 분위기 좋은 카페를 소개하는 블로그 글 써줘',
    'soul-friend': '예: 오늘 하루 너무 힘들었어...',
    'resume-pro': '예: 마케팅 3년차 경력직 자기소개서 써줘',
    'contract-guard': '예: 이 전세 계약서 검토해줘 (계약 내용을 붙여넣어주세요)',
    'study-buddy': '예: 미적분의 기초를 쉽게 설명해줘',
    'sns-creator': '예: 새로 오픈한 카페 인스타 게시물 캡션 써줘',
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-20">
        <div className="max-w-4xl mx-auto px-4">
          {/* Agent info header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="py-6 flex items-start gap-4"
          >
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shrink-0"
              style={{ background: `${agent.color}20` }}
            >
              {agent.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold text-white">{agent.nameKo}</h1>
                {agent.status === 'beta' && (
                  <span className="px-2 py-0.5 text-[10px] rounded-full bg-violet-500/20 text-violet-400 border border-violet-500/30">
                    BETA
                  </span>
                )}
              </div>
              <p className="text-sm text-zinc-500 mt-0.5">
                {CATEGORY_LABELS[agent.category]} · {agent.pricing.type === 'free' ? '무료' : `${agent.pricing.freeMessages}회 무료`}
              </p>
              <p className="text-sm text-zinc-400 mt-2">{agent.descriptionKo}</p>
            </div>
          </motion.div>

          {/* Chat area */}
          <div className="bg-surface rounded-2xl border border-white/5 overflow-hidden" style={{ minHeight: '60vh' }}>
            {/* Messages */}
            <div className="p-4 space-y-4 overflow-y-auto" style={{ maxHeight: 'calc(60vh - 80px)' }}>
              {!showChat && messages.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <span className="text-5xl mb-4">{agent.icon}</span>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {agent.nameKo}와 대화를 시작하세요
                  </h3>
                  <p className="text-sm text-zinc-500 max-w-md">
                    {agent.descriptionKo}
                  </p>

                  {/* Quick actions */}
                  <div className="flex flex-wrap gap-2 mt-6 justify-center">
                    {agent.tags.map(tag => (
                      <button
                        key={tag}
                        className="px-3 py-1.5 text-sm rounded-lg bg-surface-2 border border-white/5 text-zinc-400 hover:text-white hover:border-violet-500/30 transition-all"
                        onClick={() => {
                          setInput(`#${tag} 관련 도움이 필요해요`);
                          inputRef.current?.focus();
                        }}
                      >
                        #{tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map(msg => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      msg.role === 'user'
                        ? 'bg-violet-600 text-white'
                        : 'bg-surface-2 text-zinc-200 border border-white/5'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                  </div>
                </motion.div>
              ))}

              {loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-surface-2 rounded-2xl px-4 py-3 border border-white/5">
                    <div className="flex gap-1.5">
                      <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-white/5 p-4">
              <div className="flex gap-3 items-end">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={placeholders[agent.id] || '메시지를 입력하세요...'}
                  rows={1}
                  className="flex-1 bg-surface-2 rounded-xl border border-white/10 px-4 py-3 text-sm text-white placeholder-zinc-600 resize-none focus:outline-none focus:border-violet-500/50 transition-colors"
                  style={{ minHeight: '44px', maxHeight: '120px' }}
                  disabled={agent.status === 'coming_soon'}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || loading || agent.status === 'coming_soon'}
                  className="px-4 py-3 rounded-xl bg-violet-600 text-white font-medium hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95 shrink-0"
                >
                  {loading ? '...' : '전송'}
                </button>
              </div>
              {agent.status === 'coming_soon' && (
                <p className="text-xs text-zinc-600 mt-2 text-center">
                  이 에이전트는 곧 출시됩니다. 기대해주세요!
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
