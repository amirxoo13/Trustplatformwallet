import { COINS, type CoinMeta } from "@/lib/coins";

export interface MarketCoin {
  id: string;
  symbol: string;
  name: string;
  image: string;
  price: number;
  change24h: number;
  marketCap: number;
  volume24h: number;
  sparkline: number[];
  high24h: number;
  low24h: number;
  rank: number;
}

export interface ChartPoint {
  t: number;
  p: number;
}

const CACHE_MS = 45_000;

interface CacheEntry<T> {
  at: number;
  data: T;
}

let marketsCache: CacheEntry<MarketCoin[]> | null = null;
const chartCache = new Map<string, CacheEntry<ChartPoint[]>>();

async function getJson(url: string): Promise<unknown> {
  const res = await fetch(url, { headers: { accept: "application/json" } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

function asRecord(v: unknown): Record<string, unknown> | null {
  return v !== null && typeof v === "object" ? (v as Record<string, unknown>) : null;
}

function num(v: unknown, fallback = 0): number {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function fromCoinGecko(raw: unknown): MarketCoin[] | null {
  if (!Array.isArray(raw) || raw.length === 0) return null;
  const out: MarketCoin[] = [];
  for (const item of raw) {
    const r = asRecord(item);
    if (!r) continue;
    const spark = asRecord(r.sparkline_in_7d);
    const sparkline = Array.isArray(spark?.price)
      ? (spark.price as unknown[]).map((x) => num(x)).filter((n) => n > 0)
      : [];
    out.push({
      id: String(r.id ?? ""),
      symbol: String(r.symbol ?? "").toUpperCase(),
      name: String(r.name ?? ""),
      image: String(r.image ?? ""),
      price: num(r.current_price),
      change24h: num(r.price_change_percentage_24h),
      marketCap: num(r.market_cap),
      volume24h: num(r.total_volume),
      sparkline,
      high24h: num(r.high_24h),
      low24h: num(r.low_24h),
      rank: num(r.market_cap_rank),
    });
  }
  return out.length ? out : null;
}

function fromBinance(raw: unknown, catalog: CoinMeta[]): MarketCoin[] | null {
  if (!Array.isArray(raw)) return null;
  const bySymbol = new Map<string, Record<string, unknown>>();
  for (const item of raw) {
    const r = asRecord(item);
    if (!r) continue;
    bySymbol.set(String(r.symbol ?? ""), r);
  }
  const out: MarketCoin[] = [];
  catalog.forEach((coin, i) => {
    const pair = coin.binance && coin.binance !== "USDTTRY" ? coin.binance : `${coin.symbol}USDT`;
    const row = bySymbol.get(pair) ?? (coin.symbol === "USDT" ? null : bySymbol.get(`${coin.symbol}USDT`));
    const price = coin.symbol === "USDT" || coin.symbol === "USDC" ? 1 : num(row?.lastPrice, 0);
    const change = coin.symbol === "USDT" || coin.symbol === "USDC" ? 0 : num(row?.priceChangePercent, 0);
    if (price <= 0 && coin.symbol !== "USDT" && coin.symbol !== "USDC") return;
    out.push({
      id: coin.id,
      symbol: coin.symbol,
      name: coin.name,
      image: coin.image,
      price: price || 1,
      change24h: change,
      marketCap: 0,
      volume24h: num(row?.quoteVolume),
      sparkline: [],
      high24h: num(row?.highPrice, price),
      low24h: num(row?.lowPrice, price),
      rank: i + 1,
    });
  });
  return out.length ? out : null;
}

export async function fetchMarkets(): Promise<MarketCoin[]> {
  if (marketsCache && Date.now() - marketsCache.at < CACHE_MS) {
    return marketsCache.data;
  }
  const ids = COINS.map((c) => c.id).join(",");
  try {
    const gecko = await getJson(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&sparkline=true&price_change_percentage=24h`,
    );
    const parsed = fromCoinGecko(gecko);
    if (parsed) {
      marketsCache = { at: Date.now(), data: parsed };
      return parsed;
    }
  } catch {
    /* fall through */
  }
  try {
    const binance = await getJson("https://api.binance.com/api/v3/ticker/24hr");
    const parsed = fromBinance(binance, COINS);
    if (parsed) {
      marketsCache = { at: Date.now(), data: parsed };
      return parsed;
    }
  } catch {
    /* fall through */
  }
  if (marketsCache) return marketsCache.data;
  throw new Error("Price APIs are unavailable right now.");
}

export async function fetchChart(id: string, days: number): Promise<ChartPoint[]> {
  const key = `${id}:${days}`;
  const hit = chartCache.get(key);
  if (hit && Date.now() - hit.at < CACHE_MS) return hit.data;

  try {
    const raw = await getJson(
      `https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=usd&days=${days}`,
    );
    const rec = asRecord(raw);
    const prices = rec && Array.isArray(rec.prices) ? rec.prices : [];
    const points: ChartPoint[] = [];
    for (const row of prices) {
      if (!Array.isArray(row) || row.length < 2) continue;
      points.push({ t: num(row[0]), p: num(row[1]) });
    }
    if (points.length) {
      chartCache.set(key, { at: Date.now(), data: points });
      return points;
    }
  } catch {
    /* fall through */
  }

  const coin = COINS.find((c) => c.id === id);
  const symbol = coin?.binance ?? (coin ? `${coin.symbol}USDT` : null);
  if (symbol && symbol !== "USDTTRY") {
    const interval = days <= 1 ? "15m" : days <= 7 ? "1h" : days <= 30 ? "4h" : "1d";
    const limit = days <= 1 ? 96 : days <= 7 ? 168 : days <= 30 ? 180 : 180;
    try {
      const raw = await getJson(
        `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`,
      );
      if (Array.isArray(raw)) {
        const points: ChartPoint[] = [];
        for (const row of raw) {
          if (!Array.isArray(row)) continue;
          points.push({ t: num(row[0]), p: num(row[4]) });
        }
        if (points.length) {
          chartCache.set(key, { at: Date.now(), data: points });
          return points;
        }
      }
    } catch {
      /* ignore */
    }
  }

  const prev = chartCache.get(key);
  if (prev) return prev.data;
  throw new Error("Chart data is unavailable.");
}

export function marketMap(list: MarketCoin[]): Record<string, MarketCoin> {
  const map: Record<string, MarketCoin> = {};
  for (const m of list) {
    map[m.id] = m;
    map[m.symbol.toUpperCase()] = m;
  }
  return map;
}
