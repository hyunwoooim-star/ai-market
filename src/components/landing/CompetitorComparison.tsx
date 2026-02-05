'use client';

import { motion } from 'framer-motion';

interface Feature {
  name: string;
  us: 'yes' | 'no' | 'partial' | 'coming';
  kanana: 'yes' | 'no' | 'partial';
  sideTalk: 'yes' | 'no' | 'partial';
}

const features: Feature[] = [
  { name: '카카오톡 자동 응대', us: 'coming', kanana: 'yes', sideTalk: 'yes' },
  { name: '네이버 블로그 자동 발행', us: 'yes', kanana: 'no', sideTalk: 'no' },
  { name: 'AI 전화 응대 (24시간)', us: 'yes', kanana: 'no', sideTalk: 'no' },
  { name: '인스타그램 자동화', us: 'coming', kanana: 'no', sideTalk: 'no' },
  { name: '웹사이트 30초 생성', us: 'yes', kanana: 'no', sideTalk: 'no' },
  { name: '무료 호스팅', us: 'yes', kanana: 'no', sideTalk: 'no' },
  { name: '예약 관리', us: 'coming', kanana: 'partial', sideTalk: 'yes' },
  { name: '고객 데이터 분석', us: 'coming', kanana: 'partial', sideTalk: 'partial' },
];

const StatusIcon = ({ status }: { status: 'yes' | 'no' | 'partial' | 'coming' }) => {
  switch (status) {
    case 'yes':
      return (
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-600 text-sm">
          ✓
        </span>
      );
    case 'no':
      return (
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-100 text-red-500 text-sm">
          ✕
        </span>
      );
    case 'partial':
      return (
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-yellow-100 text-yellow-600 text-sm">
          △
        </span>
      );
    case 'coming':
      return (
        <span className="inline-flex items-center text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-600 font-medium">
          곧 출시
        </span>
      );
  }
};

export default function CompetitorComparison() {
  return (
    <section className="py-16 md:py-24 bg-white dark:bg-gray-900">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 text-sm font-semibold rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 mb-4">
            🥊 경쟁사 비교
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            왜 에이전트마켓인가요?
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            카카오 카나나가 채팅 응대만 하는 동안,<br className="hidden sm:block" />
            <span className="font-semibold text-indigo-600 dark:text-indigo-400">우리는 전체 마케팅을 자동화합니다.</span>
          </p>
        </motion.div>

        {/* Desktop Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="hidden md:block"
        >
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800">
                  <th className="text-left p-4 text-sm font-bold text-gray-700 dark:text-gray-300">기능</th>
                  <th className="text-center p-4 bg-indigo-50 dark:bg-indigo-900/30">
                    <div className="flex flex-col items-center">
                      <span className="text-lg mb-1">🤖</span>
                      <span className="text-sm font-bold text-indigo-700 dark:text-indigo-300">에이전트마켓</span>
                    </div>
                  </th>
                  <th className="text-center p-4">
                    <div className="flex flex-col items-center">
                      <span className="text-lg mb-1">💬</span>
                      <span className="text-sm font-bold text-gray-500 dark:text-gray-400">카카오 카나나</span>
                    </div>
                  </th>
                  <th className="text-center p-4">
                    <div className="flex flex-col items-center">
                      <span className="text-lg mb-1">📱</span>
                      <span className="text-sm font-bold text-gray-500 dark:text-gray-400">사이드톡</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {features.map((feature, i) => (
                  <tr
                    key={feature.name}
                    className={i < features.length - 1 ? 'border-b border-gray-100 dark:border-gray-800' : ''}
                  >
                    <td className="p-4 text-sm text-gray-700 dark:text-gray-300 font-medium">
                      {feature.name}
                    </td>
                    <td className="p-4 text-center bg-indigo-50/50 dark:bg-indigo-900/10">
                      <StatusIcon status={feature.us} />
                    </td>
                    <td className="p-4 text-center">
                      <StatusIcon status={feature.kanana} />
                    </td>
                    <td className="p-4 text-center">
                      <StatusIcon status={feature.sideTalk} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-3">
          {features.map((feature, i) => (
            <motion.div
              key={feature.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4"
            >
              <div className="font-medium text-gray-900 dark:text-white mb-3">{feature.name}</div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="flex flex-col items-center gap-1">
                  <StatusIcon status={feature.us} />
                  <span className="text-indigo-600 dark:text-indigo-400 font-medium">에이전트마켓</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <StatusIcon status={feature.kanana} />
                  <span className="text-gray-500">카나나</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <StatusIcon status={feature.sideTalk} />
                  <span className="text-gray-500">사이드톡</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-10 text-center"
        >
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            <span className="font-semibold text-green-600">✓ 지금 사용 가능</span> · 
            <span className="ml-2 text-blue-600">곧 출시</span> 기능은 2주 내 오픈
          </p>
          <a
            href="/create"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3 rounded-xl font-medium hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-200 dark:shadow-indigo-900/30"
          >
            무료로 시작하기 →
          </a>
        </motion.div>
      </div>
    </section>
  );
}
