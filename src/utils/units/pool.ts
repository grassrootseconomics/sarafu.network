export const PRICE_INDEX_SCALE = 4;
export function fromRawPriceIndex(raw: bigint | undefined): number {
  if (raw === undefined) return 0;
  return Number(raw) / 10 ** PRICE_INDEX_SCALE;
}

export function toRawPriceIndex(value: number): bigint {
  const trunc = Math.trunc(value * 10 ** PRICE_INDEX_SCALE);
  return BigInt(trunc);
}
