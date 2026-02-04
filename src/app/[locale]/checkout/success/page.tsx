'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const t = useTranslations('checkout');

  const orderId = searchParams.get('orderId');
  const amount = searchParams.get('amount');
  const paymentKey = searchParams.get('paymentKey');
  const credits = searchParams.get('credits');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-8 text-center">
        {/* Success Icon */}
        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-5">
          <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {t('successTitle')}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-6">{t('successDesc')}</p>

        {/* Credits Added */}
        {credits && (
          <div className="bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 rounded-xl p-4 mb-6">
            <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
              +{Number(credits).toLocaleString()} AM$
            </div>
            <div className="text-sm text-indigo-500 dark:text-indigo-400 mt-1">
              {t('creditsAdded')}
            </div>
          </div>
        )}

        {/* Order Details */}
        {orderId && (
          <div className="text-left space-y-2 mb-6 text-sm bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl">
            <p>
              <span className="font-semibold text-gray-700 dark:text-gray-300">{t('orderId')}:</span>{' '}
              <span className="text-gray-500 dark:text-gray-400">{orderId}</span>
            </p>
            {amount && (
              <p>
                <span className="font-semibold text-gray-700 dark:text-gray-300">{t('amount')}:</span>{' '}
                <span className="text-gray-500 dark:text-gray-400">₩{Number(amount).toLocaleString()}</span>
              </p>
            )}
            {paymentKey && (
              <p className="truncate">
                <span className="font-semibold text-gray-700 dark:text-gray-300">{t('paymentKey')}:</span>{' '}
                <span className="text-gray-500 dark:text-gray-400">{paymentKey}</span>
              </p>
            )}
          </div>
        )}

        <div className="flex flex-col gap-3">
          <Link
            href="/tasks"
            className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
          >
            {t('postTask')}
          </Link>
          <Link
            href="/spectate"
            className="inline-block px-6 py-3 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            {t('useAgents')}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  const t = useTranslations('checkout');
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">{t('loading')}</div>}>
      <CheckoutSuccessContent />
    </Suspense>
  );
}
