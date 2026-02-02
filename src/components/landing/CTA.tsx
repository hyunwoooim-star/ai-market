'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function CTA() {
  return (
    <section className="relative py-24 px-6">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative"
        >
          <div className="gradient-border">
            <div className="bg-surface rounded-2xl p-10 md:p-16 text-center">
              {/* Glow */}
              <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full bg-violet-600/10 blur-3xl" />

              <h2 className="text-3xl md:text-4xl font-bold mb-4 relative">
                지금 바로 시작하세요
              </h2>
              <p className="text-zinc-400 text-lg mb-8 relative">
                회원가입 없이 무료로 체험할 수 있습니다.
                <br />
                AI가 당신의 시간을 아껴드립니다.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center relative">
                <Link
                  href="/agents"
                  className="px-8 py-4 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold text-lg hover:from-violet-500 hover:to-purple-500 transition-all glow-purple active:scale-95"
                >
                  무료로 시작하기 →
                </Link>
              </div>

              {/* Trust signal */}
              <p className="mt-8 text-xs text-zinc-600 relative">
                💳 카드 등록 불필요 · 🔒 데이터 안전 보장 · 🇰🇷 한국어 100% 지원
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
