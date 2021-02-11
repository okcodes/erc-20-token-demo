import React, {useEffect} from 'react';
import './App.css';
import Web3 from 'web3';
import {provider} from 'web3-core';
import DappTokenSaleJson from './_contracts/DappTokenSale.json';
import DappTokenJson from './_contracts/DappToken.json';
// This function detects most providers injected at window.ethereum
import detectEthereumProvider from '@metamask/detect-provider';

const TruffleContract = require('@truffle/contract');

const price = 20;
const balance = 5;

let _myWeb3Provider: provider | any;
let _myWeb3: Web3;

let _dappTokenSale;
let _dappToken;

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
    _dappTokenSale = TruffleContract(DappTokenSaleJson);
    _dappTokenSale.setProvider(_myWeb3Provider);
    const dappTokenSale = await _dappTokenSale.deployed();
    console.log('Dapp Token Sale Address', {dappTokenSale});

    _dappToken = TruffleContract(DappTokenJson);
    _dappToken.setProvider(_myWeb3Provider);
    const dappToken = await _dappToken.deployed();
    console.log('Dapp Token Address', {dappToken});

    const coinbaseAddress = await _myWeb3.eth.getCoinbase();
    console.log({coinbaseAddress});

    const accounts = await _myWeb3.eth.getAccounts();
    console.log({accounts});
};

const App = () => {

    const init = async () => {
        await initEthereum();
        await initContracts();
    };

    useEffect(() => {
        init();
    }, []);

    return (
        <div>
            <h1>ERC-20 TOKEN ICO SALE</h1>

            <p>Introducing "Ok Codes Token" (OKCODES).</p>

            <p>The price is <span>{price}</span> Ether. You currently have <span>{balance}</span> OKCODES.</p>

            <form onSubmit={() => console.log('wanna buy')}>
                <input value={1} onChange={() => void 0}/>
                <button type="submit">Buy Tokens</button>
            </form>

            <div>
                <span>300</span>/<span>10,000,000</span> tokens sold.
            </div>
        </div>
    );
}

export default App;
