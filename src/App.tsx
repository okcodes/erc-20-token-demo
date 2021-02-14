import React, {useEffect, useState} from 'react';
import './App.css';
// TODO: Consider removing dependency to 'web3' in production since metamask no longer uses it.
import Web3 from 'web3';
import {provider} from 'web3-core';
// This function detects most providers injected at window.ethereum
import detectEthereumProvider from '@metamask/detect-provider';
import {fromWei} from 'web3-utils';

const TruffleContract = require('@truffle/contract');
const TOKEN_PRICE = 1_000_000_000_000_000;

let _myWeb3Provider: provider | any;
let _myWeb3: Web3;

let dappTokenSaleTruffleContract: any;
let dappTokenSaleInstance: any;
let dappTokenTruffleContract: any;
let dappTokenInstance: any;

const useMetamask = true;

const initWithMetamask = async () => {
    _myWeb3Provider = await detectEthereumProvider(); // _myWeb3Provider === window.ethereum
    if (_myWeb3Provider) {
        _myWeb3 = new Web3(_myWeb3Provider);
        const enableResult = await _myWeb3Provider.request({method: 'eth_requestAccounts'});
        console.log({enableResult});
    } else {
        console.error('Please install MetaMask!');
    }
};

const initWithLocalBlockchain = async () => {
    _myWeb3Provider = new Web3.providers.HttpProvider('http://127.0.0.1:7545');
    _myWeb3 = new Web3(_myWeb3Provider);
};

const initEthereum = async () => {
    if (useMetamask) {
        await initWithMetamask();
    } else {
        await initWithLocalBlockchain();
    }
};

const initContracts = async () => {
    const DappTokenSaleJson = await fetch('_contracts/DappTokenSale.json').then(response => response.json());
    const DappTokenJson = await fetch('_contracts/DappToken.json').then(response => response.json());

    dappTokenSaleTruffleContract = TruffleContract(DappTokenSaleJson);
    dappTokenSaleTruffleContract.setProvider(_myWeb3Provider);
    dappTokenSaleInstance = await dappTokenSaleTruffleContract.deployed();
    console.log('Dapp Token Sale Address', {dappTokenSaleInstance});

    dappTokenTruffleContract = TruffleContract(DappTokenJson);
    dappTokenTruffleContract.setProvider(_myWeb3Provider);
    dappTokenInstance = await dappTokenTruffleContract.deployed();
    console.log('Dapp Token Address', {dappTokenInstance});
};

const getAccount = async () => {
    return await _myWeb3.eth.getCoinbase();
};

const getAccounts = async () => {
    return await _myWeb3.eth.getAccounts();
};

const App = () => {

    const [account, setAccount] = useState('');
    const [price, setPrice] = useState('');
    const [sold, setSold] = useState(0);
    const [balance, setBalance] = useState(0);
    const [saleBalance, setSaleBalance] = useState(0);
    const [loading, setLoading] = useState(true);
    const [tokensToBuy, setTokensToBuy] = useState(0);

    const init = async () => {
        await initEthereum();
        await initContracts();

        // Get account address data

        const account = await getAccount();
        setAccount(account);

        const balanceOfAccount = await dappTokenInstance.balanceOf(account);
        setBalance(balanceOfAccount.toNumber());

        // Get tokens info

        const tokenPrice = await dappTokenSaleInstance.tokenPrice();
        setPrice(fromWei(tokenPrice, 'ether'));

        const tokensSold = await dappTokenSaleInstance.tokensSold();
        setSold(tokensSold.toNumber());

        const balanceOfSaleContract = await dappTokenInstance.balanceOf(dappTokenSaleInstance.address);
        setSaleBalance(balanceOfSaleContract.toNumber());

        setLoading(false);
    };

    const buyTokens = async () => {
        const receipt = await dappTokenSaleInstance.buyTokens(tokensToBuy, {
            from: account,
            value: tokensToBuy * TOKEN_PRICE,
            gas: 500_000,
        });
        setTokensToBuy(0);
    };

    useEffect(() => {
        init();
    }, []);


    if (loading) return <Loading/>;

    return (
        <div>
            <h1>ERC-20 TOKEN ICO SALE</h1>

            <p>Introducing "Ok Codes Token" (OKCODES).</p>

            <p>The price is <span>{price}</span> Ether. You currently have <span>{balance}</span> OKCODES.</p>

            <form onSubmit={e => {
                e.preventDefault();
                buyTokens();
            }}>
                <input value={tokensToBuy} onChange={e => !isNaN(+e.target.value) && setTokensToBuy(+e.target.value)}/>
                <button type="submit">Buy Tokens</button>
            </form>

            <div>
                <span>{sold}</span>/<span>{saleBalance}</span> tokens sold.
            </div>

            <div>Your account {account}</div>
        </div>
    );
}

const Loading = () => {
    return (
        <div>
            Loading...
        </div>
    )
};

export default App;
