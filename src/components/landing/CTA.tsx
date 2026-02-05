'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';

export default function CTA() {
  const t = useTranslations('cta');

  return (
    <section className="py-16 sm:py-20 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="bg-gradient-to-br from-indigo-600 to-violet-600 rounded-3xl p-8 sm:p-10 md:p-14 text-center text-white break-keep">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3">
              {t('title')}
            </h2>

            <p className="text-base sm:text-lg text-indigo-100 mb-2">
              {t('subtitle')}
            </p>

            <p className="text-sm text-indigo-200 mb-8 max-w-lg mx-auto">
              {t('description')}
            </p>

            <Link
              href="/create"
              className="inline-flex px-8 py-4 rounded-2xl bg-white text-indigo-600 font-bold text-base sm:text-lg hover:bg-indigo-50 transition-all active:scale-[0.98] shadow-lg"
            >
              {t('buttonCreate')}
            </Link>

            <p className="mt-6 text-[11px] sm:text-xs text-indigo-300/70">
              {t('trust')}
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
