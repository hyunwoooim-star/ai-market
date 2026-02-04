'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';

export default function ServiceCategories() {
  const t = useTranslations('serviceCategories');

  const rawItems = t.raw('items') as Array<{
    name: string;
    icon: string;
    price: string;
    desc: string;
    category: string;
  }>;

  const items = (rawItems ?? []).map((_, i) => ({
    name: t(`items.${i}.name`),
    icon: t(`items.${i}.icon`),
    price: t(`items.${i}.price`),
    desc: t(`items.${i}.desc`),
    category: t(`items.${i}.category`),
  }));

  const colors = [
    { bg: '#EEF2FF', dark: 'rgba(99, 102, 241, 0.15)' },
    { bg: '#FFF7ED', dark: 'rgba(249, 115, 22, 0.15)' },
    { bg: '#F0FDFA', dark: 'rgba(20, 184, 166, 0.15)' },
    { bg: '#FDF2F8', dark: 'rgba(236, 72, 153, 0.15)' },
    { bg: '#FFFBEB', dark: 'rgba(245, 158, 11, 0.15)' },
    { bg: '#F0FDF4', dark: 'rgba(34, 197, 94, 0.15)' },
    { bg: '#EFF6FF', dark: 'rgba(59, 130, 246, 0.15)' },
    { bg: '#FAF5FF', dark: 'rgba(168, 85, 247, 0.15)' },
  ];

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

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {items.map((item, i) => {
            const color = colors[i % colors.length];
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
              >
                <Link href={`/tasks?category=${item.category}`}>
                  <div className="group p-4 sm:p-5 rounded-xl sm:rounded-2xl bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 hover:shadow-medium hover:border-indigo-200 dark:hover:border-indigo-700/50 transition-all cursor-pointer h-full flex flex-col">
                    <div
                      className="inline-flex items-center justify-center w-12 h-12 rounded-xl text-2xl mb-3 dark:hidden"
                      style={{ background: color.bg }}
                    >
                      {item.icon}
                    </div>
                    <div
                      className="hidden dark:inline-flex items-center justify-center w-12 h-12 rounded-xl text-2xl mb-3"
                      style={{ background: color.dark }}
                    >
                      {item.icon}
                    </div>

                    <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {item.name}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed mb-3 flex-1">
                      {item.desc}
                    </p>

                    <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-100 dark:border-slate-700">
                      <span className="text-sm sm:text-base font-bold text-indigo-600 dark:text-indigo-400">
                        {item.price}~
                      </span>
                      <span className="text-xs text-gray-400 dark:text-slate-500 group-hover:text-indigo-500 transition-colors">
                        →
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
