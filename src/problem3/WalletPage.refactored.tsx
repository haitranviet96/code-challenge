import React, { useMemo } from 'react';

// Local replacement for BoxProps; adjust to your UI library if needed.
type BoxProps = React.HTMLAttributes<HTMLDivElement>;

type Blockchain = 'Osmosis' | 'Ethereum' | 'Arbitrum' | 'Zilliqa' | 'Neo';

interface WalletBalance {
  currency: string;
  amount: number;
  blockchain: Blockchain;
}

interface FormattedWalletBalance extends WalletBalance {
  formatted: string;
}

type Prices = Record<string, number | undefined>;

interface Props extends BoxProps {
  rowClassName?: string;
}

// External mock hooks/components are declared for typing
declare function useWalletBalances(): WalletBalance[];
declare function usePrices(): Prices;
declare const WalletRow: React.ComponentType<{
  className?: string;
  amount: number;
  usdValue: number;
  formattedAmount: string;
}>;

const BLOCKCHAIN_PRIORITY: Record<Blockchain, number> = {
  Osmosis: 100,
  Ethereum: 50,
  Arbitrum: 30,
  Zilliqa: 20,
  Neo: 20,
};

const WalletPage: React.FC<Props> = ({ rowClassName, ...rest }) => {
  const balances = useWalletBalances();
  const prices = usePrices();

  const formattedBalances = useMemo<FormattedWalletBalance[]>(() => {
    return balances
      .filter((balance) => balance.amount > 0)
      .sort(
        (lhs, rhs) =>
          (BLOCKCHAIN_PRIORITY[rhs.blockchain] ?? -Infinity) -
          (BLOCKCHAIN_PRIORITY[lhs.blockchain] ?? -Infinity)
      )
      .map((balance) => ({
        ...balance,
        formatted: balance.amount.toFixed(4),
      }));
  }, [balances]);

  return (
    <div {...rest}>
      {formattedBalances.map((balance) => {
        const usdValue = (prices[balance.currency] ?? 0) * balance.amount;

        return (
          <WalletRow
            key={`${balance.blockchain}-${balance.currency}`}
            className={rowClassName}
            amount={balance.amount}
            usdValue={usdValue}
            formattedAmount={balance.formatted}
          />
        );
      })}
    </div>
  );
};

export default WalletPage;
