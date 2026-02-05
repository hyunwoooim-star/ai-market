'use client';

import { motion } from 'framer-motion';
import { Link } from '@/i18n/routing';

const plans = [
  {
    name: '무료',
    price: '₩0',
    period: '영원히',
    description: '시작하기 딱 좋은 플랜',
    highlight: false,
    features: [
      '웹사이트 1개 생성',
      '무료 서브도메인 (가게명.agentmarket.kr)',
      '블로그 글 월 3개 생성',
      'AI 전화 체험판 (10분)',
      '기본 템플릿',
    ],
    limitations: [
      '워터마크 표시',
      '광고 포함',
    ],
    cta: '무료로 시작',
    ctaHref: '/create',
  },
  {
    name: '프로',
    price: '₩29,900',
    period: '/월',
    description: '본격적인 마케팅 자동화',
    highlight: true,
    badge: '인기',
    features: [
      '웹사이트 무제한',
      '커스텀 도메인 연결',
      '블로그 글 월 30개',
      'AI 전화 500분/월',
      '카카오톡 자동 응대 100건',
      '프리미엄 템플릿',
      '예약 관리',
      '워터마크 제거',
    ],
    cta: '프로 시작하기',
    ctaHref: '/checkout?plan=pro',
  },
  {
    name: '비즈니스',
    price: '₩59,900',
    period: '/월',
    description: '대용량 + 프리미엄 지원',
    highlight: false,
    features: [
      '프로 플랜 모든 기능',
      '블로그 글 월 100개',
      'AI 전화 2000분/월',
      '카카오톡 자동 응대 500건',
      '인스타그램 자동화',
      '전담 매니저',
      '우선 지원',
      'API 접근',
    ],
    cta: '비즈니스 시작',
    ctaHref: '/checkout?plan=business',
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="py-16 md:py-24 bg-gradient-to-b from-stone-50 to-white dark:from-gray-950 dark:to-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 text-sm font-semibold rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 mb-4">
            💰 투명한 가격
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            시작은 무료, 성장하면 업그레이드
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            숨겨진 비용 없이 필요한 만큼만
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`relative rounded-2xl p-6 lg:p-8 ${
                plan.highlight
                  ? 'bg-gradient-to-b from-indigo-600 to-purple-700 text-white shadow-xl scale-105 z-10'
                  : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
              }`}
            >
              {plan.badge && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-yellow-400 text-yellow-900 text-xs font-bold rounded-full">
                  {plan.badge}
                </span>
              )}

              <div className="mb-6">
                <h3 className={`text-xl font-bold mb-2 ${plan.highlight ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                  {plan.name}
                </h3>
                <div className="flex items-baseline gap-1">
                  <span className={`text-4xl font-extrabold ${plan.highlight ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                    {plan.price}
                  </span>
                  <span className={`text-sm ${plan.highlight ? 'text-indigo-200' : 'text-gray-500 dark:text-gray-400'}`}>
                    {plan.period}
                  </span>
                </div>
                <p className={`mt-2 text-sm ${plan.highlight ? 'text-indigo-200' : 'text-gray-600 dark:text-gray-400'}`}>
                  {plan.description}
                </p>
              </div>

              <ul className="space-y-3 mb-6">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <span className={`text-lg ${plan.highlight ? 'text-green-300' : 'text-green-500'}`}>✓</span>
                    <span className={`text-sm ${plan.highlight ? 'text-white/90' : 'text-gray-700 dark:text-gray-300'}`}>
                      {feature}
                    </span>
                  </li>
                ))}
                {plan.limitations?.map((limitation) => (
                  <li key={limitation} className="flex items-start gap-2">
                    <span className="text-lg text-gray-400">·</span>
                    <span className="text-sm text-gray-400 dark:text-gray-500">
                      {limitation}
                    </span>
                  </li>
                ))}
              </ul>

              <Link
                href={plan.ctaHref}
                className={`block w-full py-3 px-4 rounded-xl font-medium text-center transition-all ${
                  plan.highlight
                    ? 'bg-white text-indigo-600 hover:bg-gray-100'
                    : 'bg-gray-900 text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100'
                }`}
              >
                {plan.cta}
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            💳 결제는 토스페이먼츠로 안전하게 · 언제든 해지 가능
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            VAT 별도 · 연간 결제 시 2개월 무료
          </p>
        </motion.div>
      </div>
    </section>
  );
}
