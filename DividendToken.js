const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("DividendTokenModule", (m) => {
  const dividendToken = m.contract("DividendToken");

  return { dividendToken };
});
