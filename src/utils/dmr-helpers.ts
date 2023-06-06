export function calculateDecayLevel(
  demurrage_rate: number,
  periodMins: bigint
): bigint {
  const decay_level = (1 - demurrage_rate) ** (1 / Number(periodMins));
  if (decay_level >= 1.0) {
    throw Error("demurrage level must be less than 100%");
  }
  return toFixed(decay_level);
}

// Function toFixed converts a decimal number to a 128-bit positive fixed-point number.
export function toFixed(v: number): bigint {
  // Splitting the number into integer and decimal part.
  const [si, sf] = v.toString().split(".");
  // Parsing integer and decimal parts.
  const d = Number(si);
  let f = parseFloat(`0.${sf}`);

  let r = BigInt(0);
  // Looping through bits for the fractional part.
  for (let i = 0; i < 64; i++) {
    f *= 2;
    if (f > 1.0) {
      // Setting bit if fractional part * 2 is larger than 1.
      r |= BigInt(1) << BigInt(63 - i);
      f -= 1.0;
    }
  }

  // Combining decimal and fractional parts.
  r += BigInt(d) << BigInt(64);
  return r; // Returning the resulting fixed-point number.
}

// Function fromFixed converts a 128-bit positive fixed-point number back to a decimal number.
export function fromFixed(v: string): number {
  // Removing "0x" from the beginning of the string, if it's there.
  if (v.startsWith("0x")) {
    v = v.substring(2);
  }

  // Prepending a "0" if string length is odd.
  if (v.length % 2 !== 0) {
    v = "0" + v;
  }

  // Throwing an error if string length is less than 16.
  if (v.length < 16) {
    throw new Error("need at least 64 bit hex");
  }

  // Parsing input into a BigInt.
  const b = BigInt(`0x${v}`);
  // Getting lower 64 bits for the fractional part.
  const d = b & BigInt("0xffffffffffffffff");

  let r = 0.0;
  // Initializing bitmask for going through the fractional part.
  let k = BigInt(1) << BigInt(63);
  for (let i = 0; i < 64; i++) {
    // If bit is set in the fractional part, adding corresponding decimal value to the result.
    if ((k & d) > BigInt(0)) {
      r += 1 / 2 ** (i + 1);
    }
    k >>= BigInt(1); // Shifting the bitmask right.
  }

  // Shifting to get integer part.
  const i = b >> BigInt(64);
  const f = r.toFixed(64).split(".")[1];
  return parseFloat(`${i}.${f}`);
}
