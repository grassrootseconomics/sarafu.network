import { createSiweMessage } from "viem/siwe";
import { privateKeyToAccount } from "viem/accounts";
import type { Hex } from "viem";
import { getDeviceId } from "./device-id";
import { getApiBaseUrl } from "./api-url";

interface AuthResult {
  token: string;
  address: Hex;
}

/**
 * Perform full SIWE authentication using a local private key.
 * 1. Fetch nonce from mobile-specific endpoint (Redis-backed, no cookies)
 * 2. Create and sign SIWE message
 * 3. Verify signature server-side and receive sealed token
 */
export async function authenticateWithSIWE(
  privateKey: Hex
): Promise<AuthResult> {
  const apiBaseUrl = getApiBaseUrl();
  const deviceId = await getDeviceId();
  const account = privateKeyToAccount(privateKey);

  // 1. Get nonce
  const nonceRes = await fetch(`${apiBaseUrl}/api/auth/mobile/nonce`, {
    headers: { "x-device-id": deviceId },
  });
  if (!nonceRes.ok) {
    const err = await nonceRes.json().catch(() => ({}));
    throw new Error(
      (err as { error?: string }).error ?? `Nonce request failed: ${nonceRes.status}`
    );
  }
  const { nonce } = (await nonceRes.json()) as { nonce: string };

  // 2. Create SIWE message
  const url = new URL(apiBaseUrl);
  const message = createSiweMessage({
    domain: url.host,
    address: account.address,
    statement: "Sign in to Sarafu Network",
    uri: "sarafu://auth",
    version: "1",
    chainId: 42220,
    nonce,
  });

  // 3. Sign
  const signature = await account.signMessage({ message });

  // 4. Verify
  const verifyRes = await fetch(`${apiBaseUrl}/api/auth/mobile/verify`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-device-id": deviceId,
    },
    body: JSON.stringify({ message, signature }),
  });

  if (!verifyRes.ok) {
    const err = await verifyRes.json().catch(() => ({}));
    throw new Error(
      (err as { error?: string }).error ?? `Verification failed: ${verifyRes.status}`
    );
  }

  const { token } = (await verifyRes.json()) as { ok: boolean; token: string };
  return { token, address: account.address as Hex };
}
