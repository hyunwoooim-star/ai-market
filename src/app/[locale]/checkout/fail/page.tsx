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
        {/* Fail Icon */}
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-5">
          <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {t('failTitle')}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-6">{t('failDesc')}</p>

        {(code || message) && (
          <div className="text-left space-y-2 mb-6 text-sm bg-red-50 dark:bg-red-900/20 p-4 rounded-xl">
            {code && (
              <p>
                <span className="font-semibold text-red-700 dark:text-red-400">{t('errorCode')}:</span>{' '}
                <span className="text-red-600 dark:text-red-400">{code}</span>
              </p>
            )}
            {message && (
              <p>
                <span className="font-semibold text-red-700 dark:text-red-400">{t('errorDetail')}:</span>{' '}
                <span className="text-red-600 dark:text-red-400">{message}</span>
              </p>
            )}
          </div>
        )}

        <div className="flex gap-3 justify-center">
          <Link
            href="/"
            className="px-5 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            {t('goBack')}
          </Link>
          <Link
            href="/checkout"
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
