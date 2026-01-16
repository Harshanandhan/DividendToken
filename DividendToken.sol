// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title DividendToken
 * @dev A mintable ERC-20 token with ETH dividend distribution and staking
 * 
 * Features:
 * - Mint tokens by depositing ETH (1 ETH = 1000 DTK)
 * - Burn tokens to redeem proportional ETH
 * - Stake tokens to earn ETH dividends
 * - Gas-optimized dividend distribution using a pull mechanism
 * 
 * @author Harsha Nandhan Reddy (@Nandhanreddyy)
 */
contract DividendToken is ERC20, Ownable, ReentrancyGuard {
    // ============ Constants ============
    uint256 public constant TOKENS_PER_ETH = 1000;
    uint256 public constant MAGNITUDE = 2 ** 128;
    
    // ============ State Variables ============
    
    // Dividend tracking (gas-optimized using magnified dividends per share)
    uint256 public magnifiedDividendPerShare;
    mapping(address => int256) public magnifiedDividendCorrections;
    mapping(address => uint256) public withdrawnDividends;
    
    // Staking
    mapping(address => uint256) public stakedBalance;
    mapping(address => uint256) public stakeTimestamp;
    uint256 public totalStaked;
    uint256 public stakingRewardPool;
    
    // Tracking
    uint256 public totalDividendsDistributed;
    uint256 public reserveBalance; // ETH backing the minted tokens
    
    // ============ Events ============
    event TokensMinted(address indexed user, uint256 ethAmount, uint256 tokenAmount);
    event TokensBurned(address indexed user, uint256 tokenAmount, uint256 ethAmount);
    event DividendsDistributed(address indexed from, uint256 amount);
    event DividendWithdrawn(address indexed user, uint256 amount);
    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount);
    event StakingRewardsClaimed(address indexed user, uint256 amount);
    
    // ============ Constructor ============
    constructor() ERC20("DividendToken", "DTK") Ownable(msg.sender) {}
    
    // ============ Minting & Burning ============
    
    /**
     * @dev Mint tokens by sending ETH. Rate: 1 ETH = 1000 DTK
     */
    function mint() external payable nonReentrant {
        require(msg.value > 0, "Must send ETH to mint");
        
        uint256 tokensToMint = msg.value * TOKENS_PER_ETH;
        reserveBalance += msg.value;
        
        _mint(msg.sender, tokensToMint);
        
        // Correct dividend tracking for new tokens
        magnifiedDividendCorrections[msg.sender] -= int256(magnifiedDividendPerShare * tokensToMint);
        
        emit TokensMinted(msg.sender, msg.value, tokensToMint);
    }
    
    /**
     * @dev Burn tokens to redeem proportional ETH from reserves
     * @param amount Number of tokens to burn
     */
    function burn(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be greater than 0");
        require(balanceOf(msg.sender) >= amount, "Insufficient balance");
        
        // Calculate ETH to return (proportional to reserve)
        uint256 ethToReturn = (amount * reserveBalance) / totalSupply();
        require(ethToReturn > 0, "ETH amount too small");
        require(address(this).balance >= ethToReturn, "Insufficient contract balance");
        
        reserveBalance -= ethToReturn;
        
        // Correct dividend tracking before burning
        magnifiedDividendCorrections[msg.sender] += int256(magnifiedDividendPerShare * amount);
        
        _burn(msg.sender, amount);
        
        // Transfer ETH back to user
        (bool success, ) = payable(msg.sender).call{value: ethToReturn}("");
        require(success, "ETH transfer failed");
        
        emit TokensBurned(msg.sender, amount, ethToReturn);
    }
    
    // ============ Dividend Distribution ============
    
    /**
     * @dev Distribute ETH dividends to all token holders
     * Uses a gas-optimized pull mechanism - no loops required
     */
    function distributeDividends() external payable onlyOwner {
        require(msg.value > 0, "Must send ETH to distribute");
        require(totalSupply() > 0, "No tokens minted yet");
        
        magnifiedDividendPerShare += (msg.value * MAGNITUDE) / totalSupply();
        totalDividendsDistributed += msg.value;
        
        emit DividendsDistributed(msg.sender, msg.value);
    }
    
    /**
     * @dev Withdraw accumulated dividends
     */
    function withdrawDividends() external nonReentrant {
        uint256 withdrawable = withdrawableDividendOf(msg.sender);
        require(withdrawable > 0, "No dividends to withdraw");
        
        withdrawnDividends[msg.sender] += withdrawable;
        
        (bool success, ) = payable(msg.sender).call{value: withdrawable}("");
        require(success, "ETH transfer failed");
        
        emit DividendWithdrawn(msg.sender, withdrawable);
    }
    
    /**
     * @dev Calculate withdrawable dividends for an address
     */
    function withdrawableDividendOf(address account) public view returns (uint256) {
        return accumulativeDividendOf(account) - withdrawnDividends[account];
    }
    
    /**
     * @dev Calculate total accumulated dividends for an address
     */
    function accumulativeDividendOf(address account) public view returns (uint256) {
        int256 magnifiedDividends = int256(magnifiedDividendPerShare * balanceOf(account));
        int256 correctedDividends = magnifiedDividends + magnifiedDividendCorrections[account];
        
        // Ensure non-negative (can happen due to rounding)
        if (correctedDividends < 0) {
            return 0;
        }
        
        return uint256(correctedDividends) / MAGNITUDE;
    }
    
    // ============ Staking ============
    
    /**
     * @dev Stake tokens to earn additional rewards
     * @param amount Number of tokens to stake
     */
    function stake(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be greater than 0");
        require(balanceOf(msg.sender) >= amount, "Insufficient balance");
        
        // Transfer tokens to contract (user must approve first)
        _transfer(msg.sender, address(this), amount);
        
        stakedBalance[msg.sender] += amount;
        stakeTimestamp[msg.sender] = block.timestamp;
        totalStaked += amount;
        
        emit Staked(msg.sender, amount);
    }
    
    /**
     * @dev Unstake tokens and claim any pending rewards
     */
    function unstake() external nonReentrant {
        uint256 staked = stakedBalance[msg.sender];
        require(staked > 0, "No tokens staked");
        
        // Calculate and distribute rewards first
        uint256 rewards = calculateStakingRewards(msg.sender);
        
        stakedBalance[msg.sender] = 0;
        stakeTimestamp[msg.sender] = 0;
        totalStaked -= staked;
        
        // Return staked tokens
        _transfer(address(this), msg.sender, staked);
        
        // Send rewards if available
        if (rewards > 0 && stakingRewardPool >= rewards) {
            stakingRewardPool -= rewards;
            (bool success, ) = payable(msg.sender).call{value: rewards}("");
            require(success, "Reward transfer failed");
            emit StakingRewardsClaimed(msg.sender, rewards);
        }
        
        emit Unstaked(msg.sender, staked);
    }
    
    /**
     * @dev Add ETH to the staking reward pool
     */
    function fundStakingRewards() external payable onlyOwner {
        require(msg.value > 0, "Must send ETH");
        stakingRewardPool += msg.value;
    }
    
    /**
     * @dev Calculate staking rewards based on time staked and amount
     * Simplified model: 0.01% per day of staked amount (capped by pool)
     */
    function calculateStakingRewards(address account) public view returns (uint256) {
        uint256 staked = stakedBalance[account];
        if (staked == 0) return 0;
        
        uint256 stakingDuration = block.timestamp - stakeTimestamp[account];
        uint256 daysStaked = stakingDuration / 1 days;
        
        // 0.01% per day = 1 basis point = staked * days / 10000
        uint256 rewards = (staked * daysStaked) / 10000;
        
        // Cap rewards to available pool
        return rewards > stakingRewardPool ? stakingRewardPool : rewards;
    }
    
    // ============ Override Transfer for Dividend Tracking ============
    
    function _update(address from, address to, uint256 value) internal override {
        super._update(from, to, value);
        
        // Update dividend corrections on transfer
        if (from != address(0) && to != address(0)) {
            int256 correction = int256(magnifiedDividendPerShare * value);
            magnifiedDividendCorrections[from] += correction;
            magnifiedDividendCorrections[to] -= correction;
        }
    }
    
    // ============ View Functions ============
    
    /**
     * @dev Get complete account info
     */
    function getAccountInfo(address account) external view returns (
        uint256 tokenBalance,
        uint256 staked,
        uint256 withdrawableDividends,
        uint256 totalDividendsEarned,
        uint256 pendingStakingRewards
    ) {
        return (
            balanceOf(account),
            stakedBalance[account],
            withdrawableDividendOf(account),
            accumulativeDividendOf(account),
            calculateStakingRewards(account)
        );
    }
    
    /**
     * @dev Get contract stats
     */
    function getContractStats() external view returns (
        uint256 _totalSupply,
        uint256 _totalStaked,
        uint256 _reserveBalance,
        uint256 _stakingRewardPool,
        uint256 _totalDividendsDistributed
    ) {
        return (
            totalSupply(),
            totalStaked,
            reserveBalance,
            stakingRewardPool,
            totalDividendsDistributed
        );
    }
    
    // ============ Receive ETH ============
    receive() external payable {
        // Accept ETH for dividends or rewards
    }
}
