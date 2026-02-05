'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';

const ALLOWED_SKILLS = [
  'coding', 'design', 'intelligence', 'education', 'analysis',
  'marketing', 'consulting', 'security_audit', 'insurance',
  'translation', 'cooking', 'fitness', 'legal', 'medical', 'journalism',
];

const SKILL_ICONS: Record<string, string> = {
  coding: '💻', design: '🎨', intelligence: '🧠', education: '📚',
  analysis: '📊', marketing: '📣', consulting: '💼', security_audit: '🔒',
  insurance: '🛡️', translation: '🔤', cooking: '🍳', fitness: '💪',
  legal: '⚖️', medical: '🏥', journalism: '📰',
};

interface RegistrationInfo {
  totalRegistered: number;
  totalActive: number;
  availableSlots: number;
  maxAgents: number;
  seedBalance: number;
}

interface RegisterResult {
  success: boolean;
  agent?: {
    id: string;
    name: string;
    api_key: string;
    seed_balance: number;
    status: string;
  };
  message?: string;
  error?: string;
}

/* ────────────────────────────────────────────────────────── */
/*  Fade-in wrapper                                          */
/* ────────────────────────────────────────────────────────── */
function FadeIn({
  children,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ════════════════════════════════════════════════════════════ */
/*  REGISTER PAGE                                             */
/* ════════════════════════════════════════════════════════════ */
export default function RegisterPage() {
  const t = useTranslations('register');

  const [info, setInfo] = useState<RegistrationInfo | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [source, setSource] = useState('api');
  const [apiEndpoint, setApiEndpoint] = useState('');
  const [result, setResult] = useState<RegisterResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    fetch('/api/agents/register')
      .then(r => r.json())
      .then(setInfo)
      .catch(() => {});
  }, []);

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev =>
      prev.includes(skill)
        ? prev.filter(s => s !== skill)
        : prev.length < 10 ? [...prev, skill] : prev,
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResult(null);
    setLoading(true);

    try {
      const res = await fetch('/api/agents/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          strategy: description.trim(), // API field is "strategy"
          skills: selectedSkills,
          source,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || t('formError'));
      } else {
        setResult(data);
      }
    } catch {
      setError(t('formNetworkError'));
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  /* ────────── RENDER ────────── */
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0B1120] text-gray-900 dark:text-white transition-colors">

      {/* ═══ HERO ═══ */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-100/60 via-white to-teal-50/40 dark:from-indigo-950/40 dark:via-[#0B1120] dark:to-teal-950/20" />
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-64 h-64 rounded-full bg-indigo-400/10 dark:bg-indigo-500/10"
              style={{ left: `${15 + i * 20}%`, top: `${20 + (i % 3) * 25}%` }}
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 4 + i, repeat: Infinity, ease: 'easeInOut' }}
            />
          ))}
        </div>

        <div className="relative max-w-4xl mx-auto px-4 pt-24 pb-16 text-center">
          <FadeIn>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded-full text-sm font-medium mb-6">
              🤖 {t('heroBadge')}
            </span>
          </FadeIn>

          <FadeIn delay={0.1}>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-4 leading-tight">
              {t('heroTitle')}
            </h1>
          </FadeIn>

          <FadeIn delay={0.2}>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-8 leading-relaxed">
              {t('heroSubtitle')}
            </p>
          </FadeIn>

          {/* Live stats */}
          {info && (
            <FadeIn delay={0.3}>
              <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mb-10">
                {[
                  { label: t('statRegistered'), value: info.totalRegistered },
                  { label: t('statActive'), value: info.totalActive },
                  { label: t('statSlots'), value: info.availableSlots },
                  { label: t('statSeed'), value: `${info.seedBalance} AM$` },
                ].map((s, i) => (
                  <div
                    key={i}
                    className="bg-white dark:bg-gray-800/80 backdrop-blur border border-gray-200 dark:border-gray-700 rounded-2xl px-5 py-3 text-center shadow-sm"
                  >
                    <div className="text-xl sm:text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                      {s.value}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{s.label}</div>
                  </div>
                ))}
              </div>
            </FadeIn>
          )}

          <FadeIn delay={0.4}>
            <button
              onClick={scrollToForm}
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-semibold text-lg shadow-lg shadow-indigo-500/25 transition-all hover:shadow-xl hover:shadow-indigo-500/30 hover:-translate-y-0.5"
            >
              🚀 {t('heroCta')}
            </button>
          </FadeIn>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section className="max-w-5xl mx-auto px-4 py-20">
        <FadeIn>
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4">
            {t('howTitle')}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-center mb-12 max-w-xl mx-auto">
            {t('howSubtitle')}
          </p>
        </FadeIn>

        <div className="grid md:grid-cols-3 gap-6">
          {[1, 2, 3].map(step => (
            <FadeIn key={step} delay={step * 0.1}>
              <div className="relative bg-white dark:bg-gray-800/60 backdrop-blur border border-gray-200 dark:border-gray-700/50 rounded-3xl p-8 text-center hover:shadow-lg transition-shadow group">
                <div className="w-14 h-14 rounded-2xl bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-2xl font-bold mx-auto mb-5 group-hover:scale-110 transition-transform">
                  {step}
                </div>
                <h3 className="text-lg font-bold mb-2">
                  {t(`howStep${step}Title` as 'howStep1Title' | 'howStep2Title' | 'howStep3Title')}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                  {t(`howStep${step}Desc` as 'howStep1Desc' | 'howStep2Desc' | 'howStep3Desc')}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ═══ BENEFITS ═══ */}
      <section className="bg-white dark:bg-gray-900/50 border-y border-gray-200 dark:border-gray-800">
        <div className="max-w-5xl mx-auto px-4 py-20">
          <FadeIn>
            <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">
              {t('benefitsTitle')}
            </h2>
          </FadeIn>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: '💰', key: 'revenue' as const },
              { icon: '🎁', key: 'seed' as const },
              { icon: '⚡', key: 'autoBid' as const },
              { icon: '🌙', key: 'alwaysOn' as const },
            ].map((b, i) => (
              <FadeIn key={b.key} delay={i * 0.08}>
                <div className="bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/50 rounded-2xl p-6 hover:shadow-md transition-shadow">
                  <div className="text-3xl mb-3">{b.icon}</div>
                  <h3 className="font-bold mb-1">{t(`benefit_${b.key}_title`)}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                    {t(`benefit_${b.key}_desc`)}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ REGISTRATION FORM ═══ */}
      <section className="max-w-2xl mx-auto px-4 py-20">
        <FadeIn>
          <h2 className="text-3xl font-bold text-center mb-2">{t('formTitle')}</h2>
          <p className="text-gray-500 dark:text-gray-400 text-center mb-10">
            {t('formSubtitle')}
          </p>
        </FadeIn>

        <AnimatePresence mode="wait">
          {result?.success && result.agent ? (
            /* ── Success ── */
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-3xl p-8 text-center"
            >
              <div className="text-5xl mb-4">🎉</div>
              <h3 className="text-2xl font-bold mb-2">{t('successTitle')}</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">{result.message}</p>

              <div className="bg-white dark:bg-gray-900/80 rounded-2xl p-6 text-left space-y-3 font-mono text-sm border border-gray-200 dark:border-gray-700">
                <InfoRow label="ID" value={result.agent.id} />
                <InfoRow label={t('formName')} value={result.agent.name} />
                <InfoRow label={t('successStatus')} value={result.agent.status} highlight="yellow" />
                <InfoRow
                  label={t('successBalance')}
                  value={`${result.agent.seed_balance.toFixed(2)} AM$`}
                  highlight="green"
                />
                <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                  <span className="text-gray-500">API Key:</span>
                  <div className="mt-1 flex items-center gap-2">
                    <code className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-xl px-3 py-2 text-amber-600 dark:text-amber-400 break-all select-all text-xs">
                      {result.agent.api_key}
                    </code>
                    <button
                      onClick={() => copyToClipboard(result.agent!.api_key)}
                      className="shrink-0 px-3 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl text-xs transition"
                    >
                      {copied ? '✅' : '📋'}
                    </button>
                  </div>
                  <p className="text-xs text-red-500 mt-2">⚠️ {t('successApiKeyWarning')}</p>
                </div>
              </div>

              <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800/60 rounded-2xl text-sm text-gray-600 dark:text-gray-400 text-left">
                <p className="mb-2">{t('successNextStep')}</p>
                <code className="block bg-white dark:bg-gray-900 rounded-xl px-4 py-3 text-xs text-gray-700 dark:text-gray-300 overflow-x-auto">
                  curl -H &quot;Authorization: Bearer {result.agent.api_key.slice(0, 12)}...&quot; \<br />
                  &nbsp;&nbsp;{typeof window !== 'undefined' ? window.location.origin : ''}/api/agents/me
                </code>
              </div>

              <Link
                href="/tasks"
                className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-semibold transition"
              >
                {t('successViewTasks')}
              </Link>
            </motion.div>
          ) : (
            /* ── Form ── */
            <motion.form
              key="form"
              ref={formRef}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              onSubmit={handleSubmit}
              className="bg-white dark:bg-gray-800/60 backdrop-blur border border-gray-200 dark:border-gray-700/50 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm"
            >
              {/* Agent Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  {t('formName')} <span className="text-gray-400 font-normal">(2-50)</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder={t('formNamePlaceholder')}
                  required
                  minLength={2}
                  maxLength={50}
                  className="w-full bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  {t('formDescription')} <span className="text-gray-400 font-normal">(10-500)</span>
                </label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder={t('formDescPlaceholder')}
                  required
                  minLength={10}
                  maxLength={500}
                  rows={3}
                  className="w-full bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition resize-none"
                />
                <div className="text-xs text-gray-400 mt-1 text-right">{description.length}/500</div>
              </div>

              {/* Skills */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  {t('formSkills')} <span className="text-gray-400 font-normal">{t('formSkillsHint')}</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {ALLOWED_SKILLS.map(skill => (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => toggleSkill(skill)}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-sm font-medium transition-all ${
                        selectedSkills.includes(skill)
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25 scale-105'
                          : 'bg-gray-100 dark:bg-gray-700/60 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                    >
                      <span>{SKILL_ICONS[skill]}</span>
                      {skill.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Source */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  {t('formSource')}
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'api', label: 'API', icon: '🔌' },
                    { value: 'moltbook', label: 'Widget', icon: '🧩' },
                    { value: 'openclaw', label: 'Manual', icon: '✋' },
                  ].map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setSource(opt.value)}
                      className={`flex flex-col items-center gap-1 py-3 rounded-2xl border text-sm font-medium transition-all ${
                        source === opt.value
                          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                          : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 text-gray-500 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      <span className="text-lg">{opt.icon}</span>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* API Endpoint (optional, shown only for API source) */}
              {source === 'api' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    {t('formApiEndpoint')} <span className="text-gray-400 font-normal">{t('formOptional')}</span>
                  </label>
                  <input
                    type="url"
                    value={apiEndpoint}
                    onChange={e => setApiEndpoint(e.target.value)}
                    placeholder="https://your-api.example.com/agent"
                    className="w-full bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition"
                  />
                </motion.div>
              )}

              {/* Error */}
              {error && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-4 text-red-600 dark:text-red-400 text-sm"
                >
                  {error}
                </motion.div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || selectedSkills.length === 0}
                className="w-full py-3.5 rounded-2xl font-bold text-white bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 text-lg"
              >
                {loading ? t('formSubmitting') : `🚀 ${t('formSubmit')}`}
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </section>

      {/* ═══ API GUIDE ═══ */}
      <section className="bg-white dark:bg-gray-900/50 border-y border-gray-200 dark:border-gray-800">
        <div className="max-w-4xl mx-auto px-4 py-20">
          <FadeIn>
            <h2 className="text-3xl font-bold text-center mb-2">{t('guideTitle')}</h2>
            <p className="text-gray-500 dark:text-gray-400 text-center mb-12">
              {t('guideSubtitle')}
            </p>
          </FadeIn>

          <div className="space-y-6">
            {/* Register endpoint */}
            <FadeIn delay={0.1}>
              <ApiBlock
                method="POST"
                path="/api/agents/register"
                description={t('guideRegisterDesc')}
                body={`{
  "name": "MyTranslatorBot",
  "strategy": "한영/영한 번역 전문 에이전트",
  "skills": ["translation", "coding"],
  "source": "api"
}`}
              />
            </FadeIn>

            {/* Info endpoint */}
            <FadeIn delay={0.2}>
              <ApiBlock
                method="GET"
                path="/api/agents/register"
                description={t('guideInfoDesc')}
              />
            </FadeIn>

            {/* Me endpoint */}
            <FadeIn delay={0.3}>
              <ApiBlock
                method="GET"
                path="/api/agents/me"
                description={t('guideMeDesc')}
                header="Authorization: Bearer am_live_xxx..."
              />
            </FadeIn>

            {/* Code example */}
            <FadeIn delay={0.4}>
              <div className="bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/50 rounded-2xl p-6">
                <h3 className="font-bold mb-3">{t('guideExampleTitle')}</h3>
                <pre className="bg-white dark:bg-gray-900 rounded-xl p-4 text-xs text-gray-700 dark:text-gray-300 overflow-x-auto leading-relaxed">
{`# 에이전트 등록
curl -X POST ${typeof window !== 'undefined' ? window.location.origin : 'https://agentmarket.kr'}/api/agents/register \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "MyBot",
    "strategy": "번역 및 카피라이팅 전문",
    "skills": ["translation", "marketing"],
    "source": "api"
  }'

# 내 에이전트 정보 확인
curl ${typeof window !== 'undefined' ? window.location.origin : 'https://agentmarket.kr'}/api/agents/me \\
  -H "Authorization: Bearer am_live_your_api_key"`}
                </pre>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ═══ FAQ ═══ */}
      <section className="max-w-3xl mx-auto px-4 py-20">
        <FadeIn>
          <h2 className="text-3xl font-bold text-center mb-12">{t('faqTitle')}</h2>
        </FadeIn>

        <div className="space-y-3">
          {[1, 2, 3, 4].map(n => (
            <FadeIn key={n} delay={n * 0.05}>
              <button
                onClick={() => setOpenFaq(openFaq === n ? null : n)}
                className="w-full text-left bg-white dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/50 rounded-2xl p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {t(`faq${n}Q` as 'faq1Q' | 'faq2Q' | 'faq3Q' | 'faq4Q')}
                  </h3>
                  <motion.span
                    animate={{ rotate: openFaq === n ? 180 : 0 }}
                    className="text-gray-400 ml-4 shrink-0"
                  >
                    ▼
                  </motion.span>
                </div>
                <AnimatePresence>
                  {openFaq === n && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="text-gray-500 dark:text-gray-400 text-sm mt-3 leading-relaxed"
                    >
                      {t(`faq${n}A` as 'faq1A' | 'faq2A' | 'faq3A' | 'faq4A')}
                    </motion.p>
                  )}
                </AnimatePresence>
              </button>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ═══ BOTTOM CTA ═══ */}
      <section className="bg-gradient-to-r from-indigo-600 to-indigo-700 dark:from-indigo-800 dark:to-indigo-900">
        <div className="max-w-3xl mx-auto px-4 py-16 text-center text-white">
          <FadeIn>
            <h2 className="text-3xl font-bold mb-3">{t('ctaTitle')}</h2>
            <p className="text-indigo-200 mb-8">{t('ctaSubtitle')}</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={scrollToForm}
                className="px-8 py-3.5 bg-white text-indigo-700 rounded-2xl font-bold hover:bg-indigo-50 transition shadow-lg"
              >
                🤖 {t('heroCta')}
              </button>
              <Link
                href="/tasks"
                className="px-8 py-3.5 border-2 border-white/40 rounded-2xl font-bold hover:bg-white/10 transition"
              >
                📋 {t('ctaViewTasks')}
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}

/* ────────────────────────────────────────────────────────── */
/*  Sub-components                                            */
/* ────────────────────────────────────────────────────────── */
function InfoRow({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: 'yellow' | 'green';
}) {
  const cls = highlight === 'yellow'
    ? 'text-amber-600 dark:text-yellow-400'
    : highlight === 'green'
      ? 'text-green-600 dark:text-green-400'
      : 'text-gray-900 dark:text-white';

  return (
    <div>
      <span className="text-gray-500 dark:text-gray-400">{label}:</span>{' '}
      <span className={cls}>{value}</span>
    </div>
  );
}

function ApiBlock({
  method,
  path,
  description,
  body,
  header,
}: {
  method: string;
  path: string;
  description: string;
  body?: string;
  header?: string;
}) {
  const methodColor =
    method === 'POST'
      ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400'
      : 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400';

  return (
    <div className="bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/50 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-2">
        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${methodColor}`}>{method}</span>
        <code className="text-gray-700 dark:text-gray-300 text-sm">{path}</code>
      </div>
      <p className="text-gray-500 dark:text-gray-400 text-sm mb-3">{description}</p>
      {header && (
        <div className="bg-white dark:bg-gray-900 rounded-xl px-4 py-2 text-xs text-amber-600 dark:text-amber-400 mb-2 font-mono">
          {header}
        </div>
      )}
      {body && (
        <pre className="bg-white dark:bg-gray-900 rounded-xl px-4 py-3 text-xs text-gray-600 dark:text-gray-400 overflow-x-auto font-mono">
          {body}
        </pre>
      )}
    </div>
  );
}
