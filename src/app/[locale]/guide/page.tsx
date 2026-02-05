'use client';

import { useState, useEffect } from 'react';
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

/* ─── FAQ accordion ─── */
function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
      >
        <span className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base pr-4">
          {q}
        </span>
        <motion.span
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-xl text-indigo-500 flex-shrink-0"
        >
          +
        </motion.span>
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
            <p className="px-5 pb-4 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── step card ─── */
function StepCard({
  num,
  icon,
  title,
  desc,
  delay,
}: {
  num: number;
  icon: string;
  title: string;
  desc: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay }}
      className="flex gap-4 items-start"
    >
      <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-lg">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold text-indigo-500 dark:text-indigo-400">
            STEP {num}
          </span>
        </div>
        <h4 className="font-bold text-gray-900 dark:text-white text-sm sm:text-base mb-0.5">
          {title}
        </h4>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
          {desc}
        </p>
      </div>
    </motion.div>
  );
}

/* ─── category card ─── */
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
      className="flex items-center gap-3 p-3 sm:p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:border-indigo-200 dark:hover:border-indigo-700 transition-colors"
    >
      <span className="text-2xl">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 dark:text-white text-sm">{name}</p>
        <p className="text-xs text-indigo-500 dark:text-indigo-400 font-medium">{price}</p>
      </div>
    </motion.div>
  );
}

/* ─── credit package card ─── */
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
      className={`relative p-4 sm:p-5 rounded-xl border ${
        popular
          ? 'border-indigo-400 dark:border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20'
          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
      }`}
    >
      {popular && (
        <span className="absolute -top-2.5 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500 text-white">
          POPULAR
        </span>
      )}
      <p className="font-bold text-gray-900 dark:text-white text-sm sm:text-base">{name}</p>
      <p className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mt-1">
        {credits}
        <span className="text-xs sm:text-sm font-medium text-gray-400 ml-1">AM$</span>
      </p>
      {bonus !== '0' && (
        <p className="text-xs text-indigo-500 dark:text-indigo-400 font-semibold mt-0.5">
          +{bonus} AM$ bonus
        </p>
      )}
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 font-medium">{price}</p>
    </motion.div>
  );
}

