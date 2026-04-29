import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("~/env", () => ({
  env: {
    PRETIUM_RAMP_API_URL: "https://pretium.example.com",
  },
}));

import {
  getRates,
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
