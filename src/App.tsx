import React, {useEffect} from 'react';
import './App.css';
import Web3 from 'web3';
import {provider} from 'web3-core';
import DappTokenSaleJson from './_contracts/DappTokenSale.json';
import DappTokenJson from './_contracts/DappToken.json';

const TruffleContract = require('@truffle/contract');

const price = 20;
const balance = 5;

let _myWeb3Provider: provider;
let _myWeb3: Web3;
let _dappTokenSale;
let _dappToken;

const useMetamask = true;

const initWeb3 = () => {
    if (useMetamask && typeof (window as any).web3 !== 'undefined') {
        // If a web3 instance is already provided by Meta Mask.
        console.log('Initialized using metamask');
        _myWeb3Provider = (window as any).web3.currentProvider;
    } else {
        // Specify default instance if no web3 instance provided.
        console.log('Initialized using local blockchain');
        _myWeb3Provider = new Web3.providers.HttpProvider('http://127.0.0.1:7545');
    }

    _myWeb3 = new Web3(_myWeb3Provider);
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

    const x = _myWeb3.eth.getCoinbase(((error, coinbaseAddress) => {
        console.log({error, coinbaseAddress});
    }));
    console.log({x});
};

const App = () => {

    useEffect(() => {
        initWeb3();
        initContracts();
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
