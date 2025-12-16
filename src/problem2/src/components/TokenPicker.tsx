import { useEffect, useMemo, useRef, useState } from "react";
import type { TokenOption } from "../types";
import { TokenAvatar } from "./TokenAvatar";
import { formatFiat } from "../utils/format";

type TokenPickerProps = {
  token?: TokenOption;
  tokens: TokenOption[];
  onSelectToken: (symbol: string | null) => void;
  disabled?: boolean;
  excludeSymbol?: string | null;
};

export function TokenPicker({
  token,
  tokens,
  onSelectToken,
  disabled,
  excludeSymbol,
}: TokenPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const listener = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", listener);
    return () => document.removeEventListener("mousedown", listener);
  }, [open]);

  const filteredTokens = useMemo(() => {
    const query = search.toLowerCase().trim();
    const list = excludeSymbol
      ? tokens.filter((item) => item.symbol !== excludeSymbol)
      : tokens;
    if (!query) return list;
    return list.filter((item) => item.symbol.toLowerCase().includes(query));
  }, [tokens, search, excludeSymbol]);

  return (
    <div
      className="relative z-30 w-40 flex-shrink-0 sm:w-48"
      ref={containerRef}
    >
      <button
        type="button"
        className="flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
        onClick={() => setOpen((prev) => !prev)}
        disabled={disabled || tokens.length === 0}
      >
        <TokenAvatar token={token} />
        <div className="text-left">
          <p className="text-base font-semibold">
            {token ? token.symbol : "Select"}
          </p>
          <p className="text-xs text-white/50">
            {token ? formatFiat(token.price, 4) : "Choose market"}
          </p>
        </div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          className={`ml-auto h-4 w-4 text-white/60 transition ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {open && (
        <div className="absolute left-0 right-0 top-full z-50 mt-3 w-full rounded-3xl border border-white/10 bg-[#120b20]/95 p-3 shadow-2xl backdrop-blur">
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search"
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-brand/40"
          />
          <div className="token-scroll mt-3 max-h-56 space-y-1 overflow-y-auto pr-1">
            {filteredTokens.length === 0 ? (
              <p className="py-6 text-center text-sm text-white/40">No results</p>
            ) : (
              filteredTokens.map((item) => (
                <button
                  type="button"
                  key={item.symbol}
                  className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-left text-sm ${
                    item.symbol === token?.symbol
                      ? "bg-white/10 text-white"
                      : "hover:bg-white/5"
                  }`}
                  onClick={() => {
                    onSelectToken(item.symbol);
                    setOpen(false);
                    setSearch("");
                  }}
                >
                  <TokenAvatar token={item} size="sm" />
                  <div className="flex-1">
                    <p className="font-semibold">{item.symbol}</p>
                    <p className="text-xs text-white/40">
                      {formatFiat(item.price, 4)}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
