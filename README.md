

```
truffle test
truffle build
truffle console

# Migration (make sure to copy the json files of 'build/contracts' to 'public/_contracts'.
truffle migrate --reset
```

## Inside truffle console.

```
// Get currently deployed contract
var dasToken = await DappToken.deployed()
var dasTokenSale = await DappTokenSale.deployed()
dasToken.address
var dasTotalSupply = await dasToken.totalSupply()
```

```
web3.eth.accounts

dasToken.transfer(web3.eth.accounts[1], 1, { from: web3.eth.accounts[0] })
```


how it works:
- Provision tokens to token sale contract
- set a token price in wei
- assign an admin
- buy tokens
- end sale

## Provision initial supply from admin account to token-sale-contract.

```shell
truffle console

# Then

var tokensAvailable = 750_000;
var token = await DappToken.deployed();
var tokenSale = await DappTokenSale.deployed();
var admin = (await web3.eth.getAccounts())[0];
var receipt = token.transfer(tokenSale.address, tokensAvailable, {from: admin});
// verify balance of contract
// token.balanceOf(tokenSale.address)
// token.balanceOf(admin)
```