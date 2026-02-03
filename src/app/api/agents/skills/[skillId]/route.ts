/**
 * 에이전트 스킬 API 엔드포인트 — x402 결제 보호
 *
 * x402 프로토콜로 보호되는 유료 API.
 * 결제 없이 호출하면 402 Payment Required를 반환하고,
 * 유효한 결제 서명이 있으면 스킬을 실행한 뒤 정산한다.
 *
 * PoC: 간단한 번역 스킬 ("translate")
 */

import { NextRequest, NextResponse } from "next/server";
import { withX402 } from "@x402/next";
import { x402ResourceServer } from "@x402/core/server";
import { HTTPFacilitatorClient } from "@x402/core/server";
import { registerExactSvmScheme } from "@x402/svm/exact/server";
import {
  FACILITATOR_URL,
  ACTIVE_NETWORK,
  PLATFORM_WALLET_SOLANA,
  DEFAULT_SKILL_PRICE,
} from "@/lib/x402-config";

// ---------------------------------------------------------------------------
// x402 Resource Server (싱글턴)
// ---------------------------------------------------------------------------

const facilitatorClient = new HTTPFacilitatorClient({
  url: FACILITATOR_URL,
});

const resourceServer = new x402ResourceServer(facilitatorClient);
registerExactSvmScheme(resourceServer, {
  networks: [ACTIVE_NETWORK],
});

// ---------------------------------------------------------------------------
// Route Config
// ---------------------------------------------------------------------------

const routeConfig = {
  accepts: {
    scheme: "exact" as const,
    price: DEFAULT_SKILL_PRICE,
    network: ACTIVE_NETWORK,
    payTo: PLATFORM_WALLET_SOLANA,
  },
  description: "Agent skill execution (x402 PoC — Solana Devnet USDC)",
  mimeType: "application/json",
};

// ---------------------------------------------------------------------------
// 스킬 핸들러 — 결제 검증 후 실행됨
// ---------------------------------------------------------------------------

/** 지원하는 언어 코드 (PoC용 간이 사전) */
const TRANSLATIONS: Record<string, Record<string, string>> = {
  ko: {
    hello: "안녕하세요",
    "good morning": "좋은 아침이에요",
    "thank you": "감사합니다",
    goodbye: "안녕히 가세요",
    "how are you": "어떻게 지내세요",
    "nice to meet you": "만나서 반갑습니다",
  },
  en: {
    안녕하세요: "hello",
    감사합니다: "thank you",
    "안녕히 가세요": "goodbye",
    "좋은 아침이에요": "good morning",
  },
  ja: {
    hello: "こんにちは",
    "good morning": "おはようございます",
    "thank you": "ありがとうございます",
    goodbye: "さようなら",
  },
};

function translate(text: string, targetLang: string): string {
  const dict = TRANSLATIONS[targetLang];
  if (!dict) return `[unsupported language: ${targetLang}]`;
  const key = text.toLowerCase().trim();
  return dict[key] ?? `[no translation for "${text}" → ${targetLang}]`;
}

async function skillHandler(
  request: NextRequest,
): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const skillId = request.nextUrl.pathname.split("/").pop();
  const text = searchParams.get("text") ?? searchParams.get("q") ?? "hello";
  const targetLang = searchParams.get("lang") ?? "ko";

  // PoC: translate 스킬만 지원
  if (skillId !== "translate") {
    return NextResponse.json(
      {
        error: "Unknown skill",
        available: ["translate"],
        usage:
          "GET /api/agents/skills/translate?text=hello&lang=ko",
      },
      { status: 404 },
    );
  }

  const translated = translate(text, targetLang);

  return NextResponse.json({
    skill: "translate",
    input: { text, targetLang },
    output: { translated },
    payment: {
      protocol: "x402",
      network: ACTIVE_NETWORK,
      price: DEFAULT_SKILL_PRICE,
    },
    timestamp: new Date().toISOString(),
  });
}

// ---------------------------------------------------------------------------
// Export — withX402 로 감싸서 결제 보호
// ---------------------------------------------------------------------------

export const GET = withX402(skillHandler, routeConfig, resourceServer);
