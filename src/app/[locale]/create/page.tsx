'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/routing';

type Style = 'modern' | 'minimal' | 'vivid' | 'warm';
type Color = 'indigo' | 'rose' | 'emerald' | 'amber' | 'slate';
type ViewMode = 'desktop' | 'mobile';
type Phase = 'input' | 'loading' | 'result';

const STYLES: { key: Style; emoji: string }[] = [
  { key: 'modern', emoji: '🏢' },
  { key: 'minimal', emoji: '⬜' },
  { key: 'vivid', emoji: '🎨' },
  { key: 'warm', emoji: '🌿' },
];

type Industry = 'cafe' | 'restaurant' | 'salon' | 'fitness' | 'clinic' | 'shop' | 'default';

const PRESETS_KO = [
  { emoji: '☕', label: '카페', desc: '아늑한 분위기의 동네 카페입니다. 핸드드립 커피와 수제 디저트를 판매하고, 예약도 받습니다.', slug: 'my-cafe', industry: 'cafe' as Industry },
  { emoji: '💅', label: '네일샵', desc: '트렌디한 네일아트 전문 샵입니다. 젤네일, 페디큐어, 속눈썹 연장 서비스를 제공하며 온라인 예약이 가능합니다.', slug: 'nail-shop', industry: 'salon' as Industry },
  { emoji: '🏋️', label: '헬스장/PT', desc: '1:1 퍼스널 트레이닝 전문 피트니스입니다. 체형 교정, 다이어트, 근력 강화 프로그램을 운영합니다.', slug: 'my-gym', industry: 'fitness' as Industry },
  { emoji: '🍕', label: '음식점', desc: '정성 가득한 한식 맛집입니다. 점심 특선, 저녁 코스, 단체 예약을 받으며 배달도 가능합니다.', slug: 'my-restaurant', industry: 'restaurant' as Industry },
  { emoji: '🏥', label: '병원/의원', desc: '지역 주민의 건강을 책임지는 가정의학과 의원입니다. 건강검진, 예방접종, 만성질환 관리를 합니다.', slug: 'my-clinic', industry: 'clinic' as Industry },
  { emoji: '📸', label: '사진관', desc: '프로필 사진, 가족사진, 웨딩 촬영 전문 스튜디오입니다. 자연광 스튜디오와 야외 촬영을 제공합니다.', slug: 'my-studio', industry: 'shop' as Industry },
];

const PRESETS_EN = [
  { emoji: '☕', label: 'Café', desc: 'A cozy neighborhood café serving hand-drip coffee and homemade desserts. Reservations available.', slug: 'my-cafe', industry: 'cafe' as Industry },
  { emoji: '💅', label: 'Nail Salon', desc: 'A trendy nail art salon offering gel nails, pedicures, and eyelash extensions with online booking.', slug: 'nail-salon', industry: 'salon' as Industry },
  { emoji: '🏋️', label: 'Fitness/PT', desc: 'A personal training fitness center specializing in body correction, diet, and strength programs.', slug: 'my-gym', industry: 'fitness' as Industry },
  { emoji: '🍕', label: 'Restaurant', desc: 'A charming restaurant serving authentic cuisine. Lunch specials, dinner courses, and group bookings available.', slug: 'my-restaurant', industry: 'restaurant' as Industry },
  { emoji: '🏥', label: 'Clinic', desc: 'A family medicine clinic providing health checkups, vaccinations, and chronic disease management.', slug: 'my-clinic', industry: 'clinic' as Industry },
  { emoji: '📸', label: 'Photo Studio', desc: 'A professional photography studio for portraits, family photos, and wedding shoots.', slug: 'my-studio', industry: 'shop' as Industry },
];

const INDUSTRIES: { key: Industry; emoji: string; labelKo: string; labelEn: string }[] = [
  { key: 'cafe', emoji: '☕', labelKo: '카페', labelEn: 'Café' },
  { key: 'restaurant', emoji: '🍕', labelKo: '음식점', labelEn: 'Restaurant' },
  { key: 'salon', emoji: '💇', labelKo: '미용/뷰티', labelEn: 'Beauty' },
  { key: 'fitness', emoji: '🏋️', labelKo: '피트니스', labelEn: 'Fitness' },
  { key: 'clinic', emoji: '🏥', labelKo: '병원/의원', labelEn: 'Clinic' },
  { key: 'shop', emoji: '🛍️', labelKo: '매장/샵', labelEn: 'Shop' },
  { key: 'default', emoji: '✨', labelKo: '기타', labelEn: 'Other' },
];

