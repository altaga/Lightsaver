[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE) [<img src="https://img.shields.io/badge/View-Video-red">](pending...)

# Lightsaver

Lightsaver, the sleek wallet designed for the LightLink network, combines cutting-edge security, multi-asset support, and intelligent savings features to offer a user-friendly and comprehensive solution for managing and growing your crypto portfolio.

<img src="https://i.ibb.co/RHKNnFQ/lightsaver-Logo.png" width="50%">

<br>

Welcome, this is our project for Encode x LightLink Gasless Hackathon.

# IMPORTANT!

- [Build a non-custodial wallet with a savings feature bounty](#savings-features)
-  [LightLink Deployment & Blockscout Interactions](#blockscout-interactions)

## Application:

Wallet APK: [LINK](./LightsaverAPK/app-release.apk)

Wallet RN Project: [LINK](./LightsaverRN/)

## Here is our main demo video:

[![Demo](https://i.ibb.co/g4W3ypx/image.png)](pending...)

# Introduction and Problem



# Solution

Lightsaver is a non-custodial wallet for smart savings with LightLink Network.

System's Architecture:

<img src="https://i.ibb.co/6vCnJzT/scheme-drawio-2.png">

- All LightLink transactions are controlled through [ethers@5.7](https://docs.ethers.org/v5/getting-started/) on mainnet.

- ChainLink is used for its price feeds for each of the most popular assets in the cryptocurrency market.

- Todo el diseño del los smart contracts se realizo en [RemixIDE](https://remix.ethereum.org/) y las librerias de [Chainlink](https://github.com/smartcontractkit/chainlink) y [Openzeppelin](https://www.openzeppelin.com/contracts).

Nuestra dapp cuenta con las funciones fundamentales de cualquier web3 wallet, tales como asset management y la visualización de NFTs. Sin embargo, la característica de ahorros permite guardar una pequeña cantidad de dinero cada vez que lleva a cabo una transacción. Como recompensa por sus esfuerzos de ahorro, los usuarios recibirán un NFT semanalmente.

# Main Screens:

<img src="https://i.ibb.co/znN5nCJ/Screenshot-20240130-155223.png" width="32%"> <img src="https://i.ibb.co/qj46w9q/Screenshot-20240130-155239.png" width="32%"> <img src="https://i.ibb.co/jJMJmTh/Screenshot-20240130-155244.png" width="32%">

- La pantalla principal tiene como funcion visualizar los assets en la wallet, su tipo de cambio en dolares y proveer los controles de mandar y recibir.

- A su vez la wallet no provee una sencilla interfaz para realizar pagos de nuestra wallet a cualquier otra wallet compatible con Lightlink.

- A su vez podemos recibir ETH o cualquier otro token nativo en la red de LightLink, ya sea directamente en nuestra address o en la cuenta de savings que veremos en la siguiente seccion.

# Savings Features:

Las funciones de savings en nuestra wallet tienen como fin lograr que el usuario ahorre con cada transaccion que realice en la wallet de forma personalizable. Por esto primero explicaremos como funciona el smart contract de la cuenta de savings.

## Smart Contract:

Lo primero y mas importante es el uso de un smart contract que sirva como wallet de ahorros, parecido a una smart contract wallet, la cual nos permite recibir cualquier tipo de asset.

* [Contract HERE](./Contracts/SaverAccount.sol)
* [Deployment Example]()

- Primero el contrato debe de ser capaz de recibir cualquier tipo de Assets, ya sea ETH, ERC20 Tokens y NFTs. Asi que se implementaron las siguientes funciones fallback para ello.

        receive() external payable {} // Recieve Deposits

        fallback() external payable {} // Recieve Deposits if recieve doesn't work

- Ahora se debe de poder realizar retiros desde el contrato a nuestra wallet, asi que se implementaron las funciones de transfer para cada asset.

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

- Por ultimo al ser una cuenta de savings tenemos que configurar funciones de tiempo, donde el usuario solo pueda sacar los fondos de la wallet despues de un tiempo determinado.

        // Utilities
        function timestamp() private view returns (uint256) {
            return block.timestamp;
        }

        function withdrawnAvailable() public view returns (bool) {
            return (period <= (timestamp() - startDate));
        }

- Por ultimo la Wallet realiza un registro en el contrato de los NFTs para poder proveerle de un NFT con su balance en savings cada, semana.

NFT Contract

        constructor(uint256 _period) {
            owner = msg.sender;
            ...
            SaverNFT InterfaceNFT = SaverNFT(saverAddressNFT);
            InterfaceNFT.addJedi(msg.sender);
        }

## Features and Strategies:

<img src="https://i.ibb.co/kXnrWW3/Screenshot-20240130-155229.png" width="32%"> 

## NFTs:

# Blockscout Interactions:



# Team

#### 3 Engineers with experience developing IoT and hardware solutions. We have been working together now for 5 years since University.

[<img src="https://img.shields.io/badge/Luis%20Eduardo-Arevalo%20Oliver-blue">](https://www.linkedin.com/in/luis-eduardo-arevalo-oliver-989703122/)

[<img src="https://img.shields.io/badge/Victor%20Alonso-Altamirano%20Izquierdo-lightgrey">](https://www.linkedin.com/in/alejandro-s%C3%A1nchez-guti%C3%A9rrez-11105a157/)

[<img src="https://img.shields.io/badge/Alejandro-Sanchez%20Gutierrez-red">](https://www.linkedin.com/in/victor-alonso-altamirano-izquierdo-311437137/)

## References:

