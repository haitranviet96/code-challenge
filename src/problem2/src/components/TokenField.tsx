import type { TokenOption } from "../types";
import { TokenPicker } from "./TokenPicker";

type TokenFieldProps = {
  label: string;
  amount: string;
  token?: TokenOption;
  tokens: TokenOption[];
  onAmountChange?: (value: string) => void;
  onSelectToken: (symbol: string | null) => void;
  placeholder?: string;
  helperLabel?: string;
  balanceLabel?: string;
  disabled?: boolean;
  readOnly?: boolean;
  actionLabel?: string;
  onAction?: () => void;
  stackLevel?: number;
  min?: number;
  excludeSymbol?: string | null;
};

export function TokenField({
  label,
  amount,
  token,
  tokens,
  onAmountChange,
  onSelectToken,
  placeholder,
  helperLabel,
  balanceLabel,
  disabled,
  readOnly,
  actionLabel,
  onAction,
  stackLevel = 10,
  min,
  excludeSymbol,
}: TokenFieldProps) {
  const helperText = helperLabel ?? " ";
  return (
    <div
      className="glass-panel relative rounded-3xl border border-white/10 p-5"
      style={{ zIndex: stackLevel }}
    >
      <div className="flex items-center justify-between text-xs text-white/60">
        <span>{label}</span>
        <div className="flex items-center gap-3">
          {balanceLabel ? <span>{balanceLabel}</span> : null}
          {actionLabel && onAction ? (
            <button
              type="button"
              className="text-[0.6rem] font-semibold uppercase tracking-[0.25em] text-mint hover:text-white"
              onClick={onAction}
            >
              {actionLabel}
            </button>
          ) : null}
        </div>
      </div>
      <div className="mt-6 flex items-end gap-4">
        <div className="min-w-0 flex-1">
          <input
            type="number"
            inputMode="decimal"
            readOnly={readOnly}
            disabled={disabled}
            value={amount}
            onChange={(event) => onAmountChange?.(event.target.value)}
            min={min}
            placeholder={placeholder}
            className="w-full bg-transparent text-4xl font-semibold tracking-tight text-white placeholder:text-white/25 focus:outline-none disabled:text-white/40"
          />
          <p className="mt-2 text-xs text-white/50">{helperText}</p>
        </div>
        <TokenPicker
          token={token}
          tokens={tokens}
          onSelectToken={onSelectToken}
          disabled={disabled}
          excludeSymbol={excludeSymbol}
        />
      </div>
    </div>
  );
}
