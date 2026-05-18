import { env } from "~/env";
import { OtpDispatchError, type OtpChannel } from "./types";

interface AfricasTalkingResponse {
  SMSMessageData?: {
    Message?: string;
    Recipients?: {
      statusCode: number;
      number: string;
      status: string;
      cost: string;
      messageId: string;
    }[];
  };
}

const ACCEPTED_STATUS_CODES = new Set([100, 101, 102]);

export class AfricasTalkingSmsChannel implements OtpChannel {
  readonly id = "africastalking-sms";
  readonly kind = "sms" as const;

  async send(input: {
    destination: string;
    code: string;
    ttlSeconds: number;
  }): Promise<void> {
    const ttlMinutes = Math.max(1, Math.round(input.ttlSeconds / 60));
    const message = `${input.code} is your Sarafu verification code. It expires in ${ttlMinutes} minutes.`;

    const body = new URLSearchParams({
      username: env.AFRICASTALKING_USERNAME,
      to: input.destination,
      message,
    });
    if (env.AFRICASTALKING_SENDER_ID) {
      body.set("from", env.AFRICASTALKING_SENDER_ID);
    }

    const url = `${env.AFRICASTALKING_BASE_URL}/version1/messaging`;

    let response: Response;
    try {
      response = await fetch(url, {
        method: "POST",
        headers: {
          apiKey: env.AFRICASTALKING_API_KEY,
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
        },
        body,
      });
    } catch (err) {
      throw new OtpDispatchError(
        "upstream",
        err instanceof Error ? err.message : "Network failure"
      );
    }

    const rawBody = await response.text();
    let parsed: AfricasTalkingResponse | null = null;
    try {
      parsed = rawBody ? (JSON.parse(rawBody) as AfricasTalkingResponse) : null;
    } catch {
      parsed = null;
    }

    if (!response.ok || !parsed) {
      throw new OtpDispatchError(
        "upstream",
        parsed?.SMSMessageData?.Message ??
          `Africa's Talking returned ${response.status}`
      );
    }

    const recipient = parsed.SMSMessageData?.Recipients?.[0];
    if (!recipient) {
      throw new OtpDispatchError(
        "upstream",
        parsed.SMSMessageData?.Message ?? "No recipient in response"
      );
    }
    if (!ACCEPTED_STATUS_CODES.has(recipient.statusCode)) {
      const code: "bad_request" | "upstream" =
        recipient.statusCode === 403 || recipient.statusCode === 404
          ? "bad_request"
          : "upstream";
      throw new OtpDispatchError(
        code,
        `${recipient.status} (${recipient.statusCode})`
      );
    }
  }
}
