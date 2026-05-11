import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("~/env", () => ({
  env: {
    PRETIUM_RAMP_API_URL: "https://pretium.example.com",
    SARAFU_CUSTODIAL_API_TOKEN: "test-token",
  },
}));

import {
  getRates,
  getTransactionsByAddress,
  triggerOnramp,
  PretiumError,
} from "~/lib/sarafu/pretium";
import { clearFetchMock, mockFetch, setupFetchMock } from "../../__mocks__/fetch";

beforeEach(() => {
  setupFetchMock();
});

afterEach(() => {
  clearFetchMock();
});

describe("pretium.getRates", () => {
  it("parses { ok, result: { buy, sell } } and returns the result", async () => {
    mockFetch.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          ok: true,
          description: "Rates retrieved successfully",
          result: { buy: 130.25, sell: 132.5 },
        }),
        { status: 200, headers: { "content-type": "application/json" } }
      )
    );

    const rates = await getRates();

    expect(rates).toEqual({ buy: 130.25, sell: 132.5 });
    expect(mockFetch).toHaveBeenCalledWith(
      "https://pretium.example.com/api/v1/rates",
      expect.objectContaining({ method: "GET" })
    );
    const sentHeaders = (mockFetch.mock.calls[0]![1] as RequestInit)
      .headers as Headers;
    expect(sentHeaders.get("authorization")).toBe("Bearer test-token");
  });

  it("throws PretiumError(upstream) on HTTP 500", async () => {
    mockFetch.mockResolvedValueOnce(
      new Response("boom", { status: 500 })
    );

    await expect(getRates()).rejects.toMatchObject({
      name: "PretiumError",
      code: "upstream",
    });
  });

  it("throws PretiumError(upstream) on network failure", async () => {
    mockFetch.mockRejectedValueOnce(new TypeError("network down"));

    await expect(getRates()).rejects.toBeInstanceOf(PretiumError);
    await expect(getRates()).rejects.toMatchObject({ code: "upstream" });
  });
});

describe("pretium.triggerOnramp", () => {
  const goodInput = {
    address: "0xEb3907ECAD74A0013C259d5874aE7F22DCBcC95B" as `0x${string}`,
    phoneNumber: "+254700000000",
    asset: "USDT" as const,
    amount: 100,
  };

  it("POSTs the correct URL/body and returns the result", async () => {
    mockFetch.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          ok: true,
          description: "Onramp initiated successfully",
          result: {
            transactionCode: "TX-ABC-123",
            status: "PENDING",
            message: "STK push sent",
          },
        }),
        { status: 200, headers: { "content-type": "application/json" } }
      )
    );

    const out = await triggerOnramp(goodInput);

    expect(out).toEqual({
      transactionCode: "TX-ABC-123",
      status: "PENDING",
      message: "STK push sent",
    });

    expect(mockFetch).toHaveBeenCalledWith(
      "https://pretium.example.com/api/v1/trigger-onramp",
      expect.objectContaining({ method: "POST" })
    );
    const sentInit = mockFetch.mock.calls[0]![1] as RequestInit;
    const sentHeaders = sentInit.headers as Headers;
    expect(sentHeaders.get("content-type")).toBe("application/json");
    expect(sentHeaders.get("authorization")).toBe("Bearer test-token");
    const sentBody = JSON.parse(sentInit.body as string);
    expect(sentBody).toEqual({
      address: goodInput.address,
      phoneNumber: goodInput.phoneNumber,
      asset: "USDT",
      amount: 100,
    });
  });

  it("maps HTTP 400 to PretiumError(bad_request) with upstream description", async () => {
    mockFetch.mockResolvedValueOnce(
      new Response(
        JSON.stringify({ ok: false, description: "amount out of range" }),
        { status: 400, headers: { "content-type": "application/json" } }
      )
    );

    await expect(triggerOnramp(goodInput)).rejects.toMatchObject({
      code: "bad_request",
      description: "amount out of range",
    });
  });

  it("maps HTTP 404 to PretiumError(not_found)", async () => {
    mockFetch.mockResolvedValueOnce(
      new Response(
        JSON.stringify({ ok: false, description: "Address not linked" }),
        { status: 404, headers: { "content-type": "application/json" } }
      )
    );

    await expect(triggerOnramp(goodInput)).rejects.toMatchObject({
      code: "not_found",
    });
  });
});

describe("pretium.getTransactionsByAddress", () => {
  const address = "0xEb3907ECAD74A0013C259d5874aE7F22DCBcC95B" as const;

  it("GETs the by-address endpoint and returns the parsed result", async () => {
    const sample = {
      address,
      onramps: [
        {
          ID: 1,
          PretiumID: "TX-1",
          PretiumStatus: "PENDING",
          MpesaConfirmation: null,
          PhoneNumber: "0700000000",
          AmountUSD: "1.50",
          AmountKES: "200.00",
          TxHash: "",
          TokenAddress: "0xabc",
          WalletAddress: address,
          CreatedAt: "2026-05-11T06:21:09Z",
          UpdatedAt: "2026-05-11T06:21:09Z",
        },
      ],
      offramps: [],
      totalCount: 1,
    };

    mockFetch.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          ok: true,
          description: "Transactions retrieved successfully",
          result: sample,
        }),
        { status: 200, headers: { "content-type": "application/json" } }
      )
    );

    const result = await getTransactionsByAddress(address);

    expect(result).toEqual(sample);
    expect(mockFetch).toHaveBeenCalledWith(
      `https://pretium.example.com/api/v1/transactions-by-address/${address}`,
      expect.objectContaining({ method: "GET" })
    );
    const sentHeaders = (mockFetch.mock.calls[0]![1] as RequestInit)
      .headers as Headers;
    expect(sentHeaders.get("authorization")).toBe("Bearer test-token");
  });

  it("coerces null onramps/offramps slices to empty arrays", async () => {
    mockFetch.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          ok: true,
          description: "Transactions retrieved successfully",
          result: {
            address,
            onramps: null,
            offramps: null,
            totalCount: 0,
          },
        }),
        { status: 200, headers: { "content-type": "application/json" } }
      )
    );

    const result = await getTransactionsByAddress(address);

    expect(result.onramps).toEqual([]);
    expect(result.offramps).toEqual([]);
    expect(result.totalCount).toBe(0);
  });

  it("maps HTTP 400 to PretiumError(bad_request)", async () => {
    mockFetch.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          ok: false,
          description: "Invalid Ethereum address",
        }),
        { status: 400, headers: { "content-type": "application/json" } }
      )
    );

    await expect(getTransactionsByAddress(address)).rejects.toMatchObject({
      code: "bad_request",
    });
  });
});
