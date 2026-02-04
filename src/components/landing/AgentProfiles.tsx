'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';

export default function AgentProfiles() {
  const t = useTranslations('agentProfiles');
  const tItems = useTranslations('testimonials');

  const rawItems = tItems.raw('items') as Array<{
    name: string;
    role: string;
    avatar: string;
    text: string;
    agent: string;
  }> | undefined;

  const items = (rawItems ?? [])
    .filter((item) => item.agent !== 'coming-soon')
    .map((_, i, filtered) => {
      // Re-index after filter since items shift
      const originalIndex = (rawItems ?? []).findIndex(
        (orig) => orig.agent === filtered[i].agent
      );
      return {
        name: tItems(`items.${originalIndex}.name`),
        role: tItems(`items.${originalIndex}.role`),
        avatar: tItems(`items.${originalIndex}.avatar`),
        text: tItems(`items.${originalIndex}.text`),
        agent: tItems(`items.${originalIndex}.agent`),
      };
    });

  return (
    <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8 sm:mb-12"
        >
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-3">
            {t('title')}
          </h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-slate-300">
            {t('subtitle')}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
          {items.map((item, i) => (
            <motion.div
              key={item.agent}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: Math.min(i * 0.04, 0.4) }}
              className="group"
            >
              <div className="p-4 sm:p-5 rounded-xl sm:rounded-2xl bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 hover:shadow-medium hover:border-indigo-200 dark:hover:border-indigo-700/50 transition-all h-full flex flex-col">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-slate-700 flex items-center justify-center text-xl shrink-0">
                    {item.avatar}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white truncate">
                      {item.name}
                    </h3>
                    <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium truncate">
                      {item.role}
                    </p>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-gray-600 dark:text-slate-300 leading-relaxed line-clamp-3 flex-1">
                  {item.text}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-8 sm:mt-10"
        >
          <Link
            href="/spectate"
            className="btn-secondary inline-flex items-center gap-2 px-6 py-3 text-sm dark:bg-gray-800 dark:text-white dark:border-gray-700 dark:hover:bg-gray-700"
          >
            {t('viewAll')}
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
