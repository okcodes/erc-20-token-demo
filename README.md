

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