const COLORS: { key: Color; tw: string; ring: string }[] = [
  { key: 'indigo', tw: 'bg-indigo-500', ring: 'ring-indigo-400' },
  { key: 'rose', tw: 'bg-rose-500', ring: 'ring-rose-400' },
  { key: 'emerald', tw: 'bg-emerald-500', ring: 'ring-emerald-400' },
  { key: 'amber', tw: 'bg-amber-500', ring: 'ring-amber-400' },
  { key: 'slate', tw: 'bg-slate-600', ring: 'ring-slate-400' },
];

const PROGRESS_MESSAGES_KO = [
  '비즈니스 분석 중...',
  '디자인 컨셉 구상 중...',
  '섹션 레이아웃 설계 중...',
  '마케팅 문구 작성 중...',
  '반응형 디자인 적용 중...',
  '마무리 터치 중...',
];

const PROGRESS_MESSAGES_EN = [
  'Analyzing your business...',
  'Designing the concept...',
  'Building section layouts...',
  'Writing marketing copy...',
  'Applying responsive design...',
  'Final touches...',
];

// Slug suggestion based on business description keywords
const SLUG_KEYWORDS_KO: Record<string, string[]> = {
  'cafe': ['카페', '커피', '디저트', '베이커리', '빵'],
  'restaurant': ['음식점', '맛집', '한식', '중식', '일식', '양식', '식당', '치킨', '피자', '분식'],
  'nail': ['네일', '네일샵', '네일아트', '젤네일'],
  'beauty': ['뷰티', '미용', '헤어', '피부', '에스테틱', '속눈썹'],
  'gym': ['헬스', '피트니스', 'PT', '트레이닝', '운동', '요가', '필라테스'],
  'clinic': ['병원', '의원', '치과', '한의원', '약국', '건강검진'],
  'studio': ['사진', '촬영', '스튜디오', '웨딩'],
  'shop': ['쇼핑몰', '의류', '패션', '옷', '잡화', '꽃집', '플라워'],
  'academy': ['학원', '과외', '교육', '영어', '수학', '코딩'],
  'pet': ['펫', '애견', '동물병원', '반려동물', '고양이'],
};

function suggestSlugsFromDescription(desc: string): string[] {
  const slugs: string[] = [];
  const descLower = desc.toLowerCase();

  for (const [slug, keywords] of Object.entries(SLUG_KEYWORDS_KO)) {
    if (keywords.some(kw => descLower.includes(kw))) {
      slugs.push(`my-${slug}`);
      slugs.push(`${slug}-${Math.floor(Math.random() * 900 + 100)}`);
    }
  }

  if (slugs.length === 0) {
    slugs.push('my-site', 'my-biz');
  }

  return slugs.slice(0, 3);
}

