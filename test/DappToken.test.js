const DappToken = artifacts.require("DappToken");

contract('DappToken', async accounts => {
  let tokenInstance;

  before(async () => {
    tokenInstance = await DappToken.deployed();
  });

  it('initializes the contract with the correct values', async () => {
    const name = await tokenInstance.name();
    assert.equal(name, 'Dapp Token', 'has the correct name');

    const symbol = await tokenInstance.symbol();
    assert.equal(symbol, 'DAPP', 'has the correct symbol');

    const standard = await tokenInstance.standard();
    assert.equal(standard, 'Dapp Token v1.0', 'has the correct standard');
  });

  it('allocates the initial supply upon deployment', async () => {
    const totalSupply = await tokenInstance.totalSupply();
    assert.equal(totalSupply.toNumber(), 1_000_000, 'sets the total supply to 1M');
    const adminBalance = await tokenInstance.balanceOf(accounts[0]);
    assert.equal(adminBalance.toNumber(), 1_000_000, 'it allocates the initial supply to the admin account');
  });
});
