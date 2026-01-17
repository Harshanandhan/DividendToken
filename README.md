# 💰 DividendToken: Automated ETH Dividend Distribution

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Solidity](https://img.shields.io/badge/Solidity-^0.8.0-363636?logo=solidity)](https://soliditylang.org/)
[![Hardhat](https://img.shields.io/badge/Built%20with-Hardhat-yellow)](https://hardhat.org/)
[![OpenZeppelin](https://img.shields.io/badge/OpenZeppelin-4.0.0-4E5EE4?logo=openzeppelin)](https://openzeppelin.com/)

> A Solidity-based ERC-20 token smart contract that automatically distributes ETH dividends to token holders proportionally based on their holdings. Built with OpenZeppelin standards and Hardhat development environment for secure and transparent reward distribution.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [How It Works](#how-it-works)
- [Smart Contract Architecture](#smart-contract-architecture)
- [Installation](#installation)
- [Usage](#usage)
- [Contract Functions](#contract-functions)
- [Testing](#testing)
- [Deployment](#deployment)
- [Security](#security)
- [Gas Optimization](#gas-optimization)
- [Use Cases](#use-cases)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Overview

**DividendToken** is an innovative ERC-20 compliant smart contract that implements an automated dividend distribution system on the Ethereum blockchain. Token holders receive proportional ETH rewards based on their token balance, enabling passive income generation through cryptocurrency holdings.

### Why DividendToken?

- **Automated Rewards**: No manual distribution needed
- **Transparent**: All transactions visible on-chain
- **Gas Efficient**: Optimized for minimal transaction costs
- **Secure**: Built on battle-tested OpenZeppelin contracts
- **Fair Distribution**: Proportional to token ownership

---

## ✨ Key Features

### 🎁 Automated Dividend Distribution
- **Proportional Allocation**: Dividends distributed based on token ownership percentage
- **Real-time Tracking**: View pending dividends at any time
- **On-demand Withdrawals**: Claim your rewards whenever you want
- **Gas-Optimized**: Efficient calculation and distribution algorithm

### 🔒 Security & Standards
- **OpenZeppelin**: Built on audited ERC-20 implementation
- **Access Control**: Owner privileges for dividend deposits
- **Reentrancy Protection**: Safe withdrawal mechanisms
- **Overflow Protection**: Solidity 0.8+ built-in safeguards
- **Comprehensive Testing**: Full test coverage with Hardhat

### 💰 Dividend Mechanics
- Owner deposits ETH into the dividend pool
- Dividends automatically allocated to all token holders
- Token holders withdraw their proportional share anytime
- Transparent on-chain tracking of all distributions
- No lock-up periods or penalties

### 🛠️ Technical Stack
- **Solidity**: ^0.8.0
- **OpenZeppelin Contracts**: ERC-20, Ownable, ReentrancyGuard
- **Hardhat**: Development, testing, and deployment
- **Ethers.js**: Blockchain interactions
- **Chai**: Testing assertions
- **Solidity Coverage**: Code coverage analysis

---

## 🔄 How It Works

```
┌─────────────┐
│   Owner     │
│  (Company)  │
└──────┬──────┘
       │ 1. Deposits ETH
       ▼
┌─────────────────┐
│  DividendToken  │
│   Contract      │
│  ┌───────────┐  │
│  │ ETH Pool  │  │
│  └───────────┘  │
└────────┬────────┘
         │ 2. Calculates proportions
         ▼
┌────────────────────┐
│   Token Holders    │
│ ┌────┐ ┌────┐ ┌───┤
│ │ A  │ │ B  │ │ C ││
│ │30% │ │50% │ │20%││
│ └────┘ └────┘ └───┤
└────────┬───────────┘
         │ 3. Claims dividends
         ▼
    Individual Wallets
```

### Example Scenario:

1. **Token Distribution**: Alice has 300 tokens, Bob has 500, Carol has 200 (Total: 1000)
2. **Dividend Deposit**: Owner deposits 10 ETH
3. **Automatic Allocation**: 
   - Alice: 3 ETH (30%)
   - Bob: 5 ETH (50%)
   - Carol: 2 ETH (20%)
4. **Claiming**: Each holder calls `claimDividends()` to receive their ETH

---

## 🏗️ Smart Contract Architecture

```
DividendToken.sol (ERC-20)
│
├── Token Management
│   ├── mint() - Create new tokens (owner only)
│   ├── transfer() - Standard ERC-20 transfer
│   ├── transferFrom() - Approved transfers
│   └── balanceOf() - Check token balance
│
├── Dividend System
│   ├── depositDividends() - Owner deposits ETH
│   │   └── Updates global dividend pool
│   │
│   ├── claimDividends() - Users withdraw rewards
│   │   ├── Calculates proportional share
│   │   ├── Transfers ETH to user
│   │   └── Updates claimed amounts
│   │
│   ├── getDividends(address) - View pending rewards
│   │   └── Returns unclaimed dividend amount
│   │
│   └── Internal Tracking
│       ├── totalDividendsDistributed
│       ├── dividendsClaimed[address]
│       └── dividendsPerToken
│
└── Access Control & Security
    ├── onlyOwner modifier
    ├── nonReentrant modifier
    └── SafeMath (built-in 0.8+)
```

---

## 📦 Installation

### Prerequisites

- **Node.js**: v14.0.0 or higher
- **npm** or **yarn**: Latest version
- **Git**: For cloning the repository
- **MetaMask**: For deployment and testing

### Step 1: Clone the Repository

```bash
git clone https://github.com/Harshanandhan/DividendToken.git
cd DividendToken
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install:
- Hardhat
- OpenZeppelin Contracts
- Ethers.js
- Hardhat plugins (ethers, waffle)
- Testing libraries (chai, ethereum-waffle)

### Step 3: Configure Environment

Create a `.env` file in the root directory:

```env
# Network Configuration
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY
MAINNET_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_API_KEY

# Private Keys (DO NOT COMMIT)
PRIVATE_KEY=your_wallet_private_key_here

# Etherscan API (for verification)
ETHERSCAN_API_KEY=your_etherscan_api_key
```

⚠️ **Security Warning**: Never commit `.env` file to version control!

### Step 4: Compile Contracts

```bash
npx hardhat compile
```

Expected output:
```
Compiling 1 file with 0.8.20
Compilation finished successfully
```

---

## 🚀 Usage

### Basic Usage Example

```javascript
const { ethers } = require("hardhat");

async function main() {
  // Get signers
  const [owner, alice, bob] = await ethers.getSigners();
  
  // Deploy contract
  const DividendToken = await ethers.getContractFactory("DividendToken");
  const token = await DividendToken.deploy("DividendToken", "DIVT", 1000000);
  await token.deployed();
  
  console.log("Token deployed to:", token.address);
  
  // Distribute tokens
  await token.transfer(alice.address, 300);
  await token.transfer(bob.address, 700);
  
  // Deposit dividends (10 ETH)
  await token.depositDividends({ value: ethers.utils.parseEther("10") });
  
  // Alice claims her dividends (should get 3 ETH - 30%)
  await token.connect(alice).claimDividends();
  
  // Check Bob's pending dividends (should show 7 ETH - 70%)
  const bobDividends = await token.getDividends(bob.address);
  console.log("Bob's pending dividends:", ethers.utils.formatEther(bobDividends));
}

main();
```

### Frontend Integration (Web3.js)

```javascript
import Web3 from 'web3';
import DividendTokenABI from './DividendToken.json';

const web3 = new Web3(window.ethereum);
const contractAddress = "0x..."; // Your deployed contract
const contract = new web3.eth.Contract(DividendTokenABI, contractAddress);

// Get user's pending dividends
async function getPendingDividends(userAddress) {
  const dividends = await contract.methods.getDividends(userAddress).call();
  return web3.utils.fromWei(dividends, 'ether');
}

// Claim dividends
async function claimDividends(userAddress) {
  await contract.methods.claimDividends().send({ from: userAddress });
}

// Owner: Deposit dividends
async function depositDividends(amount, ownerAddress) {
  const amountInWei = web3.utils.toWei(amount, 'ether');
  await contract.methods.depositDividends().send({ 
    from: ownerAddress, 
    value: amountInWei 
  });
}
```

---

## 📖 Contract Functions

### 👑 Owner Functions

#### `depositDividends()`
Deposit ETH to be distributed as dividends to all token holders.

```solidity
function depositDividends() external payable onlyOwner
```

**Parameters**: None (ETH sent with transaction)
**Returns**: None
**Emits**: `DividendsDeposited(uint256 amount)`

**Example**:
```javascript
await contract.depositDividends({ value: ethers.utils.parseEther("100") });
```

---

#### `mint(address to, uint256 amount)`
Mint new tokens (if minting is enabled).

```solidity
function mint(address to, uint256 amount) external onlyOwner
```

**Parameters**:
- `to`: Recipient address
- `amount`: Number of tokens to mint

**Example**:
```javascript
await contract.mint(userAddress, ethers.utils.parseEther("1000"));
```

---

### 👥 User Functions

#### `claimDividends()`
Withdraw accumulated dividend rewards.

```solidity
function claimDividends() external nonReentrant
```

**Parameters**: None
**Returns**: None
**Emits**: `DividendsClaimed(address indexed user, uint256 amount)`

**Example**:
```javascript
await contract.claimDividends();
```

---

#### `getDividends(address account)`
View pending dividend amount for an address.

```solidity
function getDividends(address account) external view returns (uint256)
```

**Parameters**:
- `account`: Address to check

**Returns**: Amount of unclaimed dividends in Wei

**Example**:
```javascript
const pending = await contract.getDividends(userAddress);
console.log(ethers.utils.formatEther(pending)); // Convert to ETH
```

---

### 📊 Standard ERC-20 Functions

All standard ERC-20 functions are supported:

- `transfer(address to, uint256 amount)`
- `approve(address spender, uint256 amount)`
- `transferFrom(address from, address to, uint256 amount)`
- `balanceOf(address account)`
- `totalSupply()`
- `allowance(address owner, address spender)`

---

## 🧪 Testing

### Run All Tests

```bash
npx hardhat test
```

Expected output:
```
  DividendToken
    ✓ Should deploy with correct name and symbol
    ✓ Should mint initial supply to owner
    ✓ Should allow owner to deposit dividends
    ✓ Should calculate dividends correctly
    ✓ Should allow users to claim dividends
    ✓ Should prevent non-owners from depositing
    ✓ Should handle multiple dividend deposits
    ✓ Should update dividends after token transfers
    
  8 passing (2s)
```

### Run Specific Test File

```bash
npx hardhat test test/DividendToken.test.js
```

### Test Coverage

```bash
npx hardhat coverage
```

Coverage report:
```
-----------------------|----------|----------|----------|----------|
File                   |  % Stmts | % Branch |  % Funcs |  % Lines |
-----------------------|----------|----------|----------|----------|
 contracts/            |      100 |      100 |      100 |      100 |
  DividendToken.sol    |      100 |      100 |      100 |      100 |
-----------------------|----------|----------|----------|----------|
All files              |      100 |      100 |      100 |      100 |
-----------------------|----------|----------|----------|----------|
```

### Test Cases Covered

✅ **Token Deployment**
- Correct name, symbol, and decimals
- Initial supply minted to owner
- Owner permissions set correctly

✅ **Dividend Deposits**
- Owner can deposit ETH
- Non-owners cannot deposit
- Events emitted correctly
- Balance tracking accurate

✅ **Dividend Calculations**
- Proportional distribution accurate
- Multiple holders calculated correctly
- Handles decimal precision

✅ **Claiming Dividends**
- Users can claim their share
- ETH transferred correctly
- Cannot claim twice
- Reentrancy protection works

✅ **Edge Cases**
- Zero balance holders
- Token transfers update dividends
- Multiple deposit cycles
- Gas optimization scenarios

---

## 🚢 Deployment

### Local Deployment (Hardhat Network)

```bash
# Start local node
npx hardhat node

# In another terminal, deploy
npx hardhat run scripts/deploy.js --network localhost
```

---

### Testnet Deployment (Sepolia)

**Step 1**: Get test ETH from [Sepolia Faucet](https://sepoliafaucet.com/)

**Step 2**: Deploy to Sepolia

```bash
npx hardhat run scripts/deploy.js --network sepolia
```

**Step 3**: Verify contract on Etherscan

```bash
npx hardhat verify --network sepolia DEPLOYED_CONTRACT_ADDRESS "DividendToken" "DIVT" 1000000
```

---

### Mainnet Deployment

⚠️ **WARNING**: Mainnet deployment involves real funds. Ensure thorough testing!

```bash
# Deploy to mainnet
npx hardhat run scripts/deploy.js --network mainnet

# Verify on Etherscan
npx hardhat verify --network mainnet DEPLOYED_CONTRACT_ADDRESS "DividendToken" "DIVT" 1000000
```

---

### Deployment Script (`scripts/deploy.js`)

```javascript
const hre = require("hardhat");

async function main() {
  console.log("Deploying DividendToken...");
  
  const DividendToken = await hre.ethers.getContractFactory("DividendToken");
  const token = await DividendToken.deploy(
    "DividendToken",    // Token name
    "DIVT",             // Token symbol  
    1000000             // Initial supply
  );

  await token.deployed();

  console.log("DividendToken deployed to:", token.address);
  console.log("Transaction hash:", token.deployTransaction.hash);
  
  // Wait for confirmations
  await token.deployTransaction.wait(5);
  
  console.log("Waiting 60 seconds before verification...");
  await new Promise(resolve => setTimeout(resolve, 60000));
  
  // Verify on Etherscan
  await hre.run("verify:verify", {
    address: token.address,
    constructorArguments: ["DividendToken", "DIVT", 1000000],
  });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
```

---

## 🔐 Security

### Security Features Implemented

✅ **OpenZeppelin Contracts**: Battle-tested, audited implementations
✅ **Access Control**: `onlyOwner` modifier for sensitive functions
✅ **Reentrancy Guard**: Protection against reentrancy attacks
✅ **SafeMath**: Built-in overflow protection (Solidity 0.8+)
✅ **Input Validation**: Checks for zero addresses and amounts
✅ **Event Logging**: All important actions emit events

### Security Best Practices

🔒 **Before Mainnet Deployment**:
1. Professional security audit recommended
2. Bug bounty program consideration
3. Gradual rollout with limits
4. Emergency pause mechanism
5. Timelock for ownership changes

🔒 **Operational Security**:
- Use hardware wallet for owner account
- Multi-signature wallet for critical operations
- Regular monitoring of contract activity
- Incident response plan

### Known Limitations

⚠️ **Precision Loss**: Very small dividend amounts may have rounding errors
⚠️ **Gas Costs**: Claiming dividends costs gas (users pay)
⚠️ **No Automatic Reinvestment**: Manual claim required
⚠️ **Owner Dependency**: Dividends require owner deposits

---

## ⚡ Gas Optimization

### Optimization Techniques Used

✅ **Efficient Storage**: Minimized storage variables
✅ **Packed Variables**: Struct packing where possible  
✅ **Cached Values**: Reduce repeated SLOAD operations
✅ **Short-circuit Logic**: Optimize conditional checks
✅ **Events Over Storage**: Use events for historical data

### Gas Cost Estimates (at 30 gwei)

| Function | Gas Used | Cost (USD at $2000 ETH) |
|----------|----------|-------------------------|
| `transfer()` | ~50,000 | ~$3.00 |
| `depositDividends()` | ~75,000 | ~$4.50 |
| `claimDividends()` | ~65,000 | ~$3.90 |
| `getDividends()` | ~25,000 | ~$1.50 (view) |

---

## 💡 Use Cases

### 1. Investment DAOs
Distribute profits to DAO token holders automatically based on governance token ownership.

### 2. Revenue-Sharing Platforms
DeFi protocols can share platform fees with token holders transparently.

### 3. Tokenized Real Estate
Real estate tokens can distribute rental income to investors proportionally.

### 4. Company Shares
Blockchain-based company shares with automated dividend distribution.

### 5. Gaming Guilds
Distribute tournament winnings or in-game earnings to guild members.

### 6. NFT Royalty Distribution
Distribute NFT royalties to fractional owners or collection holders.

---

## 🗺️ Roadmap

### Phase 1: Core Features ✅
- [x] Basic ERC-20 implementation
- [x] Dividend distribution mechanism
- [x] Testing suite
- [x] Deployment scripts

### Phase 2: Enhanced Features 🚧
- [ ] Multi-token dividend support (pay in USDC, DAI, etc.)
- [ ] Automatic dividend reinvestment option
- [ ] Vesting schedules for minted tokens
- [ ] Governance voting mechanism

### Phase 3: Advanced Features 📋
- [ ] Time-weighted dividend calculation
- [ ] Dividend history and analytics dashboard
- [ ] Automated dividend scheduling (weekly/monthly)
- [ ] Cross-chain bridge support

### Phase 4: Ecosystem 🌟
- [ ] Frontend dApp interface
- [ ] Mobile app integration
- [ ] DAO governance framework
- [ ] Integration with DeFi protocols

---

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

### How to Contribute

1. **Fork the Repository**
```bash
git clone https://github.com/YourUsername/DividendToken.git
```

2. **Create a Feature Branch**
```bash
git checkout -b feature/AmazingFeature
```

3. **Make Changes**
- Write clean, documented code
- Follow Solidity style guide
- Add tests for new features

4. **Run Tests**
```bash
npx hardhat test
npx hardhat coverage
```

5. **Commit Changes**
```bash
git commit -m 'Add some AmazingFeature'
```

6. **Push to Branch**
```bash
git push origin feature/AmazingFeature
```

7. **Open Pull Request**
- Describe your changes
- Reference any related issues
- Ensure CI passes

### Development Guidelines

- Follow [Solidity Style Guide](https://docs.soliditylang.org/en/latest/style-guide.html)
- Write comprehensive tests
- Document all functions with NatSpec
- Keep gas costs minimal
- Security first approach

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2024 Harshanandhan

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction...
```

---

## 📞 Contact & Support

- **GitHub**: [@Harshanandhan](https://github.com/Harshanandhan)
- **Issues**: [Report Bug](https://github.com/Harshanandhan/DividendToken/issues)
- **Discussions**: [Join Discussion](https://github.com/Harshanandhan/DividendToken/discussions)
- **Email**: your.email@example.com

---

## 🙏 Acknowledgments

- **OpenZeppelin**: For secure smart contract libraries
- **Hardhat**: For excellent development environment
- **Ethereum Community**: For continuous innovation and support
- **Contributors**: Thanks to all who have contributed to this project

---

## ⚠️ Disclaimer

This smart contract is provided "as-is" without any warranties. Users should:
- Conduct their own security audits
- Test thoroughly before mainnet deployment
- Understand the risks of smart contracts
- Never invest more than you can afford to lose

The developers assume no liability for any losses incurred through use of this contract.

---

## 📊 Project Stats

![GitHub stars](https://img.shields.io/github/stars/Harshanandhan/DividendToken?style=social)
![GitHub forks](https://img.shields.io/github/forks/Harshanandhan/DividendToken?style=social)
![GitHub issues](https://img.shields.io/github/issues/Harshanandhan/DividendToken)
![GitHub pull requests](https://img.shields.io/github/issues-pr/Harshanandhan/DividendToken)

---

<div align="center">

Made with ❤️ by [Harshanandhan](https://github.com/Harshanandhan)

⭐ Star this repo if you find it helpful!

</div>
