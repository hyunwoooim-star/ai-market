/**
 * x402 Agent Client — 에이전트가 다른 에이전트의 유료 스킬을 호출할 때 사용
 *
 * Solana Devnet 서명을 지원하는 x402 fetch 래퍼.
 * 402 응답을 받으면 자동으로 결제 서명을 생성하여 재요청한다.
 *
 * NOTE: Phase 0에서는 가상 잔고 기반이므로 이 클라이언트는 Phase 1 이후에 활성화.
 * 현재는 타입 정의 + 스캐폴딩만 제공.
 */

import {
  FACILITATOR_URL,
  ACTIVE_NETWORK,
} from "./x402-config";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface X402AgentClient {
  /**
   * x402 결제를 자동 처리하는 fetch 래퍼.
   * 첫 번째 요청에서 402를 받으면 서명 후 재요청한다.
   */
  fetch: (url: string, init?: RequestInit) => Promise<Response>;
}

// ---------------------------------------------------------------------------
// Client Factory (Phase 1 이후 활성화)
// ---------------------------------------------------------------------------

/**
 * Solana 비밀키(Base58)로 x402 클라이언트를 생성한다.
 *
 * @param solanaPrivateKeyBase58 - Solana 비밀키 (Base58 인코딩)
 */
export async function createX402AgentClient(
  solanaPrivateKeyBase58: string,
): Promise<X402AgentClient> {
  const wrappedFetch: X402AgentClient["fetch"] = async (url, init) => {
    // 1) 첫 번째 요청
    const firstResponse = await fetch(url, init);

    if (firstResponse.status !== 402) {
      return firstResponse; // 결제 불필요
    }

    // 2) PAYMENT-REQUIRED 헤더 파싱
    const paymentRequiredHeader =
      firstResponse.headers.get("payment-required") ??
      firstResponse.headers.get("PAYMENT-REQUIRED");

    if (!paymentRequiredHeader) {
      throw new Error("402 응답이지만 PAYMENT-REQUIRED 헤더가 없음");
    }

    // Phase 1: 여기서 @x402/svm 클라이언트 스킴으로 서명 생성
    // Phase 0: 가상 잔고 모드에서는 이 코드패스에 도달하지 않음
    throw new Error(
      "x402 실결제는 Phase 1 이후 활성화 예정. 현재는 가상 잔고 모드 사용."
    );
  };

  return { fetch: wrappedFetch };
}

// ---------------------------------------------------------------------------
// Convenience: 단순 호출 (1회성)
// ---------------------------------------------------------------------------

/**
 * 단일 요청을 x402 결제와 함께 수행한다.
 */
export async function x402Fetch(
  url: string,
  solanaPrivateKeyBase58: string,
  init?: RequestInit,
): Promise<Response> {
  const client = await createX402AgentClient(solanaPrivateKeyBase58);
  return client.fetch(url, init);
}
