// Networks

// Assets
import {Image} from 'react-native';
import eth from '../assets/linklinkETH.png';
import usdc from '../assets/logos/usdc.png';
import usdt from '../assets/logos/usdt.png';
import bnb from '../assets/logos/bnb.png';

export const NFTaddress = '0x8Da0bb16b869EE966bcF00aef7db9bEaA67eE511';
export const lightsaverNFT =
  'ipfs://bafyreigfxmrk6o6bv43uc74cag4kp42evux3wg4vj6os6qa4ve4k2evqoq/metadata.json';
export const saverCardNFT =
  'ipfs://bafyreidzarlzdpjdcmk55lgtkxpzqy4uvlyhdp3gmbuqheisgscktgjjgu/metadata.json';

export const APP_IDENTITY = {
  name: 'Lightsaver',
  uri: 'https://lightsaver.com',
  icon: 'favicon.ico', // Full path resolves to https://yourdapp.com/favicon.ico
};

const w = 50;
const h = 50;

export const icons = {
  usdc: <Image source={usdc} style={{width: w, height: h}} />,
  usdt: <Image source={usdt} style={{width: w, height: h}} />,
  eth: <Image source={eth} style={{width: w, height: h}} />,
  bnb: <Image source={bnb} style={{width: w, height: h}} />,
};

export const EVMtest = {
  network: 'Lightlink',
  token: 'ETH',
  rpc: 'https://replicator.pegasus.lightlink.io/rpc/v1',
  chainId: 1891,
  blockExplorer: 'https://pegasus.lightlink.io/',
  iconSymbol: 'eth',
  decimals: 18,
  tokens: [
    {
      name: 'Ethereum',
      symbol: 'ETH',
      address: '0x0000000000000000000000000000000000000000',
      decimals: 18,
      icon: icons.eth,
    },
    {
      name: 'USD Coin',
      symbol: 'USDC',
      address: '0x3cf2c147d43C98Fa96d267572e3FD44A4D3940d4',
      decimals: 6,
      icon: icons.usdc,
    },
    {
      name: 'Tether',
      symbol: 'USDT',
      address: '0x057e8e2bC40ECff87e6F9b28750D5E7AC004Eab9',
      decimals: 6,
      icon: icons.usdt,
    },
    {
      name: 'Wrapped BNB',
      symbol: 'WBNB',
      address: '0x60d7966bdf03f0Ec0Ac6de7269CE0E57aAd6e9c2',
      decimals: 18,
      icon: icons.bnb,
    },
  ],
};

export const EVM = {
  network: 'Lightlink',
  token: 'ETH',
  rpc: 'https://replicator.phoenix.lightlink.io/rpc/v1',
  chainId: 1890,
  blockExplorer: 'https://phoenix.lightlink.io/',
  iconSymbol: 'eth',
  decimals: 18,
  tokens: [
    {
      name: 'Ethereum',
      symbol: 'ETH',
      address: '0x0000000000000000000000000000000000000000',
      decimals: 18,
      icon: icons.eth,
    },
    {
      name: 'USD Coin',
      symbol: 'USDC',
      address: '0x18fB38404DADeE1727Be4b805c5b242B5413Fa40',
      decimals: 6,
      icon: icons.usdc,
    },
    {
      name: 'Tether',
      symbol: 'USDT',
      address: '0x6308fa9545126237158778e74AE1b6b89022C5c0',
      decimals: 6,
      icon: icons.usdt,
    },
    {
      name: 'Wrapped BNB',
      symbol: 'WBNB',
      address: '0x81A1f39f7394c4849E4261Aa02AaC73865d13774',
      decimals: 18,
      icon: icons.bnb,
    },
  ],
};
