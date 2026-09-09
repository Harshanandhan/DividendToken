# DividendToken

A Hardhat lab for a mintable ERC-20 where **holder dividends and staking compete for the same balance**.

Send ETH to `mint` (1 ETH = 1000 DTK). The owner can push extra ETH through `distributeDividends`; holders pull their share with `withdrawDividends`. `burn` returns a slice of the ETH reserve.

`stake` transfers tokens into the contract. Those tokens **stop earning holder dividends** until `unstake`. That is the point of the lab, not a DeFi product.

`ReentrancyGuard` on mint, burn, withdraw, stake, and unstake. `onlyOwner` on `distributeDividends` and `fundStakingRewards`.

This is a **lab contract**. Not an audit. Not a product. Not deployed to a public network in this run.

Author: **Harsha Nandhan Reddy Gajulapalli**  
Email: **harshanandhanreddy820@gmail.com**  
GitHub: [Harshanandhan](https://github.com/Harshanandhan)

![How this token works](images/architecture.png)

## Why this lab

Most ERC-20 dividend samples ignore locked balances. Here the accounting is explicit: dividends follow the token balance the contract sees. After staking 300 of 1000 DTK, a 0.7 ETH distribution pays the holder **0.49 ETH** (700/1000), not 0.7 ETH.

## Run

```bash
npm install
npx hardhat test
python render_images.py
```

## Evidence

Command (this machine, Hardhat local, Solidity 0.8.24):

```bash
npx hardhat test
```

**2026-09-09 — 33 passing, 0 failing, 534ms.**

![Hardhat test results](images/results-tests.png)

| Group | Tests | Result |
|---|---:|---|
| Deployment | 3 | pass |
| Minting | 5 | pass |
| Burning | 4 | pass |
| Dividend distribution | 8 | pass |
| Transfers and dividend tracking | 1 | pass |
| Staking | 5 | pass |
| View functions | 2 | pass |
| Edge cases | 3 | pass |
| Reentrancy guards still complete | 2 | pass |

The last two tests only check that `burn` and `withdrawDividends` finish under `ReentrancyGuard`. They are not an exploit suite and do not prove absence of bugs.

JSON: `results/tests.json`. Full log: `results/test-output.txt`.

No private key. No testnet or mainnet transaction. Lab framing only — staking vs holder dividends competing for the same balance.

## Layout

```
contracts/DividendToken.sol         mint / burn / dividends / stake
test/DividendToken.test.js          33 Hardhat tests
ignition/modules/DividendToken.js   local Hardhat Ignition module
results/                            log + JSON from the run above
images/                             diagrams from that JSON
render_images.py                    rebuilds the PNGs
```

## License

MIT. Copyright (c) 2026 Harsha Nandhan Reddy Gajulapalli.
