

```
truffle test
truffle console
truffle migrate --reset
```

## Inside truffle console.

```
// Get currently deployed contract
var dasToken = await DappToken.deployed()
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

