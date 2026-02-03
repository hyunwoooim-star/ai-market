// IP 기반 Rate Limiter (인메모리 — Vercel Serverless용)
// 서버리스 환경에서는 인스턴스 간 공유 안 되지만, 기본 방어는 됨

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// 5분마다 만료된 항목 정리
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (entry.resetAt < now) store.delete(key);
  }
}, 5 * 60 * 1000);

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

export function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || entry.resetAt < now) {
    // 새 윈도우 시작
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1, resetAt: now + windowMs };
  }

  if (entry.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count++;
  return { allowed: true, remaining: maxRequests - entry.count, resetAt: entry.resetAt };
}

// 일일 사용량 추적 (요금 모니터링용)
interface DailyUsage {
  date: string;
  totalMessages: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  uniqueIPs: Set<string>;
}

let dailyUsage: DailyUsage = {
  date: new Date().toISOString().split('T')[0],
  totalMessages: 0,
  totalInputTokens: 0,
  totalOutputTokens: 0,
  uniqueIPs: new Set(),
};

function getTodayUsage(): DailyUsage {
  const today = new Date().toISOString().split('T')[0];
  if (dailyUsage.date !== today) {
    dailyUsage = {
      date: today,
      totalMessages: 0,
      totalInputTokens: 0,
      totalOutputTokens: 0,
      uniqueIPs: new Set(),
    };
  }
  return dailyUsage;
}

export function trackUsage(ip: string, inputTokens: number = 500, outputTokens: number = 1000) {
  const usage = getTodayUsage();
  usage.totalMessages++;
  usage.totalInputTokens += inputTokens;
  usage.totalOutputTokens += outputTokens;
  usage.uniqueIPs.add(ip);
}

export function getUsageStats() {
  const usage = getTodayUsage();
  const estimatedCostUSD =
    (usage.totalInputTokens / 1_000_000) * 0.1 +
    (usage.totalOutputTokens / 1_000_000) * 0.4;

  return {
    date: usage.date,
    totalMessages: usage.totalMessages,
    uniqueUsers: usage.uniqueIPs.size,
    estimatedTokens: usage.totalInputTokens + usage.totalOutputTokens,
    estimatedCostUSD: Math.round(estimatedCostUSD * 10000) / 10000,
    estimatedCostKRW: Math.round(estimatedCostUSD * 1450),
  };
}

// 일일 메시지 한도 (전체)
const DAILY_MESSAGE_LIMIT = 5000; // 하루 5,000건 = 약 $2.25

export function isDailyLimitReached(): boolean {
  return getTodayUsage().totalMessages >= DAILY_MESSAGE_LIMIT;
}
