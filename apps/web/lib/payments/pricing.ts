// Pricing — single place for every money number (PRD 7).
// CONSULT_PRICE_NGN is THE price. Espees rate + crypto list are env-driven
// so the MedConz team updates them in one place.

export type Currency = "NGN" | "ESPEES" | "CRYPTO";
export type CryptoCode = "BTC" | "ETH" | "USDT";

const num = (v: string | undefined, fallback: number) => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : fallback;
};

export const pricing = {
  consultNgn: () => num(process.env.CONSULT_PRICE_NGN, 4100),
  espeesRate: () => num(process.env.ESPEES_NGN_RATE, 2050), // 1 Espees = N NGN
  cryptoTtlMinutes: () => num(process.env.CRYPTO_QUOTE_TTL_MINUTES, 15),
  followupFreeHours: () => num(process.env.FOLLOWUP_FREE_HOURS, 72),
  refundSameCurrency: () => (process.env.REFUND_SAME_CURRENCY ?? "true") !== "false",
  cryptos: (): CryptoCode[] => {
    const list = (process.env.SUPPORTED_CRYPTOS ?? "BTC,ETH,USDT")
      .split(",")
      .map((s) => s.trim().toUpperCase())
      .filter((s): s is CryptoCode => s === "BTC" || s === "ETH" || s === "USDT");
    return list.length > 0 ? list : ["BTC", "ETH", "USDT"];
  },
};

export const CRYPTO_DECIMALS: Record<CryptoCode, number> = { BTC: 8, ETH: 6, USDT: 2 };
const COINGECKO_IDS: Record<CryptoCode, string> = { BTC: "bitcoin", ETH: "ethereum", USDT: "tether" };
export const coingeckoId = (c: CryptoCode) => COINGECKO_IDS[c];

/** Exact Espees string for an NGN price (up to 4 decimals, no float drift). */
export function espeesFor(ngn: number, rate: number): string {
  const v = Math.round((ngn / rate) * 10000) / 10000;
  return String(v);
}

/** Exact crypto string for an NGN price given the coin's NGN rate. */
export function cryptoFor(ngn: number, coinNgnRate: number, decimals: number): string {
  const factor = 10 ** decimals;
  return String(Math.ceil((ngn / coinNgnRate) * factor) / factor);
}

export function formatNgn(ngn: number): string {
  return ngn.toLocaleString("en-NG");
}
