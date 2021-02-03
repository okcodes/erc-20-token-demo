const DappToken = artifacts.require("DappToken");
const DappTokenSale = artifacts.require("DappTokenSale");

module.exports = async deployer => {
  await deployer.deploy(DappToken, 1_000_000);
  // Token price is 0.001 Ether
  const tokenPrice = 1_000_000_000_000_000;
  await deployer.deploy(DappTokenSale, DappToken.address, tokenPrice);
};
