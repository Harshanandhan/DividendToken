# DividendToken (DTK)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.24-blue.svg)](https://soliditylang.org/)
[![Hardhat](https://img.shields.io/badge/Built%20with-Hardhat-yellow.svg)](https://hardhat.org/)

A gas-optimized, mintable ERC-20 token with ETH dividend distribution and staking capabilities. Built for DeFi applications and Web3 gaming platforms.

## Features

- **🪙 Minting**: Deposit ETH to mint DTK tokens (1 ETH = 1000 DTK)
- **🔥 Burning**: Burn DTK to redeem proportional ETH from the contract's reserve
- **💰 Dividend Distribution**: Gas-efficient pull-based dividend system for token holders
- **🔒 Staking**: Lock tokens to earn additional ETH rewards over time
- **🛡️ Security**: Built with OpenZeppelin contracts, reentrancy protection, and access control

## Technical Highlights

### Gas-Optimized Dividend Distribution
Uses a **magnified dividend per share** approach that eliminates the need to loop through holders:
- O(1) complexity for distributions regardless of holder count
- Pull-based claiming reduces gas costs
- Automatic tracking through token transfers

### Security Features
- OpenZeppelin's battle-tested ERC20 implementation
- ReentrancyGuard on all external state-changing functions
- Ownable access control for admin functions
- No external calls before state changes (checks-effects-interactions pattern)

## Quick Start

### Prerequisites
- Node.js v18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/Nandhanreddyy/DividendToken.git
cd DividendToken

# Install dependencies
npm install

# Compile contracts
npx hardhat compile

# Run tests
npx hardhat test

# Run tests with gas reporting
REPORT_GAS=true npx hardhat test
```

### Deploy to Local Network

```bash
# Start local Hardhat node
npx hardhat node

# Deploy (in another terminal)
npx hardhat ignition deploy ./ignition/modules/DividendToken.js --network localhost
```

### Deploy to Sepolia Testnet

1. Create a `.env` file:
```
ALCHEMY_API_KEY=your_alchemy_key
PRIVATE_KEY=your_wallet_private_key
ETHERSCAN_API_KEY=your_etherscan_key
```

2. Uncomment the Sepolia network config in `hardhat.config.js`

3. Deploy:
```bash
npx hardhat ignition deploy ./ignition/modules/DividendToken.js --network sepolia
```

## Contract Interface

### Minting & Burning

```solidity
// Mint tokens by sending ETH
function mint() external payable;

// Burn tokens to redeem ETH
function burn(uint256 amount) external;
```

### Dividends

```solidity
// Owner distributes dividends
function distributeDividends() external payable;

// Users claim their dividends
function withdrawDividends() external;

// Check withdrawable dividends
function withdrawableDividendOf(address account) public view returns (uint256);
```

### Staking

```solidity
// Stake tokens (requires approval first)
function stake(uint256 amount) external;

// Unstake and claim rewards
function unstake() external;

// Check pending rewards
function calculateStakingRewards(address account) public view returns (uint256);
```

## Architecture

```
contracts/
├── DividendToken.sol    # Main contract with all features

test/
├── DividendToken.test.js # Comprehensive test suite

scripts/
├── deploy.js            # Deployment script

ignition/modules/
├── DividendToken.js     # Hardhat Ignition module
```

## How Dividends Work

The contract uses a **magnified dividend per share** mechanism:

1. When dividends are distributed, `magnifiedDividendPerShare` increases
2. Each account has a `magnifiedDividendCorrections` mapping to handle:
   - New mints (should not receive past dividends)
   - Burns (dividend rights are forfeited)
   - Transfers (dividend rights follow the tokens)
3. Withdrawable dividends = accumulated - already withdrawn

This approach is **O(1)** for all operations, making it suitable for tokens with many holders.

## Security Considerations

- All external functions that modify state have `nonReentrant` modifier
- ETH transfers use low-level `call` with success checking
- Owner functions are protected with `onlyOwner`
- No arithmetic overflow (Solidity 0.8+)

### Audit Status
This contract is for educational/demonstration purposes. Consider professional auditing before mainnet deployment.

## Tools & Technologies

- **Solidity 0.8.24** - Smart contract language
- **Hardhat** - Development environment
- **OpenZeppelin Contracts** - Secure base implementations
- **Ethers.js** - Ethereum library
- **Chai** - Testing framework

## Use Cases

- **DeFi Protocols**: Revenue sharing with token holders
- **Web3 Gaming**: In-game currency with dividend mechanics
- **DAOs**: Distribution of treasury yields to members
- **NFT Projects**: Token-based staking for NFT holders

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Author

**Harsha Nandhan Reddy** - [@Nandhanreddyy](https://x.com/Nandhanreddyy)

---

*Built as a portfolio project demonstrating Solidity development, smart contract security, and DeFi mechanics.*
