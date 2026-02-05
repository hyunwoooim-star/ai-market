'use client';

import { motion } from 'framer-motion';

const services = [
  {
    icon: '🌐',
    title: '웹사이트 생성',
    description: '30초만에 전문가급 웹사이트 완성',
    status: 'available',
    statusText: '지금 사용 가능',
  },
  {
    icon: '📝',
    title: '블로그 자동 발행',
    description: 'SEO 최적화 글을 네이버 블로그에 자동 발행',
    status: 'available',
    statusText: '지금 사용 가능',
  },
  {
    icon: '💬',
    title: '카카오톡 자동 응대',
    description: '고객 문의에 AI가 24시간 친절하게 답변',
    status: 'coming',
    statusText: '곧 출시',
  },
  {
    icon: '📞',
    title: 'AI 전화 응대',
    description: '새벽에 전화 와도 AI가 예약 접수',
    status: 'coming',
    statusText: '곧 출시',
  },
  {
    icon: '📸',
    title: '인스타그램 자동화',
    description: '피드, 스토리, 댓글 응대까지 자동',
    status: 'coming',
    statusText: '곧 출시',
  },
  {
    icon: '📅',
    title: '예약 관리',
    description: '예약 접수, 리마인더, 노쇼 추적',
    status: 'coming',
    statusText: '곧 출시',
  },
];

export default function AIServices() {
  return (
    <section className="py-20 bg-gradient-to-b from-white to-stone-50 dark:from-gray-900 dark:to-gray-950">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            AI가 대신 해드리는 일들
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            사장님은 본업에 집중하세요. 나머지는 AI가 합니다.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`relative bg-white dark:bg-gray-800 rounded-2xl p-6 border shadow-sm transition-all hover:shadow-md ${
                service.status === 'available'
                  ? 'border-green-200 dark:border-green-800'
                  : 'border-stone-200 dark:border-gray-700'
              }`}
            >
              <div className="flex items-start gap-4">
                <span className="text-4xl">{service.icon}</span>
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1">
                    {service.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {service.description}
                  </p>
                  <span
                    className={`inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full ${
                      service.status === 'available'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-stone-100 text-stone-600 dark:bg-gray-700 dark:text-gray-400'
                    }`}
                  >
                    {service.status === 'available' ? '✓ ' : '⏳ '}
                    {service.statusText}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            모든 서비스는 <span className="font-semibold">원클릭</span>으로 연결됩니다.
            복잡한 설정 없이 버튼만 누르세요.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
