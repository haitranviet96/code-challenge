export const formatFiat = (value: number, maximumFractionDigits = 2) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits,
  }).format(value);

export const formatToken = (value: number, maximumFractionDigits = 6) =>
  new Intl.NumberFormat("en-US", {
    maximumFractionDigits,
  }).format(value);

export const formatInputValue = (value: number) => {
  if (!Number.isFinite(value)) return "";
  const normalized = value.toFixed(6).replace(/\.?0+$/, "");
  return normalized.length ? normalized : "0";
};

