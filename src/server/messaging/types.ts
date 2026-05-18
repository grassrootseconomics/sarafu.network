export type OtpChannelKind = "sms" | "email";

export interface OtpChannel {
  readonly id: string;
  readonly kind: OtpChannelKind;
  send(input: {
    destination: string;
    code: string;
    ttlSeconds: number;
  }): Promise<void>;
}

export type OtpErrorCode = "bad_request" | "rate_limited" | "upstream";

export class OtpDispatchError extends Error {
  constructor(
    public readonly code: OtpErrorCode,
    public readonly description: string
  ) {
    super(description);
    this.name = "OtpDispatchError";
  }
}
