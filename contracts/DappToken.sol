// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract DappToken {
    string public name = "Dapp Token";
    string public symbol = "DAPP";
    string public standard = "Dapp Token v1.0";
    uint256 public totalSupply;

    event Transfer(address indexed _from, address indexed _to, uint256 _value);

    event Approval(
        address indexed _owner,
        address indexed _spender,
        uint256 _value
    );

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    constructor(uint256 _initialSupply) public {
        // Allocate the initial supply
        // The total amount of tokens are allocated into the account of whoever created the 'DappToken' contract (the admin).
        balanceOf[msg.sender] = _initialSupply;
        totalSupply = _initialSupply;
    }

    // Transfer
    function transfer(address _to, uint256 _value)
        public
        returns (bool success)
    {
        // Excewption if accounts does not have enough
        require(balanceOf[msg.sender] >= _value);

        // Transfer the balance
        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value;

        // Transfer event
        emit Transfer(msg.sender, _to, _value);

        return true;
    }

    function approve(address _spender, uint256 _value)
        public
        returns (bool success)
    {
        allowance[msg.sender][_spender] = _value;
        emit Approval(msg.sender, _spender, _value);
        return true;
    }

    function transferFrom(
        address _from,
        address _to,
        uint256 _value
    ) public returns (bool success) {
        // Require _from has enough tokens
        require(_value <= balanceOf[_from]);
        // Require allowance is big enough
        require(_value <= allowance[_from][msg.sender]);
        // Change the balance
        balanceOf[_from] -= _value;
        balanceOf[_to] += _value;
        // Update the allowance
        allowance[_from][msg.sender] -= _value;
        // Transfer event
        emit Transfer(_from, _to, _value);
        // return a boolean
        return true;
    }
}
