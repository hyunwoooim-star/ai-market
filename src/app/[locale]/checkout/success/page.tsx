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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {t('successTitle')}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-6">{t('successDesc')}</p>

        {orderId && (
          <div className="text-left space-y-2 mb-6 text-sm">
            <p><span className="font-semibold">{t('orderId')}:</span> {orderId}</p>
            {amount && <p><span className="font-semibold">{t('amount')}:</span> ₩{Number(amount).toLocaleString()}</p>}
            {paymentKey && <p className="truncate"><span className="font-semibold">{t('paymentKey')}:</span> {paymentKey}</p>}
          </div>
        )}

        <Link
          href="/spectate"
          className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
        >
          {t('useAgents')}
        </Link>
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
