const DappTokenSale = artifacts.require("DappTokenSale");

contract('DappTokenSale', async accounts => {
    let tokenSaleInstance;
    const tokenPrice = 1_000_000_000_000_000;

    before(async () => {
        tokenSaleInstance = await DappTokenSale.deployed();
    });

    it('initializes the contract with the correct values', async () => {
        const address = tokenSaleInstance.address;
        assert.notEqual(address, 0x0, 'has contract address');

        const tokenAddress = await tokenSaleInstance.tokenContract();
        assert.notEqual(tokenAddress, 0x0, 'has token contract address');

        const price = await tokenSaleInstance.tokenPrice();
        assert.equal(price, tokenPrice, 'token price is correct');
    });
});
