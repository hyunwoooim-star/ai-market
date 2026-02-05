'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/routing';
import { useParams } from 'next/navigation';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  status?: 'pending' | 'success' | 'error';
}

interface HistoryEntry {
  id: string;
  html: string;
  message: string;
  timestamp: Date;
}

const EXAMPLE_PROMPTS_KO = [
  { emoji: '📞', label: '전화번호 추가', prompt: '전화번호 010-1234-5678을 추가해줘' },
  { emoji: '🎨', label: '색상 변경', prompt: '메인 색상을 파란색으로 바꿔줘' },
  { emoji: '📋', label: '메뉴 추가', prompt: '서비스 메뉴에 새로운 항목을 추가해줘' },
  { emoji: '🕐', label: '영업시간', prompt: '영업시간을 오전 9시 ~ 오후 9시로 표시해줘' },
  { emoji: '📍', label: '주소 추가', prompt: '서울시 강남구 테헤란로 123 주소를 추가해줘' },
  { emoji: '📸', label: '이미지 변경', prompt: '히어로 섹션 배경 이미지를 바꿔줘' },
];

const EXAMPLE_PROMPTS_EN = [
  { emoji: '📞', label: 'Add Phone', prompt: 'Add phone number 010-1234-5678' },
  { emoji: '🎨', label: 'Change Color', prompt: 'Change the main color to blue' },
  { emoji: '📋', label: 'Add Menu', prompt: 'Add a new item to the service menu' },
  { emoji: '🕐', label: 'Hours', prompt: 'Show business hours as 9 AM - 9 PM' },
  { emoji: '📍', label: 'Add Address', prompt: 'Add address: 123 Teheran-ro, Gangnam-gu, Seoul' },
  { emoji: '📸', label: 'Change Image', prompt: 'Change the hero section background image' },
];

