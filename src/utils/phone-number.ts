export function normalizePhoneNumber(phoneNumber: string) {
  phoneNumber = phoneNumber.replace(/[^\d+]+/g, "");
  if (phoneNumber.match(/^254/)) phoneNumber = "+" + phoneNumber;
  if (phoneNumber.match(/^0/)) phoneNumber = phoneNumber.replace(/^0/, "+254");
  if (!phoneNumber.match(/^\+/)) phoneNumber = "+254" + phoneNumber;
  return phoneNumber;
}

export function isPhoneNumber(phoneNumber: string) {
  // Remove all spaces
  phoneNumber = phoneNumber.replace(/\s/g, "");
  if(phoneNumber.match(/^\+\d+$/)) return true;
  if(phoneNumber.match(/^\d+$/)) return true;
  return false;
}