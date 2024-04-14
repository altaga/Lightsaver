import {QUICK_NODE_URL, QUICK_NODE_API, EXPLORER_URL} from '@env';

import sol from '../assets/logos/sol.png';
import usdc from '../assets/logos/usdc.png';
import usdt from '../assets/logos/usdt.png';
import mxn from '../assets/extraLogos/mxn.png';
import usd from '../assets/extraLogos/usd.png';
import zillow from '../assets/extraLogos/zillow.png';
import bay from '../assets/extraLogos/bay.png';
import loan from '../assets/extraLogos/loan.png';
import loanL from '../assets/extraLogos/loanL.png';
import {Image} from 'react-native';
import {PublicKey} from '@solana/web3.js';

export const TOKEN_PROGRAM_ID = new PublicKey(
  'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
);
export const ASSOCIATED_TOKEN_PROGRAM_ID = new PublicKey(
  'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL',
);

const w = 50;
const h = 50;

export const iconsBlockchain = {
  usdc: <Image source={usdc} style={{width: w, height: h}} />,
  usdt: <Image source={usdt} style={{width: w, height: h}} />,
  sol: <Image source={sol} style={{width: w, height: h}} />,
};

export const iconsTradFi = {
  mxn: <Image source={mxn} style={{width: w, height: h}} />,
  usd: <Image source={usd} style={{width: w, height: h}} />,
};

export const iconsLoans = {
  zillow: <Image source={zillow} style={{width: w, height: h}} />,
  bay: <Image source={bay} style={{width: w, height: h}} />,
  loan: <Image source={loan} style={{width: w, height: h}} />,
  loanL: <Image source={loanL} style={{width: w, height: h}} />,
};

export const tradFi = {
  tokens: [
    {
      name: 'Mexican Peso',
      symbol: 'MXN',
      icon: iconsTradFi.mxn,
    },
    {
      name: 'US Dollar',
      symbol: 'USD',
      icon: iconsTradFi.usd,
    },
  ],
};

export const blockchain = {
  network: 'Solana',
  token: 'SOL',
  rpc: `https://${QUICK_NODE_URL}.quiknode.pro/${QUICK_NODE_API}/`,
  chainId: null,
  blockExplorer: `${EXPLORER_URL}`,
  iconSymbol: 'sol',
  decimals: 9,
  tokens: [
    {
      name: 'Solana',
      symbol: 'Sol',
      address: '',
      decimals: 9,
      icon: iconsBlockchain.sol,
    },
    {
      name: 'USD Coin',
      symbol: 'USDC',
      address: '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU',
      decimals: 6,
      icon: iconsBlockchain.usdc,
    },
    {
      name: 'Tether',
      symbol: 'USDT',
      address: 'EJwZgeZrdC8TXTQbQBoL6bfuAnFUUy1PVCMB4DYPzVaS',
      decimals: 6,
      icon: iconsBlockchain.usdt,
    },
  ],
};

export const blockchainMain = {
  network: 'Solana',
  token: 'SOL',
  rpc: `https://${QUICK_NODE_URL}.quiknode.pro/${QUICK_NODE_API}/`,
  chainId: null,
  blockExplorer: `${EXPLORER_URL}`,
  iconSymbol: 'sol',
  decimals: 9,
  tokens: [
    {
      name: 'Solana',
      symbol: 'Sol',
      address: '',
      decimals: 9,
      icon: iconsBlockchain.sol,
    },
    {
      name: 'USD Coin',
      symbol: 'USDC',
      address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
      decimals: 6,
      icon: iconsBlockchain.usdc,
    },
    {
      name: 'Tether',
      symbol: 'USDT',
      address: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
      decimals: 6,
      icon: iconsBlockchain.usdt,
    },
  ],
};

export const availableLending = [
  [
    {
      company: 'loanDepot',
      icon: iconsLoans.loan,
      amount: 10,
    },
  ],
  [
    {
      company: 'Zillow',
      icon: iconsLoans.zillow,
      amount: 100,
    },
    {
      company: 'loanDepot',
      icon: iconsLoans.loan,
      amount: 150,
    },
  ],
  [
    {
      company: 'Zillow',
      icon: iconsLoans.zillow,
      amount: 800,
    },
    {
      company: 'Bay Equity',
      icon: iconsLoans.bay,
      amount: 400,
    },
    {
      company: 'loanDepot',
      icon: iconsLoans.loan,
      amount: 700,
    },
  ],
  [
    {
      company: 'Zillow',
      icon: iconsLoans.zillow,
      amount: 5_000,
    },
    {
      company: 'LoanLock',
      icon: iconsLoans.loanL,
      amount: 4_000,
    },
    {
      company: 'Bay Equity',
      icon: iconsLoans.bay,
      amount: 2_000,
    },
    {
      company: 'loanDepot',
      icon: iconsLoans.loan,
      amount: 3_000,
    },
  ],
  [
    {
      company: 'Zillow',
      icon: iconsLoans.zillow,
      amount: 60_000,
    },
    {
      company: 'LoanLock',
      icon: iconsLoans.loanL,
      amount: 50_000,
    },
    {
      company: 'Bay Equity',
      icon: iconsLoans.bay,
      amount: 30_000,
    },
    {
      company: 'loanDepot',
      icon: iconsLoans.loan,
      amount: 15_000,
    },
  ],
];
