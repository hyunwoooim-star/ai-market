/**
 * x402 결제 테스트 엔드포인트
 *
 * GET  /api/agents/skills/test
 *   → 결제 요구사항(402)과 현재 x402 설정을 반환.
 *   → 실제 결제는 요구하지 않음 — 디버깅/확인용.
 *
 * POST /api/agents/skills/test
 *   → PAYMENT-REQUIRED 헤더를 포함한 정식 402 응답 반환.
 *   → curl 등으로 헤더 파싱 테스트에 사용.
 */

import { NextRequest, NextResponse } from "next/server";
import {
  FACILITATOR_URL,
  ACTIVE_NETWORK,
  PLATFORM_WALLET_SOLANA,
  DEFAULT_SKILL_PRICE,
  SOLANA_DEVNET_NETWORK,
  buildPaymentOption,
} from "@/lib/x402-config";

// ---------------------------------------------------------------------------
// GET — 설정 확인 (200 OK)
// ---------------------------------------------------------------------------

export async function GET() {
  const paymentOption = buildPaymentOption();

  return NextResponse.json({
    status: "ok",
    protocol: "x402",
    description: "Agent skill payment test endpoint — Solana Devnet PoC",
    config: {
      facilitator: FACILITATOR_URL,
      network: ACTIVE_NETWORK,
      networkLabel:
        ACTIVE_NETWORK === SOLANA_DEVNET_NETWORK
          ? "Solana Devnet"
          : "Solana Mainnet",
      platformWallet: PLATFORM_WALLET_SOLANA,
      defaultPrice: DEFAULT_SKILL_PRICE,
    },
    paymentOption,
    howToTest: {
      step1:
        "curl -i https://agentmarket.kr/api/agents/skills/translate?text=hello&lang=ko",
      step2: "402 응답의 PAYMENT-REQUIRED 헤더를 확인",
      step3: "x402 클라이언트로 결제 서명 후 재요청",
    },
    timestamp: new Date().toISOString(),
  });
}

// ---------------------------------------------------------------------------
// POST — 402 응답 시뮬레이션
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  const paymentOption = buildPaymentOption();
  const paymentRequired = {
    x402Version: 1,
    accepts: [paymentOption],
    description: "x402 payment test — simulated 402 response",
    mimeType: "application/json",
  };

  const encoded = Buffer.from(JSON.stringify(paymentRequired)).toString(
    "base64",
  );

  return new NextResponse(
    JSON.stringify({
      error: "Payment Required",
      message: "이 응답은 테스트용 402입니다. PAYMENT-REQUIRED 헤더를 확인하세요.",
      paymentRequired,
    }),
    {
      status: 402,
      headers: {
        "Content-Type": "application/json",
        "Payment-Required": encoded,
      },
    },
  );
}
