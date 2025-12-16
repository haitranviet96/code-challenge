export const deterministicBalance = (symbol?: string) => {
  if (!symbol) return "0.00";
  const seed = symbol
    .split("")
    .reduce((acc, char, idx) => acc + char.charCodeAt(0) * (idx + 1), 0);
  return (10 + (seed % 240)).toFixed(2);
};