export default function CreatePage() {
  const t = useTranslations('create');
  const tHosting = useTranslations('hosting');
  const router = useRouter();

  const [description, setDescription] = useState('');
  const [style, setStyle] = useState<Style>('modern');
  const [color, setColor] = useState<Color>('indigo');
  const [industry, setIndustry] = useState<Industry>('default');
  const [phase, setPhase] = useState<Phase>('input');
  const [progress, setProgress] = useState(0);
  const [progressMsg, setProgressMsg] = useState('');
  const [html, setHtml] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('desktop');
  const [error, setError] = useState('');
  const [slug, setSlug] = useState('');
  const [publishedUrl, setPublishedUrl] = useState('');
  const [publishing, setPublishing] = useState(false);
  const [showPublish, setShowPublish] = useState(false);
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [slugChecking, setSlugChecking] = useState(false);
  const [suggestedSlugs, setSuggestedSlugs] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const progressInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const slugDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isKorean = t('title') === 'AI 웹사이트 만들기';
  const messages = isKorean ? PROGRESS_MESSAGES_KO : PROGRESS_MESSAGES_EN;

  // Generate slug suggestions when entering publish mode
  useEffect(() => {
    if (showPublish && description) {
      setSuggestedSlugs(suggestSlugsFromDescription(description));
    }
  }, [showPublish, description]);

  const startProgress = useCallback(() => {
    let step = 0;
    setProgress(0);
    setProgressMsg(messages[0]);
    progressInterval.current = setInterval(() => {
      step++;
      if (step < messages.length) {
        setProgressMsg(messages[step]);
      }
      setProgress((prev) => Math.min(prev + Math.random() * 15 + 5, 90));
    }, 3500);
  }, [messages]);

  const stopProgress = useCallback(() => {
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
      progressInterval.current = null;
    }
    setProgress(100);
  }, []);

  const handleGenerate = async () => {
    if (!description.trim()) return;

    setError('');
    setPhase('loading');
    startProgress();

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: description.trim(), style, color, industry }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Generation failed');
      }

      stopProgress();
      setHtml(data.html);
      setTimeout(() => setPhase('result'), 400);
    } catch (err) {
      stopProgress();
      setError(err instanceof Error ? err.message : 'An error occurred');
      setPhase('input');
    }
  };

  const handleDownload = () => {
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'landing-page.html';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setPhase('input');
    setHtml('');
    setProgress(0);
    setError('');
    setSlug('');
    setPublishedUrl('');
    setShowPublish(false);
    setSlugAvailable(null);
    setSuggestedSlugs([]);
    setCopied(false);
  };

  const checkSlug = async (value: string) => {
    const cleaned = value.toLowerCase().replace(/[^a-z0-9가-힣\-]/g, '').slice(0, 50);
    setSlug(cleaned);
    setSlugAvailable(null);

    if (cleaned.length < 2) return;

    // Debounce the API call
    if (slugDebounce.current) clearTimeout(slugDebounce.current);
    setSlugChecking(true);

    slugDebounce.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/hosting/check-slug?slug=${encodeURIComponent(cleaned)}`);
        const data = await res.json();
        setSlugAvailable(data.available);
      } catch {
        // Fallback to old API
        try {
          const res = await fetch(`/api/sites?slug=${encodeURIComponent(cleaned)}`);
          const data = await res.json();
          setSlugAvailable(data.available);
        } catch {
          setSlugAvailable(null);
        }
      } finally {
        setSlugChecking(false);
      }
    }, 400);
  };

  const handlePublish = async () => {
    if (!slug || !html || !slugAvailable) return;
    setPublishing(true);
    setError('');

    try {
      const res = await fetch('/api/hosting/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug,
          title: description.slice(0, 100),
          description: description.slice(0, 300),
          html_content: html,
          business_type: 'general',
          style,
        }),
      });
      const data = await res.json();

      if (data.success || data.url) {
        setPublishedUrl(data.url || `https://agentmarket.kr/s/${slug}`);
      } else {
        // Fallback to old API
        const res2 = await fetch('/api/sites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            slug,
            title: description.slice(0, 100),
            description: description.slice(0, 300),
            html_content: html,
            business_type: 'general',
            style,
          }),
        });
        const data2 = await res2.json();
        if (data2.success) {
          setPublishedUrl(`https://agentmarket.kr/s/${slug}`);
        } else {
          setError(data2.error || data.error || 'Failed to publish');
        }
      }
    } catch {
      setError(isKorean ? '배포에 실패했습니다. 다시 시도해주세요.' : 'Failed to publish. Please try again.');
    } finally {
      setPublishing(false);
    }
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(publishedUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleKakaoShare = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const win = window as any;
    if (typeof window !== 'undefined' && win.Kakao?.Share) {
      const Kakao = win.Kakao;
      Kakao.Share.sendDefault({
        objectType: 'feed',
        content: {
          title: description.slice(0, 50) || '내 홈페이지',
          description: isKorean ? 'AI로 만든 무료 홈페이지를 확인해보세요!' : 'Check out my free AI-generated website!',
          imageUrl: 'https://agentmarket.kr/og-image.png',
          link: {
            mobileWebUrl: publishedUrl,
            webUrl: publishedUrl,
          },
        },
        buttons: [
          {
            title: isKorean ? '홈페이지 보기' : 'Visit Site',
            link: {
              mobileWebUrl: publishedUrl,
              webUrl: publishedUrl,
            },
          },
        ],
      });
    } else {
      // Fallback: copy URL with a message
      const text = isKorean
        ? `AI로 만든 내 홈페이지를 확인해보세요! ${publishedUrl}`
        : `Check out my AI-generated website! ${publishedUrl}`;
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const qrCodeUrl = publishedUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(publishedUrl)}&bgcolor=ffffff&color=000000&margin=8`
    : '';

  return (
    <>
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <span className="text-white text-sm font-bold">A</span>
            </div>
            <span className="font-bold text-gray-900 dark:text-white text-lg">
              {t('brandName')}
            </span>
          </Link>
          <Link
            href="/"
            className="text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
          >
            ← {t('backHome')}
          </Link>
        </div>
      </nav>

      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950/20 pt-16">
        <AnimatePresence mode="wait">
          {/* ─── INPUT PHASE ─── */}
          {phase === 'input' && (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="max-w-2xl mx-auto px-6 pt-12 pb-24"
            >
              {/* Header */}
              <div className="text-center mb-10">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                  className="inline-flex items-center gap-2 px-4 py-1.5 text-sm font-semibold rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700/50 mb-6"
                >
                  {t('badge')}
                </motion.div>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-3 tracking-tight">
                  {t('title')}
                </h1>
                <p className="text-gray-500 dark:text-gray-400 text-base">
                  {t('subtitle')}
                </p>
              </div>

              {/* Form */}
              <div className="space-y-6">
                {/* Quick Presets */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    {isKorean ? '⚡ 빠른 시작' : '⚡ Quick Start'}
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {(isKorean ? PRESETS_KO : PRESETS_EN).map((p) => (
                      <button
                        key={p.label}
                        onClick={() => {
                          setDescription(p.desc);
                          setIndustry(p.industry);
                        }}
                        className="flex flex-col items-center gap-1 px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all text-center"
                      >
                        <span className="text-xl">{p.emoji}</span>
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{p.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    {t('descLabel')}
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={t('descPlaceholder')}
                    rows={4}
                    maxLength={2000}
                    className="w-full px-5 py-4 rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900/30 outline-none transition-all text-base resize-none"
                  />
                  <p className="text-right text-xs text-gray-400 mt-1">
                    {description.length}/2000
                  </p>
                </div>

                {/* Style selector */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    {t('styleLabel')}
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {STYLES.map((s) => (
                      <button
                        key={s.key}
                        onClick={() => setStyle(s.key)}
                        className={`relative px-4 py-3 rounded-xl border-2 transition-all text-left ${
                          style === s.key
                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 dark:border-indigo-400 shadow-sm'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800'
                        }`}
                      >
                        <span className="text-xl mb-1 block">{s.emoji}</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {t(`style_${s.key}`)}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Industry selector */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    {isKorean ? '🏪 업종 선택' : '🏪 Industry'}
                  </label>
                  <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                    {INDUSTRIES.map((ind) => (
                      <button
                        key={ind.key}
                        onClick={() => setIndustry(ind.key)}
                        className={`flex flex-col items-center gap-1 px-2 py-2.5 rounded-xl border-2 transition-all ${
                          industry === ind.key
                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 dark:border-indigo-400'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800'
                        }`}
                      >
                        <span className="text-lg">{ind.emoji}</span>
                        <span className="text-[10px] font-medium text-gray-600 dark:text-gray-400">
                          {isKorean ? ind.labelKo : ind.labelEn}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color selector */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    {t('colorLabel')}
                  </label>
                  <div className="flex gap-3">
                    {COLORS.map((c) => (
                      <button
                        key={c.key}
                        onClick={() => setColor(c.key)}
                        className={`w-10 h-10 rounded-full ${c.tw} transition-all ${
                          color === c.key
                            ? `ring-4 ${c.ring} ring-offset-2 dark:ring-offset-gray-900 scale-110`
                            : 'hover:scale-105'
                        }`}
                        title={t(`color_${c.key}`)}
                      />
                    ))}
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm"
                  >
                    {error}
                  </motion.div>
                )}

                {/* Submit */}
                <button
                  onClick={handleGenerate}
                  disabled={!description.trim()}
                  className="w-full py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white font-bold text-lg transition-all disabled:cursor-not-allowed shadow-lg shadow-indigo-200 dark:shadow-indigo-900/30 hover:shadow-xl hover:shadow-indigo-300 dark:hover:shadow-indigo-800/40 active:scale-[0.98]"
                >
                  {t('generate')}
                </button>

                <p className="text-center text-xs text-gray-400 dark:text-gray-500">
                  {t('freeNotice')}
                </p>
              </div>
            </motion.div>
          )}

          {/* ─── LOADING PHASE ─── */}
          {phase === 'loading' && (
            <motion.div
              key="loading"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-lg mx-auto px-6 pt-32 text-center"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="w-16 h-16 mx-auto mb-8 rounded-2xl bg-indigo-600 flex items-center justify-center"
              >
                <span className="text-white text-2xl">✨</span>
              </motion.div>

              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {t('loadingTitle')}
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mb-8">
                {progressMsg}
              </p>

              <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-indigo-600 rounded-full"
                  initial={{ width: '0%' }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
              </div>
              <p className="text-sm text-gray-400 mt-3">{Math.round(progress)}%</p>
            </motion.div>
          )}

          {/* ─── RESULT PHASE ─── */}
          {phase === 'result' && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 pb-24"
            >
              {/* Toolbar */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {t('resultTitle')} 🎉
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t('resultSubtitle')}
                  </p>
                </div>

                <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
                  <button
                    onClick={() => setViewMode('desktop')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      viewMode === 'desktop'
                        ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                        : 'text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    🖥️ {t('desktop')}
                  </button>
                  <button
                    onClick={() => setViewMode('mobile')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      viewMode === 'mobile'
                        ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                        : 'text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    📱 {t('mobile')}
                  </button>
                </div>
              </div>

              {/* iframe preview */}
              <div
                className={`mx-auto transition-all duration-300 ${
                  viewMode === 'mobile' ? 'max-w-[390px]' : 'w-full'
                }`}
              >
                <div
                  className={`relative bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700 ${
                    viewMode === 'mobile'
                      ? 'rounded-[2rem] border-[8px] border-gray-800 dark:border-gray-600'
                      : ''
                  }`}
                >
                  {viewMode === 'mobile' && (
                    <div className="h-6 bg-gray-800 dark:bg-gray-600 flex items-center justify-center">
                      <div className="w-20 h-3 rounded-full bg-gray-700 dark:bg-gray-500" />
                    </div>
                  )}
                  <iframe
                    srcDoc={html}
                    className={`w-full ${viewMode === 'mobile' ? 'h-[700px]' : 'h-[600px] sm:h-[700px]'}`}
                    sandbox="allow-scripts"
                    title="Landing page preview"
                  />
                </div>
              </div>

              {/* ─── PUBLISHED SUCCESS ─── */}
              {publishedUrl && (
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                  className="mt-8 max-w-2xl mx-auto"
                >
                  {/* Success card */}
                  <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-green-900/30 dark:via-emerald-900/20 dark:to-teal-900/30 border border-green-200 dark:border-green-800 shadow-xl">
                    {/* Confetti decoration */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 via-emerald-500 to-teal-400" />

                    <div className="p-8 text-center">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 300, delay: 0.2 }}
                        className="text-6xl mb-4"
                      >
                        🎉
                      </motion.div>

                      <h3 className="text-2xl font-extrabold text-green-800 dark:text-green-200 mb-2">
                        {tHosting('published')}
                      </h3>

                      <p className="text-sm text-green-600 dark:text-green-400 mb-6">
                        {isKorean ? '누구나 이 주소로 접속할 수 있어요' : 'Anyone can access your site at this URL'}
                      </p>

                      {/* URL display */}
                      <div className="flex items-center gap-2 justify-center bg-white dark:bg-gray-800 rounded-2xl px-5 py-3 border border-green-200 dark:border-green-700 mb-6 mx-auto max-w-md">
                        <span className="text-green-600 dark:text-green-400">🔗</span>
                        <a
                          href={publishedUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-700 dark:text-green-300 font-mono text-sm hover:underline truncate"
                        >
                          {publishedUrl}
                        </a>
                        <button
                          onClick={handleCopyUrl}
                          className="flex-shrink-0 px-3 py-1.5 rounded-lg bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-300 text-xs font-bold hover:bg-green-200 dark:hover:bg-green-700 transition-colors"
                        >
                          {copied ? '✅ 복사됨!' : (tHosting('copyUrl'))}
                        </button>
                      </div>

                      {/* QR Code */}
                      <div className="mb-6">
                        <img
                          src={qrCodeUrl}
                          alt="QR Code"
                          className="w-32 h-32 mx-auto rounded-xl border-2 border-green-200 dark:border-green-700 bg-white p-1"
                        />
                        <p className="text-xs text-green-500 dark:text-green-500 mt-2">
                          {isKorean ? 'QR코드로 모바일에서 바로 확인' : 'Scan QR to view on mobile'}
                        </p>
                      </div>

                      {/* Action buttons */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-lg mx-auto">
                        {/* Edit button */}
                        <button
                          onClick={() => router.push(`/edit/${slug}`)}
                          className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-white dark:bg-gray-800 border-2 border-indigo-200 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300 font-bold text-sm hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all active:scale-[0.97]"
                        >
                          ✏️ {tHosting('edit')}
                        </button>

                        {/* Kakao share */}
                        <button
                          onClick={handleKakaoShare}
                          className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-[#FEE500] text-[#3C1E1E] font-bold text-sm hover:bg-[#F5DC00] transition-all active:scale-[0.97] shadow-sm"
                        >
                          💬 {isKorean ? '카카오톡 공유' : 'Share via Kakao'}
                        </button>

                        {/* Visit site */}
                        <a
                          href={publishedUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-green-600 text-white font-bold text-sm hover:bg-green-700 transition-all active:scale-[0.97] shadow-lg shadow-green-200 dark:shadow-green-900/30"
                        >
                          🌐 {isKorean ? '사이트 방문' : 'Visit Site'}
                        </a>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ─── ACTION BUTTONS (before publish) ─── */}
              {!publishedUrl && (
                <div className="flex flex-col sm:flex-row gap-3 mt-6 max-w-2xl mx-auto">
                  {!showPublish && (
                    <motion.button
                      onClick={() => setShowPublish(true)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 py-4 px-6 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold text-base transition-all shadow-lg shadow-green-200 dark:shadow-green-900/30"
                    >
                      🌐 {tHosting('publishFree')}
                    </motion.button>
                  )}
                  <button
                    onClick={handleDownload}
                    className={`${showPublish ? 'flex-1' : 'flex-1'} py-4 px-6 rounded-2xl ${
                      showPublish
                        ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 dark:shadow-indigo-900/30'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    } font-bold text-sm transition-all active:scale-[0.98]`}
                  >
                    📥 {t('download')}
                  </button>
                </div>
              )}

              {/* ─── PUBLISH FORM (slug input) ─── */}
              {showPublish && !publishedUrl && (
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                  className="mt-6 max-w-2xl mx-auto"
                >
                  <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-2xl">
                    {/* Gradient top border */}
                    <div className="h-1 bg-gradient-to-r from-green-400 via-emerald-500 to-teal-400" />

                    <div className="p-6 sm:p-8">
                      <div className="text-center mb-6">
                        <span className="text-4xl mb-2 block">🌐</span>
                        <h3 className="text-xl font-extrabold text-gray-900 dark:text-white mb-1">
                          {tHosting('enterSlug')}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {isKorean
                            ? '영어 소문자, 숫자, 하이픈만 사용해요'
                            : 'Lowercase letters, numbers, and hyphens only'}
                        </p>
                      </div>

                      {/* Slug suggestions */}
                      {suggestedSlugs.length > 0 && !slug && (
                        <div className="mb-4">
                          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                            {isKorean ? '💡 추천 주소' : '💡 Suggested URLs'}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {suggestedSlugs.map((s) => (
                              <button
                                key={s}
                                onClick={() => checkSlug(s)}
                                className="px-3 py-1.5 rounded-full bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 text-green-700 dark:text-green-300 text-xs font-medium hover:bg-green-100 dark:hover:bg-green-800/40 transition-colors"
                              >
                                {s}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* URL input */}
                      <div className="mb-4">
                        <div className="flex items-center rounded-2xl border-2 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 overflow-hidden focus-within:border-green-400 dark:focus-within:border-green-500 transition-colors">
                          <span className="px-4 py-3.5 text-sm text-gray-400 dark:text-gray-500 whitespace-nowrap bg-gray-100 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-600">
                            agentmarket.kr/s/
                          </span>
                          <input
                            type="text"
                            value={slug}
                            onChange={(e) => checkSlug(e.target.value)}
                            placeholder={isKorean ? 'my-cafe' : 'my-cafe'}
                            className="flex-1 px-4 py-3.5 text-sm font-mono bg-transparent text-gray-900 dark:text-white focus:outline-none"
                          />
                          {slugChecking && (
                            <div className="px-3">
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                className="w-5 h-5 border-2 border-gray-300 border-t-green-500 rounded-full"
                              />
                            </div>
                          )}
                        </div>

                        {/* Availability feedback */}
                        {slug.length >= 2 && !slugChecking && (
                          <motion.div
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-2 px-1"
                          >
                            {slugAvailable === true && (
                              <div className="flex items-center gap-2">
                                <span className="text-green-500">✅</span>
                                <span className="text-xs font-medium text-green-600 dark:text-green-400">
                                  {isKorean ? '사용 가능한 주소예요!' : 'This URL is available!'}
                                </span>
                              </div>
                            )}
                            {slugAvailable === false && (
                              <div className="flex items-center gap-2">
                                <span className="text-red-500">❌</span>
                                <span className="text-xs font-medium text-red-600 dark:text-red-400">
                                  {isKorean ? '이미 사용 중인 주소예요' : 'This URL is already taken'}
                                </span>
                              </div>
                            )}
                          </motion.div>
                        )}

                        {/* URL preview */}
                        {slug && (
                          <div className="mt-3 px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-dashed border-gray-200 dark:border-gray-600">
                            <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">
                              {tHosting('preview')}
                            </p>
                            <p className="text-sm font-mono text-gray-700 dark:text-gray-300">
                              agentmarket.kr/s/<span className="text-green-600 dark:text-green-400 font-bold">{slug}</span>
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Error */}
                      {error && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm"
                        >
                          {error}
                        </motion.div>
                      )}

                      {/* Publish button */}
                      <motion.button
                        onClick={handlePublish}
                        disabled={!slugAvailable || publishing || slugChecking}
                        whileHover={slugAvailable && !publishing ? { scale: 1.01 } : {}}
                        whileTap={slugAvailable && !publishing ? { scale: 0.98 } : {}}
                        className="w-full py-4 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-300 disabled:to-gray-400 dark:disabled:from-gray-600 dark:disabled:to-gray-700 text-white font-bold text-base transition-all disabled:cursor-not-allowed shadow-lg shadow-green-200 dark:shadow-green-900/30 disabled:shadow-none"
                      >
                        {publishing ? (
                          <span className="flex items-center justify-center gap-2">
                            <motion.span
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                              className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                            />
                            {isKorean ? '배포 중...' : 'Publishing...'}
                          </span>
                        ) : (
                          <>🚀 {isKorean ? '지금 바로 공개하기' : 'Go Live Now'}</>
                        )}
                      </motion.button>

                      <button
                        onClick={() => { setShowPublish(false); setError(''); }}
                        className="w-full mt-3 py-2 text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                      >
                        {isKorean ? '나중에 할게요' : 'Maybe later'}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Download button when published */}
              {publishedUrl && (
                <div className="flex gap-3 mt-4 max-w-2xl mx-auto">
                  <button
                    onClick={handleDownload}
                    className="flex-1 py-3 px-4 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-medium text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
                  >
                    📥 {t('download')}
                  </button>
                </div>
              )}

              {/* Reset */}
              <div className="text-center mt-6">
                <button
                  onClick={handleReset}
                  className="text-sm text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors"
                >
                  🔄 {t('reset')}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </>
  );
}
