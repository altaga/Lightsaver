[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE) [<img src="https://img.shields.io/badge/View-Video-red">](pending...)

# Lightsaver

Lightsaver, a sleek wallet designed for the LightLink network, combines cutting-edge security, multi-asset support, and intelligent savings features to offer a user-friendly and comprehensive solution for managing and growing your crypto portfolio.

<img src="https://i.ibb.co/RHKNnFQ/lightsaver-Logo.png" width="50%">

<br>

Welcome, this is our project for Encode x LightLink Gasless Hackathon.

# IMPORTANT!

### Bounties Applied (FAST LINKS):
- [Build a non-custodial wallet with a savings feature bounty](#savings-features)
-  [LightLink Deployment & Blockscout Interactions](#blockscout-interactions)

## Application:

Wallet APK: [LINK](./LightsaverAPK/app-release.apk)

Wallet RN Project: [LINK](./LightsaverRN/)

## Here is our main demo video:

[![Demo](https://i.ibb.co/g4W3ypx/image.png)](https://youtu.be/OgiHJO-_ZCA)

# Introduction and Problem



# Solution

Lightsaver is a non-custodial wallet for smart savings, cashout ramp and card payments with LightLink Network.

System's Architecture:

<img src="https://i.ibb.co/sgWWTwb/scheme-drawio-3.png">

- All LightLink transactions are controlled through [ethers@5.7](https://docs.ethers.org/v5/getting-started/) on mainnet.

- ChainLink is used for its price feeds for each of the most popular assets in the cryptocurrency market.

-  Through [Stripe APIs](https://stripe.com/docs/api) debit card checkouts and virtual accounts.

- The entire design of the smart contracts was carried out in [RemixIDE](https://remix.ethereum.org/) and with the libraries from [Chainlink](https://github.com/smartcontractkit/chainlink) and [Openzeppelin](https://www.openzeppelin.com/contracts).

Our dapp has the fundamental functions of any web3 wallet, such as asset management and the visualization of NFTs. However, the savings feature allows you to save a small amount of money each time you make a transaction. As a reward for their savings efforts, users will receive an NFT weekly. You can also access your assets at any time through our NFT Card payment system, which can be used to make payments between lightlink wallets.

# Main Screens:

<img src="https://i.ibb.co/2yXp1kC/vlcsnap-2024-02-03-23h22m43s030.png" width="32%"> <img src="https://i.ibb.co/qj46w9q/Screenshot-20240130-155239.png" width="32%"> <img src="https://i.ibb.co/jJMJmTh/Screenshot-20240130-155244.png" width="32%">

- The main screen has the function of viewing the assets in the wallet, their exchange rate in dollars and providing send and receive controls.

- At the same time, the wallet does not provide a simple interface to make payments from our wallet to any other wallet compatible with Lightlink.

- In turn, we can receive ETH or any other native token on the LightLink network, either directly to our address or to the savings account that we will see in the next section.

# Savings Features:

The savings functions in our wallet are intended to ensure that the user saves with each transaction made in the wallet in a customizable way. For this reason, we will first explain how the savings account smart contract works.

## Smart Contract:

The first and most important thing is the use of a smart contract that serves as a savings wallet, similar to a smart contract wallet, which allows us to receive any type of asset.

* [Smart Contract](./Contracts/SaverAccount.sol)
* [Deployment Example](https://phoenix.lightlink.io/address/0x74c26425961A3CF6f0551767D88Cc21F365CB639)

First, the contract must be capable of receiving any type of Assets, be it ETH, ERC20 Tokens and NFTs. So the following fallback functions were implemented for this.

    receive() external payable {} // Recieve Deposits

    fallback() external payable {} // Recieve Deposits if recieve doesn't work

Now it should be possible to make withdrawals from the contract to our wallet, so the transfer functions have been implemented for each asset.

    function transferNative(uint256 value, address payable to)
        public
        payable
        onlyOwner
    {
        require(address(this).balance >= value);
        require(withdrawnAvailable()); // Only withdraw if the savings period is valid
        to.transfer(value);
        startDate = timestamp();
    }

    // In case this smart contract recieve tokens or nfts as rewards

    function transferECR20(
        uint256 value,
        address to,
        address s_contract
    ) public onlyOwner {
        IERC20 ERC20Contract = IERC20(s_contract);
        require(ERC20Contract.balanceOf(address(this)) >= value);
        ERC20Contract.transfer(to, value);
    }

    function transferECR721(address to, address s_contract) public onlyOwner {
        ERC721 ERC721Contract = ERC721(s_contract);
        ERC721Contract.transferFrom(address(this), to, 0);
    }

Finally, since it is a savings account, we have to configure time functions, where the user can only withdraw funds from the wallet after a certain time.

    // Utilities
    function timestamp() private view returns (uint256) {
        return block.timestamp;
    }

    function withdrawnAvailable() public view returns (bool) {
        return (period <= (timestamp() - startDate));
    }

Finally, the Wallet makes a record in the NFT contract to be able to provide you with an NFT with your savings balance every week.

* [Smart Contract](./Contracts/SaverNFT.sol)
* [Deployment Example](https://phoenix.lightlink.io/token/0x8Da0bb16b869EE966bcF00aef7db9bEaA67eE511)

        constructor(uint256 _period) {
            owner = msg.sender;
            ...
            SaverNFT InterfaceNFT = SaverNFT(saverAddressNFT);
            InterfaceNFT.addJedi(msg.sender);
        }

## Features and Strategies:

On the part of our UI we have several controls to customize the savings account experience, such as turning the savings function on and off or autominting the weekly NFT.

[App Code](./LightsaverRN/src/screens/main/tabs/tab2.js)

Our UI implements all the controls from the same tab in order to make it easier for the user to configure their savings account.

<img src="https://i.ibb.co/kXnrWW3/Screenshot-20240130-155229.png" width="32%"> 

One of the most important controls of our wallet is to be able to change the savings period at the smart contract level, which can be daily, weekly, monthly or annually.

<img src="https://i.ibb.co/9rwSVrg/vlcsnap-2024-02-03-23h23m14s888.png" width="32%">

Another important control of the savings account is the savings protocol, which for now is based on two main strategies, balanced and percentage.

<img src="https://i.ibb.co/DpYXpgg/vlcsnap-2024-02-03-23h23m21s258.png" width="32%"> 

- Balanced Protocol, this protocol performs a weighted rounding according to the amount to be paid in the transaction, so that the larger the transaction, the greater the savings, in order not to affect the user.

        export function balancedSavingToken(number, usd1, usd2) {
        // this function can be improved
        const balance = number * usd1;
        let amount = 0;
        if (balance <= 1) {
            amount = 1;
        } else if (balance > 1 && balance <= 10) {
            amount = Math.ceil(balance);
        } else if (balance > 10 && balance <= 100) {
            const intBalance = parseInt(balance, 10);
            const value = parseInt(Math.round(intBalance).toString().slice(-2), 10);
            let unit = parseInt(Math.round(intBalance).toString().slice(-1), 10);
            let decimal = parseInt(Math.round(intBalance).toString().slice(-2, -1), 10);
            if (unit < 5) {
            unit = '5';
            decimal = decimal.toString();
            } else {
            unit = '0';
            decimal = (decimal + 1).toString();
            }
            amount = intBalance - value + parseInt(decimal + unit, 10);
        } else if (balance > 100) {
            const intBalance = parseInt(Math.floor(balance / 10), 10);
            amount = (intBalance + 1) * 10;
        }
        return new Decimal(amount).sub(new Decimal(balance)).div(usd2).toNumber();
        }

- Percentage protocol, unlike the previous protocol, this one aims to always save a percentage selected in the UI.

        export function percentageSaving(number, percentage) {
        return number * (percentage / 100);
        }

# NFT Smart Contract Card:

This NFT Smart Contract Card integrates an abstraction wallet and NFT, providing a seamless and secure payment system for blockchain-based financial ecosystems with exclusive benefits tied to NFT ownership.

## Smart Contract:

* [Smart Contract](./Contracts/SaverCard.sol)

* [Deployment Example](https://phoenix.lightlink.io/token/0x531bBf90b1f691DB2CFe361fE2e8E30E7e77CDe1)

First, the contract must be capable of receiving any type of Assets, be it ETH, ERC20 Tokens and NFTs. So the following fallback functions were implemented for this.

    receive() external payable {} // Recieve Deposits

    fallback() external payable {} // Recieve Deposits if recieve doesn't work

Now it should be possible to make withdrawals from the contract to our wallet, so the transfer functions have been implemented for each asset.

    function transferNative(uint256 value, address payable to)
        public
        payable
        onlyOwner
    {
        require(address(this).balance >= value);
        require(withdrawnAvailable()); // Only withdraw if the savings period is valid
        to.transfer(value);
        startDate = timestamp();
    }

    // In case this smart contract recieve tokens or nfts as rewards

    function transferECR20(
        uint256 value,
        address to,
        address s_contract
    ) public onlyOwner {
        IERC20 ERC20Contract = IERC20(s_contract);
        require(ERC20Contract.balanceOf(address(this)) >= value);
        ERC20Contract.transfer(to, value);
    }

    function transferECR721(address to, address s_contract) public onlyOwner {
        ERC721 ERC721Contract = ERC721(s_contract);
        ERC721Contract.transferFrom(address(this), to, 0);
    }

NFT Implementation: The advantages of using an NFT instead of a traditional contract is being able to have the card data publicly available and being able to make easier terminal payments.

- Card Metadata Example:

      {
          "name": "Abstracted Card",
          "description": "This debit physical card integrates an abstraction wallet and NFT, providing a seamless and secure pay system for blockchain-based financial ecosystems with exclusive benefits tied to NFT ownership.",
          "image": "https://ipfs.io/ipfs/bafybeiaqbrwfzqvv5g3jn65sl67drincntk3i2j3ipcf3mtsgafesfpxxe/card-front.png"
      }

- Reading a VISA and Mastercard card are different at the code level.
  - [Read NFC Card Code](./LightsaverRN/src/screens/cardPayment/components/readCard.js)

- At the Front End level it allows us to personalize the card and improve user experience.

  <img src="https://i.ibb.co/Rcfxw8Z/image.png">

- NFC Card Payment:
  - To make payments through NFC of the contract we must make a call to our payment API, since this is combined with the Stripe interface to be able to make TradFi payments, this is done in the cloud through an AWS Lambda.
    - [AWS Lambda Code](./AWS_Lambda/index.mjs)
    - [POS API Call Code](./LightsaverRN/src/screens/cardPayment/cardPayment.js)

## Deposit and Withdraw:

Within our UI we can see the controls on how to add and remove money from our card, only the money that is on the card can be used to make payments.

<img src="https://i.ibb.co/8M3655N/vlcsnap-2024-02-03-23h23m27s257.png" width="32%"> 

In the case of payments between wallets, it is only necessary that the cell phone or POS has an NFC reader, then we enter the amount to pay and wait for the card to be placed on the reader.

<img src="https://i.ibb.co/vq1H3Xb/vlcsnap-2024-02-03-23h22m43s030-1.png" width="32%"> <img src="https://i.ibb.co/pjQwcpD/vlcsnap-2024-02-04-00h07m37s498.png" width="32%"> <img src="https://i.ibb.co/k4NS8Zv/vlcsnap-2024-02-04-00h07m43s579.png" width="32%"> 

Since our cards are dual, crypto and tradfi, we will have to select the payment protocol, in this case we will select ETH and once the transaction is completed we will be able to see the payment in the explorer.

<img src="https://i.ibb.co/jWtqRzG/vlcsnap-2024-02-04-00h07m46s631.png" width="32%"> <img src="https://i.ibb.co/BCRSDXJ/vlcsnap-2024-02-04-00h07m52s271.png" width="32%"> <img src="https://i.ibb.co/T4v5jHQ/vlcsnap-2024-02-04-00h07m58s702.png" width="32%"> 

# Blockscout Interactions:

Blockscount, in addition to being the main explorer of our project, thanks to the watch list we can have better control of the wallets and thus be able to send users emails every time a transaction is made.

<img src="https://i.ibb.co/LxmCSqN/image.png"> 

Furthermore, the API does not allow better integration with any system since we do not use any module such as Ethers.

<img src="https://i.ibb.co/hcR2T6G/image.png"> 

# Team

#### 3 Engineers with experience developing IoT and hardware solutions. We have been working together now for 5 years since University.

[<img src="https://img.shields.io/badge/Luis%20Eduardo-Arevalo%20Oliver-blue">](https://www.linkedin.com/in/luis-eduardo-arevalo-oliver-989703122/)

[<img src="https://img.shields.io/badge/Victor%20Alonso-Altamirano%20Izquierdo-lightgrey">](https://www.linkedin.com/in/alejandro-s%C3%A1nchez-guti%C3%A9rrez-11105a157/)

[<img src="https://img.shields.io/badge/Alejandro-Sanchez%20Gutierrez-red">](https://www.linkedin.com/in/victor-alonso-altamirano-izquierdo-311437137/)

## References:

https://finance.yahoo.com/news/58-americans-less-1-000-090000503.html
https://www.statista.com/chart/31435/household-savings-rate-in-selected-oecd-countries/
