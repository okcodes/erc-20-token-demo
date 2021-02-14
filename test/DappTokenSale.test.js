const {assertThrowsAsync} = require("./TestUtils");
const DappToken = artifacts.require("DappToken");
const DappTokenSale = artifacts.require("DappTokenSale");

contract('DappTokenSale', async accounts => {
    let tokenInstance;
    let tokenSaleInstance;
    const TOKEN_PRICE = 1_000_000_000_000_000;
    const admin = accounts[0];
    const buyer = accounts[1];
    const TOKENS_AVAILABLE = 75;

    before(async () => {
        tokenInstance = await DappToken.deployed();
        tokenSaleInstance = await DappTokenSale.deployed();
    });

    it('initializes the contract with the correct values', async () => {
        const address = tokenSaleInstance.address;
        assert.notEqual(address, 0x0, 'has contract address');

        const tokenAddress = await tokenSaleInstance.tokenContract();
        assert.notEqual(tokenAddress, 0x0, 'has token contract address');

        const price = await tokenSaleInstance.tokenPrice();
        assert.equal(price, TOKEN_PRICE, 'token price is correct');
    });

    it('facilitates token buying', async () => {
        const tokensToBuy = 10;

        // Provision 75% of all tokens to the token sale.
        const initialAllocationReceipt = await tokenInstance.transfer(tokenSaleInstance.address, TOKENS_AVAILABLE, {from: admin});

        // Try buy more tokens that available: TOKENS_AVAILABLE + 1 is one token more that the total supply.
        await assertThrowsAsync(() => tokenSaleInstance.buyTokens(TOKENS_AVAILABLE + 1, {from: buyer, value: (TOKENS_AVAILABLE + 1) * TOKEN_PRICE}), /revert/, 'cannot purchase more tokens than total supply');

        const receipt = await tokenSaleInstance.buyTokens(tokensToBuy, {from: buyer, value: tokensToBuy * TOKEN_PRICE});
        assert.equal(receipt.logs.length, 1, 'triggers one event');
        assert.equal(receipt.logs[0].event, 'Sell', 'should be the "Sell" event');
        assert.equal(receipt.logs[0].args._buyer, buyer, 'logs the account that purchased the tokens');
        assert.equal(receipt.logs[0].args._amount, tokensToBuy, 'logs the number of tokens purchased');

        const buyerBalance = await tokenInstance.balanceOf(buyer);
        assert.equal(buyerBalance.toNumber(), tokensToBuy, 'Buyer obtained the amount of tokens bought');

        const tokenSaleBalance = await tokenInstance.balanceOf(tokenSaleInstance.address);
        assert.equal(tokenSaleBalance.toNumber(), TOKENS_AVAILABLE - tokensToBuy, 'TokenSale contract reduced the amount of tokens bought');

        const tokensSold = await tokenSaleInstance.tokensSold();
        assert.equal(tokensSold.toNumber(), tokensToBuy, 'increments the number of tokens sold');

        // Try buy more tokens that available: In theory it's possible to buy the total supply at once, but in the previous test we've already bought 'tokensToBuy' tokens, so an exception is expected.
        await assertThrowsAsync(() => tokenSaleInstance.buyTokens(TOKENS_AVAILABLE, {from: buyer, value: TOKENS_AVAILABLE * TOKEN_PRICE}), /revert/, 'cannot purchase more tokens than remaining');

        // Try to underpay for tokens
        await assertThrowsAsync(() => tokenSaleInstance.buyTokens(tokensToBuy, {from: buyer, value: 1}), /revert/, 'Underpay: msg.value must equal number of tokens in wei');

        // Try to overpay for tokens
        await assertThrowsAsync(() => tokenSaleInstance.buyTokens(tokensToBuy, {from: buyer, value: tokensToBuy * TOKEN_PRICE * 10}), /revert/, 'Overpay: msg.value must equal number of tokens in wei');
    });
});
