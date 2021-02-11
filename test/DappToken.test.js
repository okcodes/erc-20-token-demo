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

  it('transfers token ownership', async () => {
    // Test `require` statement first by transfering something larger than the sender's balance'
    // ussing 'call' does not trigger the transaction

    await tokenInstance.transfer.call(accounts[1], 9999999999)
      .then(assert.fail)
      .catch(error => {
        assert(error.message.indexOf('revert') >= 0, 'error message must contain revert');
      });


    const success = await tokenInstance.transfer.call(accounts[1], 250_000, {from: accounts[0]});
    assert.equal(success, true, 'it returns true');

    const receipt = await tokenInstance.transfer(accounts[1], 250_000, {from: accounts[0]});

    assert.equal(receipt.logs.length, 1, 'triggers one event');
    assert.equal(receipt.logs[0].event, 'Transfer', 'should be the "Transfer" event');
    assert.equal(receipt.logs[0].args._from, accounts[0], 'logs the account the tokens are transferred from');
    assert.equal(receipt.logs[0].args._to, accounts[1], 'logs the account the tokens are transferred to');
    assert.equal(receipt.logs[0].args._value, 250_000, 'logs the transfer amount');

    const balance_1 = await tokenInstance.balanceOf(accounts[1]);
    assert.equal(balance_1.toNumber(), 250_000, 'adds the amount to the receiving account');

    const balance_0 = await tokenInstance.balanceOf(accounts[0]);
    assert.equal(balance_0.toNumber(), 750_000, 'deducts the amount from the sending account');
  });

  it('approves tokens for delegated transfer', async () => {
    // simulated call to 'approve' (using the 'call' function)
    const success = await tokenInstance.approve.call(accounts[1], 100);
    assert.equal(success, true, 'it resturns true');

    // Note how then actually calling the function, we don't get just the returned value but a 'receipt?' object.

    // actually calling 'approve' (calling it directly without using the 'call' function)
    const receipt = await tokenInstance.approve(accounts[1], 100, {from: accounts[0]});
    assert.equal(receipt.logs.length, 1, 'triggers one event');
    assert.equal(receipt.logs[0].event, 'Approval', 'should be the "Approval" event');
    assert.equal(receipt.logs[0].args._owner, accounts[0], 'logs the account the tokens are authorized by');
    assert.equal(receipt.logs[0].args._spender, accounts[1], 'logs the account the tokens are authorized to');
    assert.equal(receipt.logs[0].args._value, 100, 'logs the transfer amount');

    const allowance = await tokenInstance.allowance(accounts[0], accounts[1]);
    assert.equal(allowance.toNumber(), 100, 'stores the allowance for delegated transfer');
  });

  it('handles delegated token transfers', async () => {
    const fromAccount = accounts[2];
    const toAccount = accounts[3];
    const spendingAccount = accounts[4];

    // Transfer some tokens to fromAccount (minter grants 100 to fromAccount)
    const transferReceipt = await tokenInstance.transfer(fromAccount, 100, {from: accounts[0]});
    // Approve spendinAccount to spend 10 tokens from fromAccount (fromAccount allows spendingAccount to spend 10 tokens)
    const approveReceipt = await tokenInstance.approve(spendingAccount, 10, {from: fromAccount});

    // Try transferring something larger than the sender's balance
    await assertThrowsAsync(() => tokenInstance.transferFrom(fromAccount, toAccount, 9_999, {from: spendingAccount}), /revert/, 'cannot transfer values larger than balance');

    // Try transferring something larger than the approved ammount
    await assertThrowsAsync(() => tokenInstance.transferFrom(fromAccount, toAccount, 20, {from: spendingAccount}), /revert/, 'cannot transfer values larger than approved ammount');

    // Simulated call
    const success = await tokenInstance.transferFrom.call(fromAccount, toAccount, 10, {from: spendingAccount});
    assert.equal(success, true);

    // Actual call
    const receipt = await tokenInstance.transferFrom(fromAccount, toAccount, 10, {from: spendingAccount});
    assert.equal(receipt.logs.length, 1, 'triggers one event');
    assert.equal(receipt.logs[0].event, 'Transfer', 'should be the "Transfer" event');
    assert.equal(receipt.logs[0].args._from, fromAccount, 'logs the account the tokens are transfered from');
    assert.equal(receipt.logs[0].args._to, toAccount, 'logs the account the tokens are transfered to');
    assert.equal(receipt.logs[0].args._value, 10, 'logs the transfer amount');

    const balanceOfFromAccount = await tokenInstance.balanceOf(fromAccount);
    assert.equal(balanceOfFromAccount.toNumber(), 90, 'deducts the amount from the sending account');

    const balanceOfToAccount = await tokenInstance.balanceOf(toAccount);
    assert.equal(balanceOfToAccount.toNumber(), 10, 'adds the amount to the receiving account');

    const allowance = await tokenInstance.allowance(fromAccount, spendingAccount);
    assert.equal(allowance.toNumber(), 0, 'deducts the amount form the allowance');
  })
});

/**
 * Asserts that the given function returns a promise that throws using the chai assertion library.
 *
 * The assertion will succeed if calling 'fn' returns a promise that throws an error. The assertion will fail otherwise.
 *
 * @see {@link https://www.chaijs.com/api/assert/#method_throws|Chai Docs} for further information.
 *
 * @param {function(): Promise<any>} fn - Function that returns the promise which will be asserted to throw.
 * @param {RegExp|String} errMsgMatcher - If provided, it also asserts that the error thrown will have a message matching errMsgMatcher.
 * @param {String} msg - Message to display on error.
 * @returns {Promise<void>}
 */
const assertThrowsAsync = async (fn, errMsgMatcher, msg = '') => {
  try {
    await fn();
  } catch (error) {
    assert.throws(() => {
      throw error;
    }, error, errMsgMatcher, msg);
    // At this point if assert didn't throw, return to make the assert to pass.
    return;
  }

  // If this point is reached, it means the fn didn't throw so assert should fail.
  assert.fail(`${msg}: expected [Function] to throw an error`);
}
