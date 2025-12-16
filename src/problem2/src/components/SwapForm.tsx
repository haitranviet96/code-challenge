import { useEffect, useMemo, useState } from "react";
import { useTokenPrices } from "../hooks/useTokenPrices";
import { TokenField } from "./TokenField";
import { formatFiat, formatInputValue, formatToken } from "../utils/format";
import { deterministicBalance } from "../utils/balance";
import type { TokenOption } from "../types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUpDown, faArrowsRotate } from "@fortawesome/free-solid-svg-icons";

const REFRESH_INTERVAL_MS = 60_000;

export function SwapForm() {
  const [manualRefreshing, setManualRefreshing] = useState(false);
  const [countdown, setCountdown] = useState(
    Math.ceil(REFRESH_INTERVAL_MS / 1000),
  );
  const {
    tokens,
    status,
    errorMessage,
    refresh,
    lastUpdated,
  } = useTokenPrices({
    autoRefresh: true,
    intervalMs: REFRESH_INTERVAL_MS,
  });
  const [fromSymbol, setFromSymbol] = useState<string | null>(null);
  const [toSymbol, setToSymbol] = useState<string | null>(null);
  const [amount, setAmount] = useState("0");
  const [submitState, setSubmitState] = useState<"idle" | "loading">("idle");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fromToken = useMemo(
    () => tokens.find((token) => token.symbol === fromSymbol),
    [tokens, fromSymbol],
  );
  const toToken = useMemo(
    () => tokens.find((token) => token.symbol === toSymbol),
    [tokens, toSymbol],
  );

  useEffect(() => {
    if (!tokens.length) return;
    if (!fromSymbol || !toSymbol) {
      const [first, second] = tokens;
      setFromSymbol(first?.symbol ?? null);
      setToSymbol(second ? second.symbol : first?.symbol ?? null);
    }
  }, [tokens, fromSymbol, toSymbol]);

  useEffect(() => {
    if (!toastMessage) return;
    const id = setTimeout(() => setToastMessage(null), 3600);
    return () => clearTimeout(id);
  }, [toastMessage]);

  useEffect(() => {
    const tick = () => {
      if (!lastUpdated) {
        setCountdown(Math.ceil(REFRESH_INTERVAL_MS / 1000));
        return;
      }
      const remaining = Math.max(
        1,
        Math.ceil((lastUpdated + REFRESH_INTERVAL_MS - Date.now()) / 1000),
      );
      setCountdown(remaining);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [lastUpdated]);

  const amountValue = Number(amount) || 0;
  const fromBalance = fromToken ? Number(deterministicBalance(fromToken.symbol)) : 0;
  const exceedsBalance = fromBalance > 0 && amountValue > fromBalance;
  const conversionRate =
    fromToken && toToken && toToken.price !== 0
      ? fromToken.price / toToken.price
      : 0;
  const quoteAmount = amountValue && conversionRate ? amountValue * conversionRate : 0;

  const isSwapDisabled =
    submitState === "loading" ||
    !amountValue ||
    amountValue <= 0 ||
    !fromToken ||
    !toToken ||
    fromToken.symbol === toToken.symbol ||
    status !== "ready" ||
    exceedsBalance;

  const swapLabel = (() => {
    if (submitState === "loading") return "Submitting…";
    if (status === "loading") return "Fetching markets…";
    if (status === "error") return "Retry soon";
    return "Swap now";
  })();

  const handleAmountChange = (value: string) => {
    if (value === "") {
      setAmount("");
      return;
    }
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return;
    const next = parsed < 0 ? 0 : parsed;
    setAmount(formatInputValue(next));
  };

  const handleSwitch = () => {
    if (!fromToken || !toToken) return;
    setFromSymbol(toToken.symbol);
    setToSymbol(fromToken.symbol);
    if (quoteAmount) {
      setAmount(formatInputValue(quoteAmount));
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSwapDisabled || !fromToken || !toToken) return;
    setSubmitState("loading");
    setToastMessage(null);

    window.setTimeout(() => {
      setSubmitState("idle");
      setToastMessage(
        `Swapped ${formatToken(amountValue, 4)} ${fromToken.symbol} → ${formatToken(quoteAmount, 4)} ${toToken.symbol}`,
      );
    }, 1300);
  };

  const helperText = (token?: TokenOption, value?: number) =>
    token && value ? `≈ ${formatFiat(value * token.price, 2)}` : "Waiting for price";

  useEffect(() => {
    if (!fromToken) return;
    const balance = Number(deterministicBalance(fromToken.symbol));
    setAmount((prev) => {
      const parsed = Number(prev) || 0;
      if (parsed === 0 && balance) {
        return formatInputValue(Math.min(balance, 100));
      }
      if (parsed > balance) {
        return formatInputValue(balance);
      }
      return prev;
    });
  }, [fromToken]);

  const lastUpdatedLabel = lastUpdated
    ? new Date(lastUpdated).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    : "--";

  const handleManualRefresh = async () => {
    try {
      setManualRefreshing(true);
      await refresh();
    } catch (error) {
      console.error(error);
    } finally {
      setManualRefreshing(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="glass-panel relative w-full rounded-[32px] border border-white/10 p-5 shadow-glow sm:p-8"
    >
      <div className="space-y-4">
        <TokenField
          label="You pay"
          amount={amount}
          onAmountChange={handleAmountChange}
          token={fromToken}
          tokens={tokens}
          disabled={status !== "ready"}
          onSelectToken={setFromSymbol}
          helperLabel={
            exceedsBalance ? "Exceeds available balance" : helperText(fromToken, amountValue)
          }
          balanceLabel={
            fromToken
              ? `Balance: ${deterministicBalance(fromToken.symbol)} ${fromToken.symbol}`
              : "Balance: --"
          }
          placeholder="0.00"
          actionLabel="MAX"
          onAction={() => {
            if (!fromToken) return;
            setAmount(deterministicBalance(fromToken.symbol));
          }}
          stackLevel={30}
          min={0}
          excludeSymbol={toSymbol}
        />

        <div className="flex justify-center">
          <button
            type="button"
            onClick={handleSwitch}
            className="rounded-2xl border border-white/10 bg-white/5 p-3 text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!fromToken || !toToken}
            aria-label="Switch tokens"
          >
            <FontAwesomeIcon icon={faUpDown} className="h-4 w-4" />
          </button>
        </div>

        <TokenField
          label="You receive"
          amount={quoteAmount ? formatInputValue(quoteAmount) : ""}
          token={toToken}
          tokens={tokens}
          disabled={status !== "ready"}
          onSelectToken={setToSymbol}
          helperLabel={
            quoteAmount && toToken
              ? `≈ ${formatFiat(quoteAmount * toToken.price, 2)}`
              : "Waiting for price"
          }
          balanceLabel={
            toToken && quoteAmount
              ? `Est. payout: ${formatToken(quoteAmount, 4)} ${toToken.symbol}`
              : ""
          }
          readOnly
          placeholder="0.00"
          stackLevel={20}
          excludeSymbol={fromSymbol}
        />
      </div>

      <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm text-white/70">
        <Row
          label="Exchange rate"
          value={
            fromToken && toToken
              ? `1 ${fromToken.symbol} ≈ ${formatToken(conversionRate || 0, 6)} ${toToken.symbol}`
              : "--"
          }
        />
        <Row
          label="Notional value"
          value={
            fromToken && amountValue
              ? formatFiat(amountValue * fromToken.price, 2)
              : "--"
          }
        />
        <Row label="Last update" value={lastUpdatedLabel} />
      </div>

      <div className="mt-3 flex items-center justify-center gap-3 text-xs text-white/70">
        <span>Refresh in {countdown}s</span>
        <button
          type="button"
          onClick={handleManualRefresh}
          disabled={manualRefreshing}
          className="rounded-full border border-white/10 p-1.5 text-white transition hover:border-mint/60 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Refresh prices"
        >
          <FontAwesomeIcon
            icon={faArrowsRotate}
            className={`h-4 w-4 ${manualRefreshing ? "animate-spin" : ""}`}
          />
        </button>
      </div>

      {exceedsBalance ? (
        <p className="mt-3 rounded-2xl border border-amber-500/30 bg-amber-500/15 px-4 py-2 text-sm text-amber-50">
          Amount exceeds your available balance.
        </p>
      ) : null}

      {errorMessage ? (
        <p className="mt-4 rounded-2xl border border-amber-500/30 bg-amber-500/15 px-4 py-3 text-sm text-amber-50">
          {errorMessage}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isSwapDisabled}
        className="group relative mt-6 inline-flex w-full items-center justify-center overflow-hidden rounded-2xl border border-white/10 px-5 py-4 text-base font-semibold text-midnight shadow-[0_12px_30px_rgba(91,141,239,0.35)] transition disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span className="absolute inset-0 bg-gradient-to-r from-brand via-[#6FD6FF] to-mint opacity-95 transition duration-200 group-hover:brightness-110" />
        <span className="relative flex items-center gap-2">
          {swapLabel}
        </span>
      </button>

      {toastMessage && (
        <div className="pointer-events-none absolute left-1/2 -top-6 flex w-[calc(100%-3rem)] -translate-x-1/2 items-center gap-3 rounded-3xl border border-mint/40 bg-mint/90 px-4 py-3 text-sm font-semibold text-midnight shadow-2xl">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            className="h-5 w-5 text-midnight"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M5 13l4 4L19 7" />
          </svg>
          {toastMessage}
        </div>
      )}
    </form>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1 text-white">
      <span className="text-white/60">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}
