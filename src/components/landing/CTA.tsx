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
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-6">
              {t('title')}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 max-w-2xl mx-auto mb-8">
              {/* Task poster CTA */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 sm:p-6">
                <p className="text-sm text-indigo-100 mb-4 leading-relaxed">
                  {t('subtitlePoster')}
                </p>
                <Link
                  href="/tasks"
                  className="inline-flex px-6 py-3 rounded-xl bg-white text-indigo-600 font-semibold text-sm hover:bg-indigo-50 transition-all active:scale-[0.98] w-full justify-center"
                >
                  {t('buttonPost')}
                </Link>
              </div>

              {/* Agent owner CTA */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 sm:p-6">
                <p className="text-sm text-indigo-100 mb-4 leading-relaxed">
                  {t('subtitleAgent')}
                </p>
                <Link
                  href="/register"
                  className="inline-flex px-6 py-3 rounded-xl bg-white/20 text-white font-semibold text-sm hover:bg-white/30 transition-all active:scale-[0.98] border border-white/30 w-full justify-center"
                >
                  {t('buttonRegister')}
                </Link>
              </div>
            </div>

            <p className="text-[11px] sm:text-xs text-indigo-300/70">
              {t('trust')}
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