export default function EditPage() {
  const t = useTranslations('edit');
  const tCommon = useTranslations('common');
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [html, setHtml] = useState('');
  const [originalHtml, setOriginalHtml] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sending, setSending] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('mobile');
  const [siteUrl, setSiteUrl] = useState('');

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const isKorean = t('title') === '홈페이지 수정';
  const examplePrompts = isKorean ? EXAMPLE_PROMPTS_KO : EXAMPLE_PROMPTS_EN;

  // Load current site data
  useEffect(() => {
    if (!slug) return;

    const fetchSite = async () => {
      setLoading(true);
      setError('');

      try {
        // Try the new API first
        let res = await fetch(`/api/hosting/get?slug=${encodeURIComponent(slug)}`);
        let data = await res.json();

        if (!data.html_content && !data.html) {
          // Fallback to old API
          res = await fetch(`/api/sites/${encodeURIComponent(slug)}`);
          data = await res.json();
        }

        if (data.html_content || data.html) {
          const htmlContent = data.html_content || data.html;
          setHtml(htmlContent);
          setOriginalHtml(htmlContent);
          setSiteUrl(`https://agentmarket.kr/s/${slug}`);

          // Add system message
          setMessages([{
            id: 'system-1',
            role: 'system',
            content: isKorean
              ? '홈페이지를 불러왔어요. 수정하고 싶은 내용을 말해주세요!'
              : 'Site loaded. Tell me what you\'d like to change!',
            timestamp: new Date(),
          }]);
        } else {
          throw new Error(data.error || 'Site not found');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load site');
      } finally {
        setLoading(false);
      }
    };

    fetchSite();
  }, [slug, isKorean]);

  // Auto scroll chat to bottom
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = useCallback(async (messageText?: string) => {
    const text = messageText || input.trim();
    if (!text || sending) return;

    setInput('');
    setSending(true);

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    const pendingMessage: ChatMessage = {
      id: `assistant-${Date.now()}`,
      role: 'assistant',
      content: isKorean ? 'AI가 수정 중...' : 'AI is editing...',
      timestamp: new Date(),
      status: 'pending',
    };

    setMessages(prev => [...prev, userMessage, pendingMessage]);

    try {
      const res = await fetch('/api/hosting/edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug,
          html: html,
          instruction: text,
        }),
      });

      const data = await res.json();

      if (data.html || data.html_content) {
        const newHtml = data.html || data.html_content;

        // Save to history before updating
        setHistory(prev => [{
          id: `history-${Date.now()}`,
          html: html,
          message: text,
          timestamp: new Date(),
        }, ...prev.slice(0, 9)]); // Keep last 10

        setHtml(newHtml);

        // Update pending message to success
        setMessages(prev => prev.map(m =>
          m.id === pendingMessage.id
            ? {
                ...m,
                content: data.message || (isKorean ? '✅ 수정 완료!' : '✅ Done!'),
                status: 'success',
              }
            : m
        ));
      } else {
        throw new Error(data.error || 'Edit failed');
      }
    } catch (err) {
      // Update pending message to error
      setMessages(prev => prev.map(m =>
        m.id === pendingMessage.id
          ? {
              ...m,
              content: `❌ ${err instanceof Error ? err.message : (isKorean ? '수정에 실패했어요' : 'Edit failed')}`,
              status: 'error',
            }
          : m
      ));
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  }, [input, sending, slug, html, isKorean]);

  const handleUndo = useCallback(() => {
    if (history.length === 0) return;

    const [lastEntry, ...rest] = history;
    setHtml(lastEntry.html);
    setHistory(rest);

    setMessages(prev => [...prev, {
      id: `system-${Date.now()}`,
      role: 'system',
      content: isKorean ? '🔙 이전 상태로 되돌렸어요' : '🔙 Reverted to previous state',
      timestamp: new Date(),
    }]);
  }, [history, isKorean]);

  const handleRestoreOriginal = useCallback(() => {
    setHtml(originalHtml);
    setHistory([]);
    setMessages(prev => [...prev, {
      id: `system-${Date.now()}`,
      role: 'system',
      content: isKorean ? '🔄 원래 상태로 복구했어요' : '🔄 Restored to original',
      timestamp: new Date(),
    }]);
  }, [originalHtml, isKorean]);

  const handleSave = useCallback(async () => {
    setSending(true);

    try {
      const res = await fetch('/api/hosting/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug,
          html_content: html,
          update: true,
        }),
      });

      const data = await res.json();

      if (data.success || data.url) {
        setMessages(prev => [...prev, {
          id: `system-${Date.now()}`,
          role: 'system',
          content: isKorean ? '💾 저장 완료! 변경사항이 라이브에 반영됐어요.' : '💾 Saved! Changes are now live.',
          timestamp: new Date(),
        }]);
        setOriginalHtml(html);
        setHistory([]);
      } else {
        throw new Error(data.error || 'Save failed');
      }
    } catch (err) {
      setMessages(prev => [...prev, {
        id: `system-${Date.now()}`,
        role: 'system',
        content: `❌ ${err instanceof Error ? err.message : (isKorean ? '저장에 실패했어요' : 'Save failed')}`,
        timestamp: new Date(),
      }]);
    } finally {
      setSending(false);
    }
  }, [slug, html, isKorean]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950/20 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-3 border-indigo-200 dark:border-indigo-800 border-t-indigo-600 rounded-full"
        />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950/20 flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <span className="text-6xl mb-4 block">😢</span>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {isKorean ? '사이트를 찾을 수 없어요' : 'Site not found'}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mb-6">{error}</p>
          <Link
            href="/create"
            className="inline-block px-6 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-colors"
          >
            {isKorean ? '새로 만들기' : 'Create New'}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="flex-shrink-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-3">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <Link
              href="/create"
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors"
            >
              ←
            </Link>
            <div>
              <h1 className="font-bold text-gray-900 dark:text-white text-sm sm:text-base">
                {t('title')}
              </h1>
              <p className="text-xs text-gray-400 dark:text-gray-500 truncate max-w-[200px] sm:max-w-none">
                {siteUrl}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Undo button */}
            <button
              onClick={handleUndo}
              disabled={history.length === 0 || sending}
              className="p-2 rounded-lg text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              title={isKorean ? '실행 취소' : 'Undo'}
            >
              ↩️
            </button>

            {/* History toggle */}
            <button
              onClick={() => setShowHistory(!showHistory)}
              className={`p-2 rounded-lg text-sm font-medium transition-all ${
                showHistory
                  ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
              title={isKorean ? '히스토리' : 'History'}
            >
              📋
            </button>

            {/* Save button */}
            <button
              onClick={handleSave}
              disabled={sending || html === originalHtml}
              className="px-4 py-2 rounded-xl bg-green-600 hover:bg-green-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white text-sm font-bold transition-all disabled:cursor-not-allowed"
            >
              {sending ? '...' : (isKorean ? '저장' : 'Save')}
            </button>

            {/* Visit site */}
            <a
              href={siteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold transition-colors"
            >
              🔗 {isKorean ? '방문' : 'Visit'}
            </a>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Preview section */}
        <div className="flex-1 flex flex-col bg-gray-100 dark:bg-gray-900 relative">
          {/* View mode toggle */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1 bg-white dark:bg-gray-800 rounded-xl p-1 shadow-lg border border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setViewMode('desktop')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                viewMode === 'desktop'
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              🖥️
            </button>
            <button
              onClick={() => setViewMode('mobile')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                viewMode === 'mobile'
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              📱
            </button>
          </div>

          {/* iframe */}
          <div className="flex-1 flex items-center justify-center p-4 overflow-auto">
            <div
              className={`transition-all duration-300 ${
                viewMode === 'mobile'
                  ? 'w-[375px] h-[667px] rounded-[2.5rem] border-[10px] border-gray-800 dark:border-gray-600 shadow-2xl'
                  : 'w-full h-full max-w-5xl rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xl'
              } bg-white overflow-hidden`}
            >
              {viewMode === 'mobile' && (
                <div className="h-7 bg-gray-800 dark:bg-gray-600 flex items-center justify-center">
                  <div className="w-20 h-4 rounded-full bg-gray-900 dark:bg-gray-700" />
                </div>
              )}
              <iframe
                srcDoc={html}
                className="w-full h-full"
                sandbox="allow-scripts"
                title="Site preview"
              />
            </div>
          </div>
        </div>

        {/* Chat section */}
        <div className="w-full lg:w-[400px] flex flex-col bg-white dark:bg-gray-900 border-t lg:border-t-0 lg:border-l border-gray-200 dark:border-gray-800">
          {/* History panel */}
          <AnimatePresence>
            {showHistory && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="border-b border-gray-200 dark:border-gray-800 overflow-hidden"
              >
                <div className="p-4 max-h-48 overflow-auto">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                      {isKorean ? '수정 히스토리' : 'Edit History'}
                    </h3>
                    {history.length > 0 && (
                      <button
                        onClick={handleRestoreOriginal}
                        className="text-xs text-red-500 hover:text-red-600 font-medium"
                      >
                        {isKorean ? '원래대로' : 'Restore Original'}
                      </button>
                    )}
                  </div>
                  {history.length === 0 ? (
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      {isKorean ? '아직 수정 내역이 없어요' : 'No edits yet'}
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {history.map((entry, index) => (
                        <button
                          key={entry.id}
                          onClick={() => {
                            setHtml(entry.html);
                            setHistory(prev => prev.slice(index + 1));
                          }}
                          className="w-full text-left p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                          <p className="text-xs text-gray-600 dark:text-gray-300 truncate">
                            {entry.message}
                          </p>
                          <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
                            {entry.timestamp.toLocaleTimeString()}
                          </p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Chat messages */}
          <div
            ref={chatContainerRef}
            className="flex-1 overflow-auto p-4 space-y-3"
          >
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] px-4 py-2.5 rounded-2xl ${
                    msg.role === 'user'
                      ? 'bg-indigo-600 text-white rounded-br-md'
                      : msg.role === 'system'
                      ? 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
                      : msg.status === 'pending'
                      ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800'
                      : msg.status === 'error'
                      ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800'
                      : 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800 rounded-bl-md'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                </div>
              </motion.div>
            ))}

            {/* Loading indicator */}
            {sending && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-gray-800 rounded-2xl">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.6, repeat: Infinity }}
                    className="w-2 h-2 bg-gray-400 rounded-full"
                  />
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                    className="w-2 h-2 bg-gray-400 rounded-full"
                  />
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                    className="w-2 h-2 bg-gray-400 rounded-full"
                  />
                </div>
              </motion.div>
            )}
          </div>

          {/* Example prompts */}
          <div className="flex-shrink-0 px-4 pb-2">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {examplePrompts.map((prompt) => (
                <button
                  key={prompt.label}
                  onClick={() => handleSend(prompt.prompt)}
                  disabled={sending}
                  className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs font-medium hover:bg-indigo-100 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors disabled:opacity-50"
                >
                  <span>{prompt.emoji}</span>
                  <span>{prompt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Input area */}
          <div className="flex-shrink-0 p-4 border-t border-gray-200 dark:border-gray-800">
            <div className="flex items-end gap-2">
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={t('chatPlaceholder')}
                  rows={1}
                  className="w-full px-4 py-3 pr-12 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-indigo-400 dark:focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/30 outline-none transition-all resize-none text-sm"
                  style={{ minHeight: '48px', maxHeight: '120px' }}
                />
              </div>
              <motion.button
                onClick={() => handleSend()}
                disabled={!input.trim() || sending}
                whileTap={{ scale: 0.95 }}
                className="flex-shrink-0 w-12 h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white flex items-center justify-center transition-colors disabled:cursor-not-allowed"
              >
                {sending ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                  />
                ) : (
                  <span className="text-lg">↑</span>
                )}
              </motion.button>
            </div>
            <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-2 text-center">
              {isKorean ? 'Enter로 전송, Shift+Enter로 줄바꿈' : 'Enter to send, Shift+Enter for new line'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
