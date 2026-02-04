'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';

function CheckoutFailContent() {
  const searchParams = useSearchParams();
  const t = useTranslations('checkout');

  const code = searchParams.get('code');
  const message = searchParams.get('message');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {t('failTitle')}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-6">{t('failDesc')}</p>

        {(code || message) && (
          <div className="text-left space-y-2 mb-6 text-sm bg-red-50 dark:bg-red-900/20 p-4 rounded-xl">
            {code && <p><span className="font-semibold">{t('errorCode')}:</span> {code}</p>}
            {message && <p><span className="font-semibold">{t('errorDetail')}:</span> {message}</p>}
          </div>
        )}

        <div className="flex gap-3 justify-center">
          <Link
            href="/"
            className="px-5 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            {t('goBack')}
          </Link>
          <Link
            href="/spectate"
            className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors"
          >
            {t('retry')}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutFailPage() {
  const t = useTranslations('checkout');
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">{t('loading')}</div>}>
      <CheckoutFailContent />
    </Suspense>
  );
}
