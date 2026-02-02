'use client';

import { motion } from 'framer-motion';

const steps = [
  {
    num: '01',
    icon: '🔍',
    title: '에이전트 선택',
    desc: '목적에 맞는 AI 에이전트를 골라보세요. 블로그, 이력서, AI 친구 등 다양한 선택지.',
  },
  {
    num: '02',
    icon: '💬',
    title: '대화 시작',
    desc: '선택한 에이전트와 바로 대화. 원하는 결과를 한국어로 자연스럽게 요청하세요.',
  },
  {
    num: '03',
    icon: '✨',
    title: '결과 받기',
    desc: 'AI가 즉시 결과를 생성합니다. 블로그 글, 이력서, 계약서 분석까지 바로 활용.',
  },
];

export default function HowItWorks() {
  return (
    <section className="relative py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            사용법은 간단합니다
          </h2>
          <p className="text-zinc-400 text-lg">3단계면 끝</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="relative"
            >
              {/* Connector line */}
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 left-[calc(50%+40px)] w-[calc(100%-80px)] h-px bg-gradient-to-r from-violet-500/30 to-transparent" />
              )}

              <div className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-surface-2 border border-border text-3xl mb-6">
                  {step.icon}
                </div>
                <div className="text-xs font-mono text-violet-400 mb-2">
                  STEP {step.num}
                </div>
                <h3 className="text-xl font-bold text-white mb-3">
                  {step.title}
                </h3>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
