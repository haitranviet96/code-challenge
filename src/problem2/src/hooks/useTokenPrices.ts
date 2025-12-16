import { useCallback, useEffect, useRef, useState } from "react";
import type { TokenOption, TokenPrice } from "../types";

const PRICE_ENDPOINT = "https://interview.switcheo.com/prices.json";
const TOKEN_ICON_BASE =
  "https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens";

export type TokenFeedState = {
  tokens: TokenOption[];
  status: "idle" | "loading" | "ready" | "error";
  errorMessage: string | null;
  lastUpdated: number | null;
  refresh: () => Promise<void>;
};

const buildTokenOptions = (payload: TokenPrice[]) => {
  const map = new Map<string, TokenPrice>();
  payload.forEach((entry) => {
    if (!entry.price || entry.price <= 0) return;
    const existing = map.get(entry.currency);
    if (!existing) {
      map.set(entry.currency, entry);
      return;
    }
    if (new Date(entry.date).getTime() > new Date(existing.date).getTime()) {
      map.set(entry.currency, entry);
    }
  });

  return Array.from(map.values())
    .map<TokenOption>((token) => ({
      symbol: token.currency,
      price: token.price,
      date: token.date,
      iconUrl: `${TOKEN_ICON_BASE}/${encodeURIComponent(token.currency)}.svg`,
    }))
    .sort((a, b) => a.symbol.localeCompare(b.symbol));
};

type Options = {
  autoRefresh?: boolean;
  intervalMs?: number;
};

export function useTokenPrices(options: Options = {}): TokenFeedState {
  const { autoRefresh = true, intervalMs = 60_000 } = options;
  const [tokens, setTokens] = useState<TokenOption[]>([]);
  const [status, setStatus] = useState<TokenFeedState["status"]>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const cancelledRef = useRef(false);

  const fetchPrices = useCallback(async () => {
    try {
      setStatus((prev) => (prev === "ready" ? prev : "loading"));
      setErrorMessage(null);
      const response = await fetch(PRICE_ENDPOINT);
      if (!response.ok) {
        throw new Error("Unable to retrieve live prices.");
      }
      const payload: TokenPrice[] = await response.json();
      if (cancelledRef.current) return;
      setTokens(buildTokenOptions(payload));
      setStatus("ready");
      setLastUpdated(Date.now());
    } catch (error) {
      if (cancelledRef.current) return;
      console.error(error);
      setStatus("error");
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to fetch token prices.",
      );
      throw error;
    }
  }, []);

  useEffect(() => {
    cancelledRef.current = false;
    return () => {
      cancelledRef.current = true;
    };
  }, []);

  useEffect(() => {
    fetchPrices().catch(() => undefined);
  }, [fetchPrices]);

  useEffect(() => {
    if (!autoRefresh) return;
    const id = setInterval(() => {
      fetchPrices().catch(() => undefined);
    }, intervalMs);
    return () => clearInterval(id);
  }, [autoRefresh, intervalMs, fetchPrices]);

  return {
    tokens,
    status,
    errorMessage,
    lastUpdated,
    refresh: fetchPrices,
  };
}
