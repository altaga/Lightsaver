import {ethers} from 'ethers';
import {getAsyncStorageValue, getEncryptedStorageValue} from './utils/utils';
import {EVM, NFTaddress, lightsaverNFT} from './utils/constants';
import {abiSaverNFT} from './contracts/saverNFT';

const sleep = time => new Promise(resolve => setTimeout(() => resolve(), time));

export const fetchNFTtask = async taskDataArguments => {
  // Example of an infinite loop task
  const {delay} = taskDataArguments;
  await new Promise(async resolve => {
    let autoMint = await getAsyncStorageValue('autoMint');
    console.log('autoMint: ', autoMint);
    while (autoMint ?? false) {
      const flag = await mintAvailable();
      console.log('mintAvailable: ', flag);
      if (flag) {
        console.log('Minting ok');
      }
      await sleep(delay);
      autoMint = await getAsyncStorageValue('autoMint');
    }
    resolve();
  });
};

export const options = {
  taskName: 'FetchNFT',
  taskTitle: 'FetchNFT',
  taskDesc: 'Function for fetching your weekly NFT',
  taskIcon: {
    name: 'ic_launcher',
    type: 'mipmap',
  },
  color: '#0fb9f9',
  parameters: {
    delay: 1000 * 60 * 60 * 24,
  },
};

const getNFT = async () => {
  try {
    const privateKey = await getEncryptedStorageValue('privateKey');
    const signer = new ethers.Wallet(privateKey, this.provider);
    const contract = new ethers.Contract(NFTaddress, abiSaverNFT, signer);
    const tx = await contract.mint(lightsaverNFT);
    await tx.wait();
  } catch (err) {
    console.log(err);
  }
};

const mintAvailable = async () => {
  const provider = new ethers.providers.JsonRpcProvider(EVM.rpc);
  const publicKey = await getAsyncStorageValue('publicKey');
  const contract = new ethers.Contract(NFTaddress, abiSaverNFT, provider);
  const flag = await contract.mintAvailable(publicKey);
  return flag;
};
