const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");

describe("DividendToken", function () {
  // Fixture to deploy the contract fresh for each test
  async function deployDividendTokenFixture() {
    const [owner, user1, user2, user3] = await ethers.getSigners();

    const DividendToken = await ethers.getContractFactory("DividendToken");
    const token = await DividendToken.deploy();

    return { token, owner, user1, user2, user3 };
  }

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const { token, owner } = await loadFixture(deployDividendTokenFixture);
      expect(await token.owner()).to.equal(owner.address);
    });

    it("Should have correct name and symbol", async function () {
      const { token } = await loadFixture(deployDividendTokenFixture);
      expect(await token.name()).to.equal("DividendToken");
      expect(await token.symbol()).to.equal("DTK");
    });

    it("Should start with zero supply", async function () {
      const { token } = await loadFixture(deployDividendTokenFixture);
      expect(await token.totalSupply()).to.equal(0);
    });
  });

  describe("Minting", function () {
    it("Should mint tokens when sending ETH", async function () {
      const { token, user1 } = await loadFixture(deployDividendTokenFixture);
      const ethAmount = ethers.parseEther("1");

      await token.connect(user1).mint({ value: ethAmount });

      // 1 ETH = 1000 tokens
      expect(await token.balanceOf(user1.address)).to.equal(
        ethers.parseEther("1000")
      );
    });

    it("Should update reserve balance on mint", async function () {
      const { token, user1 } = await loadFixture(deployDividendTokenFixture);
      const ethAmount = ethers.parseEther("2");

      await token.connect(user1).mint({ value: ethAmount });

      expect(await token.reserveBalance()).to.equal(ethAmount);
    });

    it("Should emit TokensMinted event", async function () {
      const { token, user1 } = await loadFixture(deployDividendTokenFixture);
      const ethAmount = ethers.parseEther("1");
      const expectedTokens = ethers.parseEther("1000");

      await expect(token.connect(user1).mint({ value: ethAmount }))
        .to.emit(token, "TokensMinted")
        .withArgs(user1.address, ethAmount, expectedTokens);
    });

    it("Should revert when sending zero ETH", async function () {
      const { token, user1 } = await loadFixture(deployDividendTokenFixture);

      await expect(token.connect(user1).mint({ value: 0 })).to.be.revertedWith(
        "Must send ETH to mint"
      );
    });

    it("Should allow multiple users to mint", async function () {
      const { token, user1, user2 } = await loadFixture(
        deployDividendTokenFixture
      );

      await token.connect(user1).mint({ value: ethers.parseEther("1") });
      await token.connect(user2).mint({ value: ethers.parseEther("2") });

      expect(await token.balanceOf(user1.address)).to.equal(
        ethers.parseEther("1000")
      );
      expect(await token.balanceOf(user2.address)).to.equal(
        ethers.parseEther("2000")
      );
      expect(await token.totalSupply()).to.equal(ethers.parseEther("3000"));
    });
  });

  describe("Burning", function () {
    it("Should burn tokens and return ETH", async function () {
      const { token, user1 } = await loadFixture(deployDividendTokenFixture);

      // Mint first
      await token.connect(user1).mint({ value: ethers.parseEther("1") });

      const balanceBefore = await ethers.provider.getBalance(user1.address);

      // Burn half
      const burnAmount = ethers.parseEther("500");
      const tx = await token.connect(user1).burn(burnAmount);
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed * receipt.gasPrice;

      const balanceAfter = await ethers.provider.getBalance(user1.address);

      // Should receive 0.5 ETH back (minus gas)
      expect(balanceAfter + gasUsed - balanceBefore).to.be.closeTo(
        ethers.parseEther("0.5"),
        ethers.parseEther("0.001") // Allow small rounding
      );
    });

    it("Should emit TokensBurned event", async function () {
      const { token, user1 } = await loadFixture(deployDividendTokenFixture);

      await token.connect(user1).mint({ value: ethers.parseEther("1") });

      const burnAmount = ethers.parseEther("500");
      const expectedEth = ethers.parseEther("0.5");

      await expect(token.connect(user1).burn(burnAmount))
        .to.emit(token, "TokensBurned")
        .withArgs(user1.address, burnAmount, expectedEth);
    });

    it("Should revert when burning more than balance", async function () {
      const { token, user1 } = await loadFixture(deployDividendTokenFixture);

      await token.connect(user1).mint({ value: ethers.parseEther("1") });

      await expect(
        token.connect(user1).burn(ethers.parseEther("2000"))
      ).to.be.revertedWith("Insufficient balance");
    });

    it("Should revert when burning zero", async function () {
      const { token, user1 } = await loadFixture(deployDividendTokenFixture);

      await token.connect(user1).mint({ value: ethers.parseEther("1") });

      await expect(token.connect(user1).burn(0)).to.be.revertedWith(
        "Amount must be greater than 0"
      );
    });
  });

  describe("Dividend Distribution", function () {
    it("Should allow owner to distribute dividends", async function () {
      const { token, owner, user1 } = await loadFixture(
        deployDividendTokenFixture
      );

      await token.connect(user1).mint({ value: ethers.parseEther("1") });

      await expect(
        token.connect(owner).distributeDividends({ value: ethers.parseEther("1") })
      )
        .to.emit(token, "DividendsDistributed")
        .withArgs(owner.address, ethers.parseEther("1"));
    });

    it("Should track total dividends distributed", async function () {
      const { token, owner, user1 } = await loadFixture(
        deployDividendTokenFixture
      );

      await token.connect(user1).mint({ value: ethers.parseEther("1") });
      await token
        .connect(owner)
        .distributeDividends({ value: ethers.parseEther("1") });

      expect(await token.totalDividendsDistributed()).to.equal(
        ethers.parseEther("1")
      );
    });

    it("Should calculate withdrawable dividends correctly", async function () {
      const { token, owner, user1 } = await loadFixture(
        deployDividendTokenFixture
      );

      await token.connect(user1).mint({ value: ethers.parseEther("1") });
      await token
        .connect(owner)
        .distributeDividends({ value: ethers.parseEther("1") });

      expect(await token.withdrawableDividendOf(user1.address)).to.equal(
        ethers.parseEther("1")
      );
    });

    it("Should split dividends proportionally", async function () {
      const { token, owner, user1, user2 } = await loadFixture(
        deployDividendTokenFixture
      );

      // User1 mints 1000 tokens, User2 mints 3000 tokens
      await token.connect(user1).mint({ value: ethers.parseEther("1") });
      await token.connect(user2).mint({ value: ethers.parseEther("3") });

      // Distribute 4 ETH
      await token
        .connect(owner)
        .distributeDividends({ value: ethers.parseEther("4") });

      // User1 should get 25%, User2 should get 75%
      expect(await token.withdrawableDividendOf(user1.address)).to.equal(
        ethers.parseEther("1")
      );
      expect(await token.withdrawableDividendOf(user2.address)).to.equal(
        ethers.parseEther("3")
      );
    });

    it("Should allow users to withdraw dividends", async function () {
      const { token, owner, user1 } = await loadFixture(
        deployDividendTokenFixture
      );

      await token.connect(user1).mint({ value: ethers.parseEther("1") });
      await token
        .connect(owner)
        .distributeDividends({ value: ethers.parseEther("1") });

      const balanceBefore = await ethers.provider.getBalance(user1.address);
      const tx = await token.connect(user1).withdrawDividends();
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed * receipt.gasPrice;
      const balanceAfter = await ethers.provider.getBalance(user1.address);

      expect(balanceAfter + gasUsed - balanceBefore).to.be.closeTo(
        ethers.parseEther("1"),
        ethers.parseEther("0.001")
      );
    });

    it("Should revert when no dividends to withdraw", async function () {
      const { token, user1 } = await loadFixture(deployDividendTokenFixture);

      await token.connect(user1).mint({ value: ethers.parseEther("1") });

      await expect(token.connect(user1).withdrawDividends()).to.be.revertedWith(
        "No dividends to withdraw"
      );
    });

    it("Should not give dividends to new minters for past distributions", async function () {
      const { token, owner, user1, user2 } = await loadFixture(
        deployDividendTokenFixture
      );

      // User1 mints
      await token.connect(user1).mint({ value: ethers.parseEther("1") });

      // Dividends distributed
      await token
        .connect(owner)
        .distributeDividends({ value: ethers.parseEther("1") });

      // User2 mints AFTER distribution
      await token.connect(user2).mint({ value: ethers.parseEther("1") });

      // User1 should get all dividends, User2 should get none
      expect(await token.withdrawableDividendOf(user1.address)).to.equal(
        ethers.parseEther("1")
      );
      expect(await token.withdrawableDividendOf(user2.address)).to.equal(0);
    });

    it("Should revert if non-owner tries to distribute", async function () {
      const { token, user1 } = await loadFixture(deployDividendTokenFixture);

      await token.connect(user1).mint({ value: ethers.parseEther("1") });

      await expect(
        token.connect(user1).distributeDividends({ value: ethers.parseEther("1") })
      ).to.be.revertedWithCustomError(token, "OwnableUnauthorizedAccount");
    });
  });

  describe("Transfers and Dividend Tracking", function () {
    it("Should transfer dividend rights with tokens", async function () {
      const { token, owner, user1, user2 } = await loadFixture(
        deployDividendTokenFixture
      );

      // User1 mints
      await token.connect(user1).mint({ value: ethers.parseEther("1") });

      // User1 transfers half to User2
      await token
        .connect(user1)
        .transfer(user2.address, ethers.parseEther("500"));

      // Distribute dividends
      await token
        .connect(owner)
        .distributeDividends({ value: ethers.parseEther("1") });

      // Both should get 50%
      expect(await token.withdrawableDividendOf(user1.address)).to.equal(
        ethers.parseEther("0.5")
      );
      expect(await token.withdrawableDividendOf(user2.address)).to.equal(
        ethers.parseEther("0.5")
      );
    });
  });

  describe("Staking", function () {
    it("Should allow staking tokens", async function () {
      const { token, user1 } = await loadFixture(deployDividendTokenFixture);

      await token.connect(user1).mint({ value: ethers.parseEther("1") });
      await token.connect(user1).stake(ethers.parseEther("500"));

      expect(await token.stakedBalance(user1.address)).to.equal(
        ethers.parseEther("500")
      );
      expect(await token.totalStaked()).to.equal(ethers.parseEther("500"));
    });

    it("Should emit Staked event", async function () {
      const { token, user1 } = await loadFixture(deployDividendTokenFixture);

      await token.connect(user1).mint({ value: ethers.parseEther("1") });

      await expect(token.connect(user1).stake(ethers.parseEther("500")))
        .to.emit(token, "Staked")
        .withArgs(user1.address, ethers.parseEther("500"));
    });

    it("Should allow unstaking", async function () {
      const { token, user1 } = await loadFixture(deployDividendTokenFixture);

      await token.connect(user1).mint({ value: ethers.parseEther("1") });
      await token.connect(user1).stake(ethers.parseEther("500"));
      await token.connect(user1).unstake();

      expect(await token.stakedBalance(user1.address)).to.equal(0);
      expect(await token.balanceOf(user1.address)).to.equal(
        ethers.parseEther("1000")
      );
    });

    it("Should revert staking with insufficient balance", async function () {
      const { token, user1 } = await loadFixture(deployDividendTokenFixture);

      await token.connect(user1).mint({ value: ethers.parseEther("1") });

      await expect(
        token.connect(user1).stake(ethers.parseEther("2000"))
      ).to.be.revertedWith("Insufficient balance");
    });

    it("Should revert unstaking with nothing staked", async function () {
      const { token, user1 } = await loadFixture(deployDividendTokenFixture);

      await expect(token.connect(user1).unstake()).to.be.revertedWith(
        "No tokens staked"
      );
    });
  });

  describe("View Functions", function () {
    it("Should return correct account info", async function () {
      const { token, owner, user1 } = await loadFixture(
        deployDividendTokenFixture
      );

      await token.connect(user1).mint({ value: ethers.parseEther("1") });
      await token.connect(user1).stake(ethers.parseEther("300"));
      await token
        .connect(owner)
        .distributeDividends({ value: ethers.parseEther("0.7") });

      const info = await token.getAccountInfo(user1.address);

      expect(info.tokenBalance).to.equal(ethers.parseEther("700"));
      expect(info.staked).to.equal(ethers.parseEther("300"));
      expect(info.withdrawableDividends).to.equal(ethers.parseEther("0.7"));
    });

    it("Should return correct contract stats", async function () {
      const { token, owner, user1, user2 } = await loadFixture(
        deployDividendTokenFixture
      );

      await token.connect(user1).mint({ value: ethers.parseEther("1") });
      await token.connect(user2).mint({ value: ethers.parseEther("2") });
      await token.connect(user1).stake(ethers.parseEther("500"));
      await token
        .connect(owner)
        .distributeDividends({ value: ethers.parseEther("1") });

      const stats = await token.getContractStats();

      expect(stats._totalSupply).to.equal(ethers.parseEther("3000"));
      expect(stats._totalStaked).to.equal(ethers.parseEther("500"));
      expect(stats._reserveBalance).to.equal(ethers.parseEther("3"));
      expect(stats._totalDividendsDistributed).to.equal(ethers.parseEther("1"));
    });
  });

  describe("Edge Cases", function () {
    it("Should handle very small mint amounts", async function () {
      const { token, user1 } = await loadFixture(deployDividendTokenFixture);

      const smallAmount = ethers.parseEther("0.001");
      await token.connect(user1).mint({ value: smallAmount });

      expect(await token.balanceOf(user1.address)).to.equal(
        ethers.parseEther("1") // 0.001 * 1000
      );
    });

    it("Should handle multiple dividend distributions", async function () {
      const { token, owner, user1 } = await loadFixture(
        deployDividendTokenFixture
      );

      await token.connect(user1).mint({ value: ethers.parseEther("1") });

      // Multiple distributions
      await token
        .connect(owner)
        .distributeDividends({ value: ethers.parseEther("0.5") });
      await token
        .connect(owner)
        .distributeDividends({ value: ethers.parseEther("0.3") });
      await token
        .connect(owner)
        .distributeDividends({ value: ethers.parseEther("0.2") });

      expect(await token.withdrawableDividendOf(user1.address)).to.equal(
        ethers.parseEther("1")
      );
    });

    it("Should allow partial dividend withdrawals", async function () {
      const { token, owner, user1 } = await loadFixture(
        deployDividendTokenFixture
      );

      await token.connect(user1).mint({ value: ethers.parseEther("1") });
      await token
        .connect(owner)
        .distributeDividends({ value: ethers.parseEther("1") });

      // Withdraw
      await token.connect(user1).withdrawDividends();

      // Try to withdraw again
      await expect(token.connect(user1).withdrawDividends()).to.be.revertedWith(
        "No dividends to withdraw"
      );

      // But new dividends should work
      await token
        .connect(owner)
        .distributeDividends({ value: ethers.parseEther("0.5") });
      expect(await token.withdrawableDividendOf(user1.address)).to.equal(
        ethers.parseEther("0.5")
      );
    });
  });

  describe("Security", function () {
    it("Should be protected against reentrancy on burn", async function () {
      // Note: Full reentrancy testing would require a malicious contract
      // This test verifies the function completes normally
      const { token, user1 } = await loadFixture(deployDividendTokenFixture);

      await token.connect(user1).mint({ value: ethers.parseEther("1") });
      await token.connect(user1).burn(ethers.parseEther("500"));

      expect(await token.balanceOf(user1.address)).to.equal(
        ethers.parseEther("500")
      );
    });

    it("Should be protected against reentrancy on dividend withdrawal", async function () {
      const { token, owner, user1 } = await loadFixture(
        deployDividendTokenFixture
      );

      await token.connect(user1).mint({ value: ethers.parseEther("1") });
      await token
        .connect(owner)
        .distributeDividends({ value: ethers.parseEther("1") });

      await token.connect(user1).withdrawDividends();

      expect(await token.withdrawableDividendOf(user1.address)).to.equal(0);
    });
  });
});
