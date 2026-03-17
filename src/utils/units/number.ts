export const truncateByDecimalPlace = (
  value: number | string | bigint,
  numDecimalPlaces: number
) => {
  const valueNumber =
    typeof value === "bigint" || typeof value === "string"
      ? Number(value)
      : value;
  return (
    Math.trunc(valueNumber * Math.pow(10, numDecimalPlaces)) /
    Math.pow(10, numDecimalPlaces)
  );
};

/**
 * Browser-friendly number formatter.
 * Rules:
 * - Group thousands (locale-aware)
 * - Keep small decimals (e.g. 0.0076)
 * - Use scientific notation below a threshold (e.g. 0.000006 -> 6e-6)
 * - Strip trailing decimal zeros
 * - Snap near-integers (e.g. 100.00001 -> 100)
 * - Round to a maximum number of decimal places (default 4)
 */
export function formatNumber(
  n: number,
  opts: {
    locale?: string;
    scientificBelow?: number;
    integerTolerance?: number;
    maxDecimalDigits?: number; // NEW: clamp visible decimals
  } = {}
): string {
  const locale = opts.locale ?? "en-US";
  const scientificBelow = opts.scientificBelow ?? 1e-4;
  const integerTolerance = opts.integerTolerance ?? 1e-4;
  const maxDecimalDigits = opts.maxDecimalDigits ?? 4;

  if (!Number.isFinite(n)) return String(n);

  // Normalize negative zero to "0"
  if (Object.is(n, -0)) n = 0;
  if (n === 0) return "0";

  const abs = Math.abs(n);

  // 1) Very small -> scientific notation
  if (abs < scientificBelow) {
    const s = n.toExponential().replace("e+", "e");
    const [mantissa, exp] = s.split("e");
    const mantissaFormated = mantissa?.replace(/(\.\d*?[1-9])0+$/, "$1").replace(/\.0+$/, "");
    const expNum = parseInt(exp!, 10);
    return `${mantissaFormated}e${expNum}`;
  }

  // 2) Snap near-integers
  const nearestInt = Math.round(n);
  if (Math.abs(n - nearestInt) <= integerTolerance) n = nearestInt;

  // 3) Round to maxDecimalDigits to suppress float noise (e.g. ...00000043)
  //    Using toFixed for rounding, then parse back to avoid padded zeros.
  const factor = Math.pow(10, maxDecimalDigits);
  n = Math.round(n * factor) / factor;

  // 4) Locale formatting with grouping, limit fractional digits to maxDecimalDigits
  const nf = new Intl.NumberFormat(locale, {
    useGrouping: true,
    maximumFractionDigits: maxDecimalDigits,
  });

  // Intl won't add trailing zeros, so we mostly don't need trimming,
  // but keep a final cleanup for rare locales.
  let out = nf.format(n);
  out = out.replace(/(\.\d*?[1-9])0+$/, "$1").replace(/\.0+$/, "");
  return out;
}


export const bigIntMax = (...args: bigint[]): bigint => args.reduce((m, e) => e > m ? e : m);
export const bigIntMin = (...args: bigint[]): bigint => args.reduce((m, e) => e < m ? e : m);

import { ISO_CURRENCIES } from "~/lib/currencies";

const ISO_CURRENCY_CODES: ReadonlySet<string> = new Set(
  ISO_CURRENCIES.map((c) => c.code),
);

/**
 * Local currency symbols for currencies where Intl.NumberFormat falls back
 * to the ISO 4217 code (no CLDR narrow symbol entry).
 */
const CURRENCY_SYMBOL_OVERRIDES: Readonly<Record<string, string>> = {
  // Africa
  KES: "KSh",
  TZS: "TSh",
  UGX: "USh",
  ETB: "Br",
  MWK: "MK",
  CDF: "FC",
  BIF: "FBu",
  SOS: "Sh.So.",
  SDG: "LS",
  ERN: "Nfk",
  GMD: "D",
  SLE: "Le",
  MZN: "MT",
  // South Asia
  BTN: "Nu.",
  MVR: "Rf",
  // Middle East / North Africa
  AED: "د.إ",
  SAR: "﷼",
  QAR: "﷼",
  BHD: "BD",
  KWD: "د.ك",
  OMR: "﷼",
  JOD: "JD",
  IQD: "ع.د",
  // Europe
  CHF: "Fr.",
  ALL: "L",
  BGN: "лв",
  RSD: "din.",
  MDL: "L",
  MKD: "ден",
  // Americas / Caribbean
  PEN: "S/",
  PAB: "B/.",
  HTG: "G",
  VES: "Bs.S",
};

/**
 * Format a number as a currency value using Intl.NumberFormat.
 * - ISO 4217 codes: uses `style: "currency"` with correct decimals & symbol
 * - Custom units (e.g. "Hour"): falls back to `formatNumber(value) + " " + unit`
 */
export function formatCurrencyValue(
  value: number,
  currencyCode: string | undefined,
  opts?: {
    maximumFractionDigits?: number;
    minimumFractionDigits?: number;
    currencyDisplay?: "narrowSymbol" | "symbol" | "code";
  },
): string {
  if (!Number.isFinite(value)) return String(value);

  if (!currencyCode) {
    return formatNumber(value);
  }

  if (ISO_CURRENCY_CODES.has(currencyCode)) {
    const nf = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currencyCode,
      currencyDisplay: opts?.currencyDisplay ?? "narrowSymbol",
      ...(opts?.maximumFractionDigits !== undefined && {
        maximumFractionDigits: opts.maximumFractionDigits,
      }),
      ...(opts?.minimumFractionDigits !== undefined && {
        minimumFractionDigits: opts.minimumFractionDigits,
      }),
    });
    let result = nf.format(value);
    const override = CURRENCY_SYMBOL_OVERRIDES[currencyCode];
    if (override && result.startsWith(currencyCode)) {
      result = override + result.slice(currencyCode.length);
    }
    return result;
  }

  // Custom unit — fall back to decimal formatting + unit suffix
  return `${formatNumber(value, { maxDecimalDigits: opts?.maximumFractionDigits ?? 2 })} ${currencyCode}`;
}
