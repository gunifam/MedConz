import { coingeckoId, type CryptoCode } from "./pricing";

// Live NGN rates per coin via CoinGecko (free, no key). Cached 60s.
// Returns null when the feed is down — callers must disable crypto then,
// never guess a price.
let cache: { at: number; rates: Partial<Record<CryptoCode, number>> } = { at: 0, rates: {} };

export async function cryptoNgnRates(
  coins: CryptoCode[],
): Promise<{ rates: Partial<Record<CryptoCode, number>>; live: boolean; asOf: string }> {
  const now = Date.now();
  if (now - cache.at < 60_000 && coins.every((c) => cache.rates[c])) {
    return { rates: cache.rates, live: true, asOf: new Date(cache.at).toISOString() };
  }
  try {
    const ids = coins.map(coingeckoId).join(",");
    const res = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=ngn`,
      { signal: AbortSignal.timeout(8000) },
    );
    if (!res.ok) throw new Error("feed " + res.status);
    const data = (await res.json()) as Record<string, { ngn?: number }>;
    const rates: Partial<Record<CryptoCode, number>> = {};
    for (const c of coins) {
      const v = data[coingeckoId(c)]?.ngn;
      if (typeof v === "number" && v > 0) rates[c] = v;
    }
    if (Object.keys(rates).length === 0) throw new Error("empty feed");
    cache = { at: now, rates };
    return { rates, live: true, asOf: new Date(now).toISOString() };
  } catch {
    return { rates: {}, live: false, asOf: new Date(cache.at || now).toISOString() };
  }
}
