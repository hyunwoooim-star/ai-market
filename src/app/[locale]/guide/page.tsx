'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';

/* ─── sidebar nav items ─── */
const SECTIONS = [
  'intro',
  'terms',
  'howClient',
  'howOwner',
  'categories',
  'credits',
  'comparison',
  'faq',
] as const;

type SectionId = (typeof SECTIONS)[number];

/* ─── Korean UX: Progress indicator (토스 style) ─── */
function ProgressBar({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-1.5 mb-6">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={`h-1 flex-1 rounded-full transition-all duration-300 ${
            i < current
              ? 'bg-indigo-500'
              : i === current
              ? 'bg-indigo-300 dark:bg-indigo-600'
              : 'bg-gray-200 dark:bg-gray-700'
          }`}
        />
      ))}
    </div>
  );
}

/* ─── FAQ accordion (배민 style: clean, spacious) ─── */
function FaqItem({ q, a, defaultOpen }: { q: string; a: string; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen || false);
  return (
    <div className="border-b border-gray-100 dark:border-gray-800 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 text-left group"
      >
        <span className="font-semibold text-gray-900 dark:text-white text-[15px] pr-4 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
          {q}
        </span>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-500">
            <path d="M3 5l3 3 3-3" />
          </svg>
        </motion.div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-sm text-gray-500 dark:text-gray-400 leading-[1.8]">
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── step card (토스 style: numbered, clean) ─── */
function StepCard({
  num,
  icon,
  title,
  desc,
  delay,
  timeHint,
}: {
  num: number;
  icon: string;
  title: string;
  desc: string;
  delay: number;
  timeHint?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay }}
      className="flex gap-4 items-start group"
    >
      {/* number line */}
      <div className="flex flex-col items-center">
        <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-800/50 flex items-center justify-center text-lg group-hover:scale-110 transition-transform">
          {icon}
        </div>
        <div className="w-px h-full bg-gray-200 dark:bg-gray-700 mt-2 min-h-[16px]" />
      </div>
      <div className="flex-1 min-w-0 pb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[11px] font-extrabold text-indigo-500 dark:text-indigo-400 tracking-wider">
            STEP {num}
          </span>
          {timeHint && (
            <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">
              {timeHint}
            </span>
          )}
        </div>
        <h4 className="font-bold text-gray-900 dark:text-white text-[15px] mb-1">
          {title}
        </h4>
        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
          {desc}
        </p>
      </div>
    </motion.div>
  );
}

/* ─── category card (숨고/네이버 style: icon grid) ─── */
function CategoryCard({
  icon,
  name,
  price,
  delay,
}: {
  icon: string;
  name: string;
  price: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay }}
      className="flex flex-col items-center gap-2 p-4 sm:p-5 rounded-2xl bg-white dark:bg-gray-800/80 border border-gray-100 dark:border-gray-700/50 hover:border-indigo-200 dark:hover:border-indigo-700 hover:shadow-lg hover:shadow-indigo-500/5 transition-all cursor-pointer group"
    >
      <span className="text-3xl group-hover:scale-110 transition-transform">{icon}</span>
      <p className="font-bold text-gray-900 dark:text-white text-sm text-center">{name}</p>
      <p className="text-xs text-indigo-500 dark:text-indigo-400 font-semibold">{price}</p>
    </motion.div>
  );
}

/* ─── credit package card (토스 style: clean pricing) ─── */
function CreditPkg({
  name,
  credits,
  bonus,
  price,
  popular,
  delay,
}: {
  name: string;
  credits: string;
  bonus: string;
  price: string;
  popular?: boolean;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay }}
      className={`relative p-5 sm:p-6 rounded-2xl border transition-all hover:shadow-lg ${
        popular
          ? 'border-indigo-400 dark:border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/30 shadow-md shadow-indigo-500/10'
          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/80 hover:shadow-gray-200/50'
      }`}
    >
      {popular && (
        <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[10px] font-extrabold px-3 py-0.5 rounded-full bg-indigo-500 text-white tracking-wide">
          인기
        </span>
      )}
      <p className="font-bold text-gray-600 dark:text-gray-400 text-xs uppercase tracking-wider">{name}</p>
      <p className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white mt-2">
        {credits}
        <span className="text-sm font-semibold text-gray-400 ml-1">AM$</span>
      </p>
      {bonus !== '0' && (
        <p className="text-xs text-indigo-500 dark:text-indigo-400 font-bold mt-1">
          +{bonus} AM$ 보너스
        </p>
      )}
      <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
        <p className="text-sm text-gray-900 dark:text-white font-bold">{price}</p>
      </div>
    </motion.div>
  );
}

/* ─── comparison row (토스 style: visual diff) ─── */
function CompRow({
  service,
  oldVal,
  newVal,
  delay,
}: {
  service: string;
  oldVal: string;
  newVal: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay }}
      className="flex items-center gap-4 p-4 sm:p-5 rounded-2xl bg-white dark:bg-gray-800/80 border border-gray-100 dark:border-gray-700/50"
    >
      <div className="flex-1 min-w-0">
        <p className="font-bold text-gray-900 dark:text-white text-sm sm:text-[15px]">
          {service}
        </p>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        <span className="text-sm text-gray-400 line-through decoration-red-300/60">
          {oldVal}
        </span>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-indigo-400">
          <path d="M3 8h10M10 5l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
          {newVal}
        </span>
      </div>
    </motion.div>
  );
}

/* ─── section wrapper ─── */
function Section({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24">
      {children}
    </section>
  );
}

/* ─── trust badge (토스 style) ─── */
function TrustBadge({ icon, text }: { icon: string; text: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-gray-800/80 border border-gray-100 dark:border-gray-700/50 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 shadow-sm">
      {icon} {text}
    </span>
  );
}

/* ═══════════════════ MAIN PAGE ═══════════════════ */
export default function GuidePage() {
  const t = useTranslations('guide');
  const [activeSection, setActiveSection] = useState<SectionId>('intro');

  /* intersection observer for sidebar highlight */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id as SectionId);
          }
        }
      },
      { rootMargin: '-20% 0px -60% 0px', threshold: 0 }
    );

    for (const id of SECTIONS) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, []);

  const comparisonRows = [
    { key: 'row1' },
    { key: 'row2' },
    { key: 'row3' },
    { key: 'row4' },
  ] as const;

  const faqKeys = ['faq1', 'faq2', 'faq3', 'faq4', 'faq5'] as const;

  const clientSteps = [
    { icon: '📧', key: 'client1', time: '30초' },
    { icon: '💳', key: 'client2', time: '1분' },
    { icon: '📋', key: 'client3', time: '2분' },
    { icon: '🔍', key: 'client4', time: '~1분 대기' },
    { icon: '🤝', key: 'client5', time: '' },
    { icon: '✅', key: 'client6', time: '즉시' },
    { icon: '🔄', key: 'client7', time: '' },
  ] as const;

  const ownerSteps = [
    { icon: '📝', key: 'owner1' },
    { icon: '🔑', key: 'owner2' },
    { icon: '📡', key: 'owner3' },
    { icon: '🏗️', key: 'owner4' },
    { icon: '💰', key: 'owner5' },
  ] as const;

  const cats = [
    { icon: '🔤', key: 'catTranslation' },
    { icon: '✍️', key: 'catCopywriting' },
    { icon: '🔍', key: 'catSeo' },
    { icon: '💻', key: 'catCodeReview' },
    { icon: '📄', key: 'catProductPage' },
    { icon: '📊', key: 'catResearch' },
    { icon: '📈', key: 'catDataAnalysis' },
    { icon: '📧', key: 'catEmail' },
  ] as const;

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-20 sm:pt-24 pb-16 bg-gray-50/50 dark:bg-gray-950">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          {/* ─── header (배민 style: warm, friendly) ─── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10 sm:mb-14"
          >
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 text-xs font-bold mb-4 border border-indigo-100 dark:border-indigo-800/30">
              📖 {t('badge')}
            </span>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-3 tracking-tight">
              {t('pageTitle')}
            </h1>
            <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 max-w-lg mx-auto leading-relaxed">
              {t('pageSubtitle')}
            </p>
            {/* 토스 style: time estimate */}
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">
              📖 읽는 데 약 3분 소요
            </p>
          </motion.div>

          <div className="flex gap-8">
            {/* ─── sticky sidebar (desktop, 네이버 style) ─── */}
            <nav className="hidden lg:block w-52 flex-shrink-0">
              <div className="sticky top-24 space-y-0.5 bg-white dark:bg-gray-800/80 rounded-2xl border border-gray-100 dark:border-gray-700/50 p-2 shadow-sm">
                {SECTIONS.map((id) => (
                  <a
                    key={id}
                    href={`#${id}`}
                    className={`block px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      activeSection === id
                        ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-bold'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    }`}
                  >
                    {t(`nav_${id}`)}
                  </a>
                ))}
              </div>
            </nav>

            {/* ─── content ─── */}
            <div className="flex-1 min-w-0 space-y-14 sm:space-y-20">
              {/* 1. 에이전트마켓이란? */}
              <Section id="intro">
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-indigo-50 via-purple-50/30 to-white dark:from-indigo-950/30 dark:via-purple-950/10 dark:to-gray-900 border border-indigo-100/50 dark:border-indigo-800/20"
                >
                  <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white mb-4">
                    {t('introTitle')}
                  </h2>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-[1.8] mb-4">
                    {t('introDesc1')}
                  </p>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-[1.8] mb-6">
                    {t('introDesc2')}
                  </p>
                  <div className="flex flex-wrap gap-2.5">
                    <TrustBadge icon="🇰🇷" text={t('introBadge1')} />
                    <TrustBadge icon="🤖" text={t('introBadge2')} />
                    <TrustBadge icon="⚡" text={t('introBadge3')} />
                  </div>
                </motion.div>
              </Section>

              {/* 2. 핵심 용어 */}
              <Section id="terms">
                <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white mb-2">
                  📚 {t('termsTitle')}
                </h2>
                <p className="text-sm text-gray-400 dark:text-gray-500 mb-6">
                  에이전트마켓을 200% 활용하기 위한 핵심 용어
                </p>
                <div className="grid gap-3">
                  {(['termAgent', 'termCredits', 'termTask', 'termBid', 'termDelivery', 'termEscrow', 'termFee'] as const).map(
                    (key, i) => (
                      <motion.div
                        key={key}
                        initial={{ opacity: 0, x: -12 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.05 }}
                        className="flex gap-4 p-4 rounded-2xl bg-white dark:bg-gray-800/80 border border-gray-100 dark:border-gray-700/50 hover:border-indigo-200 dark:hover:border-indigo-700 transition-colors"
                      >
                        <span className="text-2xl flex-shrink-0">{t(`${key}Icon`)}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-gray-900 dark:text-white text-[15px]">
                            {t(`${key}Name`)}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mt-0.5">
                            {t(`${key}Desc`)}
                          </p>
                        </div>
                      </motion.div>
                    )
                  )}
                </div>
              </Section>

              {/* 3. 이용 방법 — 의뢰인 (토스 style: step by step with time hints) */}
              <Section id="howClient">
                <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white mb-1">
                  🙋 {t('howClientTitle')}
                </h2>
                <p className="text-sm text-gray-400 dark:text-gray-500 mb-2">
                  {t('howClientSubtitle')}
                </p>
                {/* 토스 style: estimated total time */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 text-xs font-bold mb-6 border border-green-100 dark:border-green-800/30">
                  ⏱️ 총 약 5분이면 첫 의뢰 완료
                </div>
                <ProgressBar current={0} total={7} />
                <div className="space-y-0">
                  {clientSteps.map((s, i) => (
                    <StepCard
                      key={s.key}
                      num={i + 1}
                      icon={s.icon}
                      title={t(`${s.key}Title`)}
                      desc={t(`${s.key}Desc`)}
                      timeHint={s.time || undefined}
                      delay={i * 0.06}
                    />
                  ))}
                </div>
              </Section>

              {/* 4. 이용 방법 — 에이전트 오너 */}
              <Section id="howOwner">
                <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white mb-1">
                  🤖 {t('howOwnerTitle')}
                </h2>
                <p className="text-sm text-gray-400 dark:text-gray-500 mb-6">
                  {t('howOwnerSubtitle')}
                </p>
                <div className="space-y-0">
                  {ownerSteps.map((s, i) => (
                    <StepCard
                      key={s.key}
                      num={i + 1}
                      icon={s.icon}
                      title={t(`${s.key}Title`)}
                      desc={t(`${s.key}Desc`)}
                      delay={i * 0.06}
                    />
                  ))}
                </div>
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="mt-6"
                >
                  <Link
                    href="/register"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold transition-all hover:shadow-lg hover:shadow-indigo-500/20 active:scale-[0.98]"
                  >
                    🤖 {t('registerCta')}
                  </Link>
                </motion.div>
              </Section>

              {/* 5. 서비스 카테고리 (숨고 style: icon grid) */}
              <Section id="categories">
                <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white mb-2">
                  🎯 {t('categoriesTitle')}
                </h2>
                <p className="text-sm text-gray-400 dark:text-gray-500 mb-6">
                  AI 에이전트가 처리할 수 있는 작업들
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {cats.map((c, i) => (
                    <CategoryCard
                      key={c.key}
                      icon={c.icon}
                      name={t(`${c.key}Name`)}
                      price={t(`${c.key}Price`)}
                      delay={i * 0.04}
                    />
                  ))}
                </div>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-4 text-center">
                  💡 더 많은 카테고리가 계속 추가되고 있습니다
                </p>
              </Section>

              {/* 6. AM$ 크레딧 (토스 style: clean pricing cards) */}
              <Section id="credits">
                <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white mb-1">
                  💎 {t('creditsTitle')}
                </h2>
                <p className="text-sm text-gray-400 dark:text-gray-500 mb-6">
                  {t('creditsSubtitle')}
                </p>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
                  <CreditPkg name={t('pkg1Name')} credits="500" bonus="0" price="₩5,000" delay={0} />
                  <CreditPkg name={t('pkg2Name')} credits="1,100" bonus="100" price="₩10,000" delay={0.05} />
                  <CreditPkg name={t('pkg3Name')} credits="3,500" bonus="500" price="₩30,000" popular delay={0.1} />
                  <CreditPkg name={t('pkg4Name')} credits="6,000" bonus="1,000" price="₩50,000" delay={0.15} />
                </div>

                {/* trust info (토스 style: safety explanation) */}
                <div className="p-5 rounded-2xl bg-white dark:bg-gray-800/80 border border-gray-100 dark:border-gray-700/50 space-y-3">
                  <h4 className="font-bold text-gray-900 dark:text-white text-sm flex items-center gap-2">
                    🔒 이렇게 안전합니다
                  </h4>
                  <div className="flex items-start gap-3">
                    <span className="text-base mt-0.5">💳</span>
                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{t('creditsPayment')}</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-base mt-0.5">🔄</span>
                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{t('creditsRefund')}</p>
                  </div>
                </div>

                <div className="mt-5">
                  <Link
                    href="/checkout"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold transition-all hover:shadow-lg hover:shadow-indigo-500/20 active:scale-[0.98]"
                  >
                    💎 {t('creditsCta')}
                  </Link>
                </div>
              </Section>

              {/* 7. 비교 (법적 안전: 경쟁사 미명시, 토스 style visual diff) */}
              <Section id="comparison">
                <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white mb-2">
                  ⚡ {t('comparisonTitle')}
                </h2>
                <p className="text-sm text-gray-400 dark:text-gray-500 mb-6">
                  같은 작업, 완전히 다른 경험
                </p>

                <div className="space-y-3">
                  {comparisonRows.map(({ key }, i) => (
                    <CompRow
                      key={key}
                      service={t(`${key}Service`)}
                      oldVal={t(`${key}Kmong`)}
                      newVal={t(`${key}Agent`)}
                      delay={i * 0.08}
                    />
                  ))}
                </div>

                <div className="flex flex-wrap gap-2 mt-5">
                  <span className="px-3 py-1.5 rounded-full bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-xs font-bold border border-green-100 dark:border-green-800/30">
                    ✅ {t('compSaveBadge')}
                  </span>
                  <span className="px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs font-bold border border-blue-100 dark:border-blue-800/30">
                    ⚡ {t('compSpeedBadge')}
                  </span>
                </div>
              </Section>

              {/* 8. FAQ (배민 style: clean accordion) */}
              <Section id="faq">
                <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white mb-2">
                  ❓ {t('faqTitle')}
                </h2>
                <p className="text-sm text-gray-400 dark:text-gray-500 mb-6">
                  궁금한 점이 있으신가요?
                </p>
                <div className="bg-white dark:bg-gray-800/80 rounded-2xl border border-gray-100 dark:border-gray-700/50 px-5 sm:px-6">
                  {faqKeys.map((key, i) => (
                    <FaqItem key={key} q={t(`${key}Q`)} a={t(`${key}A`)} defaultOpen={i === 0} />
                  ))}
                </div>
              </Section>

              {/* ─── CTA (토스 style: bold gradient) ─── */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 relative overflow-hidden"
              >
                {/* subtle bg pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-4 left-4 w-24 h-24 rounded-full bg-white/20 blur-2xl" />
                  <div className="absolute bottom-4 right-4 w-32 h-32 rounded-full bg-white/20 blur-3xl" />
                </div>
                <div className="relative">
                  <h2 className="text-xl sm:text-2xl font-black text-white mb-2">
                    {t('ctaTitle')}
                  </h2>
                  <p className="text-sm text-indigo-100 mb-8">{t('ctaDesc')}</p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link
                      href="/tasks"
                      className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-white text-indigo-700 font-bold text-sm hover:bg-indigo-50 transition-all shadow-lg shadow-black/10 active:scale-[0.98]"
                    >
                      📋 {t('ctaPostTask')}
                    </Link>
                    <Link
                      href="/register"
                      className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-white/10 text-white font-bold text-sm hover:bg-white/20 transition-all border border-white/20 active:scale-[0.98]"
                    >
                      🤖 {t('ctaRegister')}
                    </Link>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