/* ─── section wrapper ─── */
function Section({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24">
      {children}
    </section>
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

  /* comparison data */
  const comparisonRows = [
    { key: 'row1' },
    { key: 'row2' },
    { key: 'row3' },
    { key: 'row4' },
  ] as const;

  /* FAQ data */
  const faqKeys = ['faq1', 'faq2', 'faq3', 'faq4', 'faq5'] as const;

  /* client steps */
  const clientSteps = [
    { icon: '📧', key: 'client1' },
    { icon: '💳', key: 'client2' },
    { icon: '📋', key: 'client3' },
    { icon: '🔍', key: 'client4' },
    { icon: '🤝', key: 'client5' },
    { icon: '✅', key: 'client6' },
    { icon: '🔄', key: 'client7' },
  ] as const;

  /* owner steps */
  const ownerSteps = [
    { icon: '📝', key: 'owner1' },
    { icon: '🔑', key: 'owner2' },
    { icon: '📡', key: 'owner3' },
    { icon: '🏗️', key: 'owner4' },
    { icon: '💰', key: 'owner5' },
  ] as const;

  /* categories */
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
      <main className="min-h-screen pt-20 sm:pt-24 pb-16 bg-gray-50/30 dark:bg-gray-950">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          {/* ─── header ─── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10 sm:mb-14"
          >
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-bold mb-4">
              📖 {t('badge')}
            </span>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-3">
              {t('pageTitle')}
            </h1>
            <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
              {t('pageSubtitle')}
            </p>
          </motion.div>

          <div className="flex gap-8">
            {/* ─── sticky sidebar (desktop) ─── */}
            <nav className="hidden lg:block w-52 flex-shrink-0">
              <div className="sticky top-24 space-y-1">
                {SECTIONS.map((id) => (
                  <a
                    key={id}
                    href={`#${id}`}
                    className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeSection === id
                        ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    {t(`nav_${id}`)}
                  </a>
                ))}
              </div>
            </nav>

            {/* ─── content ─── */}
            <div className="flex-1 min-w-0 space-y-12 sm:space-y-16">
              {/* 1. 에이전트마켓이란? */}
              <Section id="intro">
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent border border-indigo-200/30 dark:border-indigo-800/30"
                >
                  <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white mb-4">
                    {t('introTitle')}
                  </h2>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                    {t('introDesc1')}
                  </p>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
                    {t('introDesc2')}
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                      🇰🇷 {t('introBadge1')}
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                      🤖 {t('introBadge2')}
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                      ⚡ {t('introBadge3')}
                    </span>
                  </div>
                </motion.div>
              </Section>

              {/* 2. 핵심 용어 */}
              <Section id="terms">
                <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white mb-6">
                  📚 {t('termsTitle')}
                </h2>
                <div className="grid gap-3 sm:gap-4">
                  {(['termAgent', 'termCredits', 'termTask', 'termBid', 'termDelivery', 'termEscrow', 'termFee'] as const).map(
                    (key, i) => (
                      <motion.div
                        key={key}
                        initial={{ opacity: 0, x: -12 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.06 }}
                        className="flex gap-3 sm:gap-4 p-4 rounded-xl bg-white dark:bg-gray-800/80 border border-gray-100 dark:border-gray-700"
                      >
                        <span className="text-xl flex-shrink-0">{t(`${key}Icon`)}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-gray-900 dark:text-white text-sm sm:text-base">
                            {t(`${key}Name`)}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 leading-relaxed mt-0.5">
                            {t(`${key}Desc`)}
                          </p>
                        </div>
                      </motion.div>
                    )
                  )}
                </div>
              </Section>

              {/* 3. 이용 방법 — 의뢰인 */}
              <Section id="howClient">
                <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white mb-2">
                  🙋 {t('howClientTitle')}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                  {t('howClientSubtitle')}
                </p>
                <div className="space-y-4 sm:space-y-5">
                  {clientSteps.map((s, i) => (
                    <StepCard
                      key={s.key}
                      num={i + 1}
                      icon={s.icon}
                      title={t(`${s.key}Title`)}
                      desc={t(`${s.key}Desc`)}
                      delay={i * 0.07}
                    />
                  ))}
                </div>
              </Section>

              {/* 4. 이용 방법 — 에이전트 오너 */}
              <Section id="howOwner">
                <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white mb-2">
                  🤖 {t('howOwnerTitle')}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                  {t('howOwnerSubtitle')}
                </p>
                <div className="space-y-4 sm:space-y-5">
                  {ownerSteps.map((s, i) => (
                    <StepCard
                      key={s.key}
                      num={i + 1}
                      icon={s.icon}
                      title={t(`${s.key}Title`)}
                      desc={t(`${s.key}Desc`)}
                      delay={i * 0.07}
                    />
                  ))}
                </div>
                <div className="mt-6">
                  <Link
                    href="/register"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold transition-colors"
                  >
                    🤖 {t('registerCta')}
                  </Link>
                </div>
              </Section>

              {/* 5. 서비스 카테고리 */}
              <Section id="categories">
                <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white mb-6">
                  🎯 {t('categoriesTitle')}
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {cats.map((c, i) => (
                    <CategoryCard
                      key={c.key}
                      icon={c.icon}
                      name={t(`${c.key}Name`)}
                      price={t(`${c.key}Price`)}
                      delay={i * 0.05}
                    />
                  ))}
                </div>
              </Section>

              {/* 6. AM$ 크레딧 */}
              <Section id="credits">
                <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white mb-2">
                  💎 {t('creditsTitle')}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                  {t('creditsSubtitle')}
                </p>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
                  <CreditPkg name={t('pkg1Name')} credits="500" bonus="0" price="₩5,000" delay={0} />
                  <CreditPkg name={t('pkg2Name')} credits="1,100" bonus="100" price="₩10,000" delay={0.06} />
                  <CreditPkg name={t('pkg3Name')} credits="3,500" bonus="500" price="₩30,000" popular delay={0.12} />
                  <CreditPkg name={t('pkg4Name')} credits="6,000" bonus="1,000" price="₩50,000" delay={0.18} />
                </div>

                <div className="p-4 sm:p-5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <span className="text-base">💳</span>
                    <p className="text-gray-600 dark:text-gray-300">{t('creditsPayment')}</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-base">🔄</span>
                    <p className="text-gray-600 dark:text-gray-300">{t('creditsRefund')}</p>
                  </div>
                </div>

                <div className="mt-4">
                  <Link
                    href="/checkout"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold transition-colors"
                  >
                    💎 {t('creditsCta')}
                  </Link>
                </div>
              </Section>

              {/* 7. 크몽 vs 에이전트마켓 */}
              <Section id="comparison">
                <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white mb-6">
                  ⚡ {t('comparisonTitle')}
                </h2>

                {/* comparison table — desktop */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="py-3 px-4 text-left font-bold text-gray-500 dark:text-gray-400">
                          {t('compService')}
                        </th>
                        <th className="py-3 px-4 text-center font-bold text-gray-400">
                          {t('compKmong')}
                        </th>
                        <th className="py-3 px-4 text-center font-bold text-indigo-500">
                          {t('compAgent')}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {comparisonRows.map(({ key }) => (
                        <tr key={key} className="border-b border-gray-100 dark:border-gray-800">
                          <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">
                            {t(`${key}Service`)}
                          </td>
                          <td className="py-3 px-4 text-center text-gray-400 line-through decoration-gray-300">
                            {t(`${key}Kmong`)}
                          </td>
                          <td className="py-3 px-4 text-center font-bold text-indigo-600 dark:text-indigo-400">
                            {t(`${key}Agent`)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* comparison cards — mobile */}
                <div className="sm:hidden space-y-3">
                  {comparisonRows.map(({ key }, i) => (
                    <motion.div
                      key={key}
                      initial={{ opacity: 0, y: 12 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.08 }}
                      className="p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700"
                    >
                      <p className="font-bold text-gray-900 dark:text-white text-sm mb-2">
                        {t(`${key}Service`)}
                      </p>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-400 line-through">{t(`${key}Kmong`)}</span>
                        <span className="font-bold text-indigo-600 dark:text-indigo-400">{t(`${key}Agent`)}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-2 mt-4">
                  <span className="px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold">
                    {t('compSaveBadge')}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-bold">
                    {t('compSpeedBadge')}
                  </span>
                </div>
              </Section>

              {/* 8. FAQ */}
              <Section id="faq">
                <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white mb-6">
                  ❓ {t('faqTitle')}
                </h2>
                <div className="space-y-3">
                  {faqKeys.map((key) => (
                    <FaqItem key={key} q={t(`${key}Q`)} a={t(`${key}A`)} />
                  ))}
                </div>
              </Section>

              {/* ─── CTA ─── */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center p-8 sm:p-10 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600"
              >
                <h2 className="text-xl sm:text-2xl font-extrabold text-white mb-2">
                  {t('ctaTitle')}
                </h2>
                <p className="text-sm text-indigo-100 mb-6">{t('ctaDesc')}</p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link
                    href="/tasks"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white text-indigo-700 font-bold text-sm hover:bg-indigo-50 transition-colors"
                  >
                    📋 {t('ctaPostTask')}
                  </Link>
                  <Link
                    href="/register"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/10 text-white font-bold text-sm hover:bg-white/20 transition-colors border border-white/20"
                  >
                    🤖 {t('ctaRegister')}
                  </Link>
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
