/**
 * x402 Agent Client — Used when an agent calls another agent's paid skill
 *
 * An x402 fetch wrapper that supports Solana Devnet signatures.
 * Automatically generates a payment signature and retries upon receiving a 402 response.
 *
 * NOTE: Phase 0 uses virtual balances, so this client will be activated from Phase 1 onward.
 * Currently provides type definitions + scaffolding only.
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
   * A fetch wrapper that automatically handles x402 payments.
   * Signs and retries the request upon receiving a 402 on the first attempt.
   */
  fetch: (url: string, init?: RequestInit) => Promise<Response>;
}

// ---------------------------------------------------------------------------
// Client Factory (Activated from Phase 1 onward)
// ---------------------------------------------------------------------------

/**
 * Creates an x402 client using a Solana private key (Base58).
 *
 * @param solanaPrivateKeyBase58 - Solana private key (Base58 encoded)
 */
export async function createX402AgentClient(
  solanaPrivateKeyBase58: string,
): Promise<X402AgentClient> {
  const wrappedFetch: X402AgentClient["fetch"] = async (url, init) => {
    // 1) First request
    const firstResponse = await fetch(url, init);

    if (firstResponse.status !== 402) {
      return firstResponse; // No payment required
    }

    // 2) Parse PAYMENT-REQUIRED header
    const paymentRequiredHeader =
      firstResponse.headers.get("payment-required") ??
      firstResponse.headers.get("PAYMENT-REQUIRED");

    if (!paymentRequiredHeader) {
      throw new Error("Received 402 response but missing PAYMENT-REQUIRED header");
    }

    // Phase 1: Generate signature using @x402/svm client scheme here
    // Phase 0: This code path is not reached in virtual balance mode
    throw new Error(
      "x402 real payments will be activated from Phase 1 onward. Currently using virtual balance mode."
    );
  };

  return { fetch: wrappedFetch };
}

// ---------------------------------------------------------------------------
// Convenience: Single-use call
// ---------------------------------------------------------------------------

/**
 * Performs a single request with x402 payment.
 */
export async function x402Fetch(
  url: string,
  solanaPrivateKeyBase58: string,
  init?: RequestInit,
): Promise<Response> {
  const client = await createX402AgentClient(solanaPrivateKeyBase58);
  return client.fetch(url, init);
}
