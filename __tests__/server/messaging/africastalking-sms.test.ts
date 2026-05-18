import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  clearFetchMock,
  mockFetch,
  setupFetchMock,
} from "../../__mocks__/fetch";

import { vi } from "vitest";
vi.mock("~/env", () => ({
  env: {
    AFRICASTALKING_API_KEY: "test-key",
    AFRICASTALKING_USERNAME: "sandbox",
    AFRICASTALKING_BASE_URL: "https://at.example.com",
    AFRICASTALKING_SENDER_ID: "SARAFU",
  },
}));

import { AfricasTalkingSmsChannel } from "~/server/messaging/africastalking-sms";
import { OtpDispatchError } from "~/server/messaging/types";

const okResponse = (statusCode = 101) =>
  new Response(
    JSON.stringify({
      SMSMessageData: {
        Message: "Sent to 1/1 Total Cost: KES 0.8000",
        Recipients: [
          {
            statusCode,
            number: "+254712345678",
            status: "Success",
            cost: "KES 0.8000",
            messageId: "ATPid_x",
          },
        ],
      },
    }),
    { status: 200, headers: { "content-type": "application/json" } }
  );

beforeEach(() => setupFetchMock());
afterEach(() => clearFetchMock());

describe("AfricasTalkingSmsChannel.send", () => {
  it("posts form-encoded body with apiKey header and configured sender", async () => {
    mockFetch.mockResolvedValueOnce(okResponse(101));
    const channel = new AfricasTalkingSmsChannel();

    await channel.send({
      destination: "+254712345678",
      code: "123456",
      ttlSeconds: 600,
    });

    expect(mockFetch).toHaveBeenCalledWith(
      "https://at.example.com/version1/messaging",
      expect.objectContaining({ method: "POST" })
    );
    const init = mockFetch.mock.calls[0]![1] as RequestInit;
    expect((init.headers as Record<string, string>).apiKey).toBe("test-key");
    expect((init.headers as Record<string, string>)["Content-Type"]).toBe(
      "application/x-www-form-urlencoded"
    );
    const body = init.body as URLSearchParams;
    expect(body.get("username")).toBe("sandbox");
    expect(body.get("to")).toBe("+254712345678");
    expect(body.get("from")).toBe("SARAFU");
    expect(body.get("message")).toContain("123456");
    expect(body.get("message")).toContain("10 minutes");
  });

  it("treats statusCode 100 (Processed) as success", async () => {
    mockFetch.mockResolvedValueOnce(okResponse(100));
    const channel = new AfricasTalkingSmsChannel();
    await expect(
      channel.send({ destination: "+254700000000", code: "111111", ttlSeconds: 600 })
    ).resolves.toBeUndefined();
  });

  it("throws OtpDispatchError(bad_request) on statusCode 403 (InvalidPhoneNumber)", async () => {
    mockFetch.mockResolvedValueOnce(okResponse(403));
    const channel = new AfricasTalkingSmsChannel();
    await expect(
      channel.send({ destination: "+254700000000", code: "111111", ttlSeconds: 600 })
    ).rejects.toBeInstanceOf(OtpDispatchError);
  });

  it("throws OtpDispatchError(upstream) on non-2xx HTTP", async () => {
    mockFetch.mockResolvedValueOnce(new Response("boom", { status: 500 }));
    const channel = new AfricasTalkingSmsChannel();
    await expect(
      channel.send({ destination: "+254700000000", code: "111111", ttlSeconds: 600 })
    ).rejects.toMatchObject({ name: "OtpDispatchError", code: "upstream" });
  });

  it("throws OtpDispatchError(upstream) on network failure", async () => {
    mockFetch.mockRejectedValueOnce(new Error("network down"));
    const channel = new AfricasTalkingSmsChannel();
    await expect(
      channel.send({ destination: "+254700000000", code: "111111", ttlSeconds: 600 })
    ).rejects.toMatchObject({ name: "OtpDispatchError", code: "upstream" });
  });
});
