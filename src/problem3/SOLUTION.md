# Problem 3 Solution

## Issues & Anti-patterns

### 1) Shape/type mismatch
- `WalletBalance`/`FormattedWalletBalance` omit `blockchain` while the code reads `balance.blockchain`, forcing `any` or causing runtime failures.
- Fix: add `blockchain` to the interfaces so downstream code is typed and safe.
```diff
-interface WalletBalance { currency: string; amount: number; }
+interface WalletBalance { currency: string; amount: number; blockchain: Blockchain; }
```

### 2) Priority logic inefficiency
- `getPriority` takes `any`, is recreated every render, and re-runs inside `filter` and `sort`, adding overhead and losing type safety.
- Fix: use a typed constant map for priorities and reuse it.
```diff
-const getPriority = (blockchain: any) => { /* switch */ };
-balances.sort((a, b) => getPriority(a.blockchain) - getPriority(b.blockchain));
+const PRIORITY: Record<Blockchain, number> = { /* ... */ };
+balances.sort((a, b) => PRIORITY[b.blockchain] - PRIORITY[a.blockchain]);
```

### 3) Broken memo/filter/sort
- `useMemo` includes `prices` (unused) but not `getPriority`; it references undefined `lhsPriority`, which would throw.
- Filter keeps `amount <= 0` balances (likely inverted intent), so zero/negative amounts are shown.
- Fix: correct dependencies, remove the typo, and filter for positive amounts only.
```diff
-const sortedBalances = useMemo(() => balances
-  .filter((balance) => {
-    const balancePriority = getPriority(balance.blockchain);
-    if (lhsPriority > -99) { /* lhsPriority is undefined */ }
-    return balance.amount <= 0;
-  })
-  .sort(/* ... */)
-), [balances, prices]); // prices unused
+const sortedBalances = useMemo(() => balances
+  .filter((balance) => balance.amount > 0)
+  .sort((lhs, rhs) => PRIORITY[rhs.blockchain] - PRIORITY[lhs.blockchain])
+), [balances]);
```

### 4) Dropped formatted data flow
- `formattedBalances` is computed but never used; `rows` uses `sortedBalances` yet expects a `formatted` field that is not there, yielding `undefined`/type mismatch.
- Fix: render from the formatted list or add the field before mapping rows.
```diff
-const formattedBalances = sortedBalances.map((b) => ({ ...b, formatted: b.amount.toFixed() }));
-const rows = sortedBalances.map((balance) => (
-  <WalletRow formattedAmount={balance.formatted} />
-));
+const formattedBalances = sortedBalances.map((b) => ({ ...b, formatted: b.amount.toFixed(4) }));
+const rows = formattedBalances.map((balance) => (
+  <WalletRow formattedAmount={balance.formatted} />
+));
```

### 5) Number/price handling
- `toFixed()` without a precision truncates to integers and throws if `amount` is undefined; price lookup is unguarded, so `usdValue` can be `NaN`.
- Fix: provide precision and default/validate prices before multiplying.
```diff
-formatted: balance.amount.toFixed()
-const usdValue = prices[balance.currency] * balance.amount;
+formatted: balance.amount.toFixed(4)
+const price = prices[balance.currency] ?? 0;
+const usdValue = price * balance.amount;
```

### 6) List keys
- `key={index}` becomes unstable after sorting, risking React state bugs.
- Fix: use a deterministic key, e.g., `${blockchain}-${currency}`.
```diff
-sortedBalances.map((balance, index) => <WalletRow key={index} />);
+sortedBalances.map((balance) => (
+  <WalletRow key={`${balance.blockchain}-${balance.currency}`} />
+));
```

### 7) Noise/unused props
- `children` is destructured but unused; memoization offers no benefit with incorrect deps.
- Fix: drop unused props and avoid unnecessary memo unless profiling justifies it.
```diff
-const { children, ...rest } = props;
+const { ...rest } = props;
-const sortedBalances = useMemo(/* ... */, [balances, prices]);
+const sortedBalances = useMemo(/* ... */, [balances]);
```

## Refactored Code
See `src/problem3/WalletPage.refactored.tsx` for a cleaned, typed implementation that addresses the issues above (typed priority map, positive-balance filtering, correct memo deps, guarded price math, formatted amounts, and stable keys).
