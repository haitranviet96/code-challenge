import { useState } from "react";
import type { TokenOption } from "../types";

type Props = {
  token?: TokenOption;
  size?: "default" | "sm";
};

export function TokenAvatar({ token, size = "default" }: Props) {
  const [errored, setErrored] = useState(false);
  const dimension = size === "default" ? "h-11 w-11" : "h-9 w-9";

  return (
    <div className={`flex-shrink-0 ${dimension} rounded-full`}>
      {token && !errored ? (
        <img
          src={token.iconUrl}
          alt={token.symbol}
          className="h-full w-full rounded-full object-contain"
          onError={() => setErrored(true)}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center rounded-full bg-white/10 text-xs font-semibold uppercase text-white/70">
          {token?.symbol.slice(0, 3) ?? "?"}
        </div>
      )}
    </div>
  );
}
