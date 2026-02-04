/**
 * x402 Payment Test Endpoint
 *
 * GET  /api/agents/skills/test
 *   → Returns payment requirements (402) and current x402 configuration.
 *   → Does not require actual payment — for debugging/verification only.
 *
 * POST /api/agents/skills/test
 *   → Returns a proper 402 response with PAYMENT-REQUIRED header.
 *   → Used for header parsing tests via curl, etc.
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
// GET — Configuration check (200 OK)
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
      step2: "Check the PAYMENT-REQUIRED header in the 402 response",
      step3: "Sign payment with x402 client and retry the request",
    },
    timestamp: new Date().toISOString(),
  });
}

// ---------------------------------------------------------------------------
// POST — 402 Response Simulation
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
      message: "This is a test 402 response. Check the PAYMENT-REQUIRED header.",
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
