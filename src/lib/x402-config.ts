/**
 * x402 Protocol Configuration
 *
 * Solana Devnet + USDC agent skill payment config.
 * 테스트넷 전용 — 메인넷 전환 시 네트워크 ID와 Facilitator URL만 변경하면 됨.
 */

// ---------------------------------------------------------------------------
// Networks
// ---------------------------------------------------------------------------

/** Solana Devnet CAIP-2 식별자 */
export const SOLANA_DEVNET_NETWORK =
  "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1" as const;

/** Solana Mainnet CAIP-2 식별자 (향후 전환용) */
export const SOLANA_MAINNET_NETWORK =
  "solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp" as const;

// ---------------------------------------------------------------------------
// Facilitator
// ---------------------------------------------------------------------------

/** 테스트넷 Facilitator — API 키 불필요 */
export const FACILITATOR_URL = "https://x402.org/facilitator";

// ---------------------------------------------------------------------------
// Platform Wallet
// ---------------------------------------------------------------------------

/**
 * 플랫폼 수신 지갑 (Solana Devnet).
 * Payments arrive here; fees deducted, remainder settled to seller.
 *
 * ⚠️ PoC 전용 키페어 — 프로덕션에서는 HSM/MPC 지갑으로 교체할 것.
 */
export const PLATFORM_WALLET_SOLANA =
  process.env.X402_PLATFORM_WALLET_SOLANA ??
  "DDJBD2LmDzC4QsuDM3KUSur7tBarTvgffNxNjabLxD76";

// ---------------------------------------------------------------------------
// Pricing
// ---------------------------------------------------------------------------

/** 스킬 호출 1회당 기본 가격 (USDC) */
export const DEFAULT_SKILL_PRICE = "$0.001";

/** 플랫폼 수수료 비율 (5 %) */
export const PLATFORM_COMMISSION_RATE = 0.05;

// ---------------------------------------------------------------------------
// Active Network (현재 활성 네트워크)
// ---------------------------------------------------------------------------

/** 현재 사용 중인 네트워크 */
export const ACTIVE_NETWORK = SOLANA_DEVNET_NETWORK;

// ---------------------------------------------------------------------------
// Helper — RouteConfig accepts 생성
// ---------------------------------------------------------------------------

export interface SkillPricingOptions {
  price?: string;
  payTo?: string;
  network?: string;
}

/**
 * 단일 스킬에 대한 x402 PaymentOption을 생성한다.
 */
export function buildPaymentOption(opts?: SkillPricingOptions) {
  return {
    scheme: "exact" as const,
    price: opts?.price ?? DEFAULT_SKILL_PRICE,
    network: opts?.network ?? ACTIVE_NETWORK,
    payTo: opts?.payTo ?? PLATFORM_WALLET_SOLANA,
  };
}
