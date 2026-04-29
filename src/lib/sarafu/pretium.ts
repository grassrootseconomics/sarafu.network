import { env } from "~/env";

export type PretiumErrorCode = "bad_request" | "not_found" | "upstream";

export class PretiumError extends Error {
  constructor(
    public readonly code: PretiumErrorCode,
    public readonly description: string
  ) {
    super(description);
    this.name = "PretiumError";
  }
}

interface OkEnvelope<T> {
  ok: true;
  description: string;
  result: T;
}

interface ErrEnvelope {
  ok: false;
  description: string;
}

type Envelope<T> = OkEnvelope<T> | ErrEnvelope;

const baseUrl = () => `${env.PRETIUM_RAMP_API_URL}/api/v1`;

function codeForStatus(status: number): PretiumErrorCode {
  if (status === 400) return "bad_request";
  if (status === 404) return "not_found";
  return "upstream";
}

async function request<T>(
  path: string,
  init: RequestInit
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${baseUrl()}${path}`, init);
    if (!response) {
      throw new TypeError("fetch returned no response");
    }
  } catch (err) {
    throw new PretiumError(
      "upstream",
      err instanceof Error ? err.message : "Network failure"
    );
  }

  let body: Envelope<T> | null = null;
  try {
    body = (await response.json()) as Envelope<T>;
  } catch {
    body = null;
  }

  if (!response.ok || !body || body.ok === false) {
    throw new PretiumError(
      codeForStatus(response.status),
      body?.description ?? `Upstream returned ${response.status}`
    );
  }

  return body.result;
}

export async function getRates(): Promise<{ buy: number; sell: number }> {
  return request<{ buy: number; sell: number }>("/rates", { method: "GET" });
}

export async function triggerOnramp(input: {
  address: `0x${string}`;
  phoneNumber: string;
  asset: "USDT" | "USDC" | "cUSD";
  amount: number;
}): Promise<{ transactionCode: string; status: string; message: string }> {
  return request("/trigger-onramp", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      address: input.address,
      phoneNumber: input.phoneNumber,
      asset: input.asset,
      amount: input.amount,
    }),
  });
}
