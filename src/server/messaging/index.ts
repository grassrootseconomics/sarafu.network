import { AfricasTalkingSmsChannel } from "./africastalking-sms";
import type { OtpChannel } from "./types";

let smsChannel: OtpChannel | null = null;

export function getOtpChannelForPhone(): OtpChannel {
  smsChannel ??= new AfricasTalkingSmsChannel();
  return smsChannel;
}

// Future: getOtpChannelForEmail(): OtpChannel
// Future: resolveOtpChannel(destination): OtpChannel  (kind inferred from destination)

export { OtpDispatchError } from "./types";
export type { OtpChannel, OtpChannelKind, OtpErrorCode } from "./types";
