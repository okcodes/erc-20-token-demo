const DappToken = artifacts.require("DappToken");

contract('DappToken', accounts => {
    let tokenInstance;
    it('sets the total supply upon deployment', () => DappToken.deployed().then(instance => {
        tokenInstance = instance;
        return tokenInstance.totalSupply();
    }).then(function (totalSupply) {
        assert.equal(totalSupply.toNumber(), 1000000, 'sets the total suply to 1M');
    }));
});
