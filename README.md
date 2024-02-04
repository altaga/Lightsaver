[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE) [<img src="https://img.shields.io/badge/View-Video-red">](pending...)

# Lightsaver

Lightsaver, the sleek wallet designed for the LightLink network, combines cutting-edge security, multi-asset support, and intelligent savings features to offer a user-friendly and comprehensive solution for managing and growing your crypto portfolio.

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

[![Demo](https://i.ibb.co/g4W3ypx/image.png)](pending...)

# Introduction and Problem



# Solution

Lightsaver is a non-custodial wallet for smart savings, cashout ramp and card payments with LightLink Network.

System's Architecture:

<img src="https://i.ibb.co/sgWWTwb/scheme-drawio-3.png">

- All LightLink transactions are controlled through [ethers@5.7](https://docs.ethers.org/v5/getting-started/) on mainnet.

- ChainLink is used for its price feeds for each of the most popular assets in the cryptocurrency market.

-  Through [Stripe APIs](https://stripe.com/docs/api) debit card checkouts and virtual accounts.

- Todo el diseño del los smart contracts se realizo en [RemixIDE](https://remix.ethereum.org/) y las librerias de [Chainlink](https://github.com/smartcontractkit/chainlink) y [Openzeppelin](https://www.openzeppelin.com/contracts).

Nuestra dapp cuenta con las funciones fundamentales de cualquier web3 wallet, tales como asset management y la visualización de NFTs. Sin embargo, la característica de ahorros permite guardar una pequeña cantidad de dinero cada vez que lleva a cabo una transacción. Como recompensa por sus esfuerzos de ahorro, los usuarios recibirán un NFT semanalmente. Ademas poodras disponer de tus assets en cualquier momento mediante nuestro sistema de pagos con NFT Card, la cual podra ser usada para realizar pagos entre lightlink wallets.

# Main Screens:

<img src="https://i.ibb.co/2yXp1kC/vlcsnap-2024-02-03-23h22m43s030.png" width="32%"> <img src="https://i.ibb.co/qj46w9q/Screenshot-20240130-155239.png" width="32%"> <img src="https://i.ibb.co/jJMJmTh/Screenshot-20240130-155244.png" width="32%">

- La pantalla principal tiene como funcion visualizar los assets en la wallet, su tipo de cambio en dolares y proveer los controles de mandar y recibir.

- A su vez la wallet no provee una sencilla interfaz para realizar pagos de nuestra wallet a cualquier otra wallet compatible con Lightlink.

- A su vez podemos recibir ETH o cualquier otro token nativo en la red de LightLink, ya sea directamente en nuestra address o en la cuenta de savings que veremos en la siguiente seccion.

# Savings Features:

Las funciones de savings en nuestra wallet tienen como fin lograr que el usuario ahorre con cada transaccion que realice en la wallet de forma personalizable. Por esto primero explicaremos como funciona el smart contract de la cuenta de savings.

## Smart Contract:

Lo primero y mas importante es el uso de un smart contract que sirva como wallet de ahorros, parecido a una smart contract wallet, la cual nos permite recibir cualquier tipo de asset.

* [Smart Contract](./Contracts/SaverAccount.sol)
* [Deployment Example](https://phoenix.lightlink.io/address/0x74c26425961A3CF6f0551767D88Cc21F365CB639)

Primero el contrato debe de ser capaz de recibir cualquier tipo de Assets, ya sea ETH, ERC20 Tokens y NFTs. Asi que se implementaron las siguientes funciones fallback para ello.

    receive() external payable {} // Recieve Deposits

    fallback() external payable {} // Recieve Deposits if recieve doesn't work

Ahora se debe de poder realizar retiros desde el contrato a nuestra wallet, asi que se implementaron las funciones de transfer para cada asset.

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

Por ultimo al ser una cuenta de savings tenemos que configurar funciones de tiempo, donde el usuario solo pueda sacar los fondos de la wallet despues de un tiempo determinado.

    // Utilities
    function timestamp() private view returns (uint256) {
        return block.timestamp;
    }

    function withdrawnAvailable() public view returns (bool) {
        return (period <= (timestamp() - startDate));
    }

Por ultimo la Wallet realiza un registro en el contrato de los NFTs para poder proveerle de un NFT con su balance en savings cada, semana.

* [Smart Contract](./Contracts/SaverNFT.sol)
* [Deployment Example](https://phoenix.lightlink.io/token/0x8Da0bb16b869EE966bcF00aef7db9bEaA67eE511)

        constructor(uint256 _period) {
            owner = msg.sender;
            ...
            SaverNFT InterfaceNFT = SaverNFT(saverAddressNFT);
            InterfaceNFT.addJedi(msg.sender);
        }

## Features and Strategies:

Por parte de nuestra UI tenemos varios controles para poder personalizar la exeriencia de la cuenta de ahorros, como encender y apagar la funcion de ahorros o realizar el automint de el weekely NFT.

[Interface Code](./LightsaverRN/src/screens/main/tabs/tab2.js)

<img src="https://i.ibb.co/kXnrWW3/Screenshot-20240130-155229.png" width="32%"> 

Uno de los controles mas importates de nuestra wallet es poder cambiar a nivel de smart contract el periodo de savings, el cual puede ser diario, semanal, mensual o anual.

<img src="https://i.ibb.co/9rwSVrg/vlcsnap-2024-02-03-23h23m14s888.png" width="32%">

Otro de los controles importantes de la savings account es el protocolo de ahorros, el cual por ahora esta basado en dos estrategias principales, balanceado y porcentual.

<img src="https://i.ibb.co/DpYXpgg/vlcsnap-2024-02-03-23h23m21s258.png" width="32%"> 

- Protocolo Balanceado, este protocolo realiza un redondeo ponderado segun la cantidad que se vaya a pagar en la transaccion, de forma que a mayor sea la transaccion, el ahorro sea mayor, con el fin de no afectar al usuario.

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

- Protocolo porcentual, a diferencia del protocolo anterior este tiene como fin ahorrar siempre un porcentaje seleccionado en la UI.

        export function percentageSaving(number, percentage) {
        return number * (percentage / 100);
        }

# NFT Smart Contract Card:

This NFT Smart Contract Card integrates an abstraction wallet and NFT, providing a seamless and secure payment system for blockchain-based financial ecosystems with exclusive benefits tied to NFT ownership.

## Smart Contract:

* [Smart Contract](./Contracts/SaverCard.sol)

* [Deployment Example](https://phoenix.lightlink.io/token/0x531bBf90b1f691DB2CFe361fE2e8E30E7e77CDe1)

Primero el contrato debe de ser capaz de recibir cualquier tipo de Assets, ya sea ETH, ERC20 Tokens y NFTs. Asi que se implementaron las siguientes funciones fallback para ello.

    receive() external payable {} // Recieve Deposits

    fallback() external payable {} // Recieve Deposits if recieve doesn't work

Ahora se debe de poder realizar retiros desde el contrato a nuestra wallet, asi que se implementaron las funciones de transfer para cada asset.

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

NFT Implementation: The advantages of using an NFT instead of a traditional contract is being able to have the card data publicly available and being able to make payments at the terminal more easily.

- Card Metadata Example:

      {
          "name": "Abstracted Card",
          "description": "This debit physical card integrates an abstraction wallet and NFT, providing a seamless and secure pay system for blockchain-based financial ecosystems with exclusive benefits tied to NFT ownership.",
          "image": "https://ipfs.io/ipfs/bafybeiaqbrwfzqvv5g3jn65sl67drincntk3i2j3ipcf3mtsgafesfpxxe/card-front.png"
      }

- Reading a VISA and Mastercard card are different at the code level.
  - [Read NFC Card Code](./LightsaverRN/src/screens/cardPayment/components/readCard.js)

- At the Front End level it allows us to personalize the card and improve the user experience.

  <img src="https://i.ibb.co/Rcfxw8Z/image.png">

- NFC Card Payment:
  - To make payments through NFC of the contract we must make a call to our payment API, since this is combined with the Stripe interface to be able to make TradFi payments, this is done in the cloud through an AWS Lambda.
    - [AWS Lambda Code](./AWS_Lambda/index.mjs)
    - [POS API Call Code](./LightsaverRN/src/screens/cardPayment/cardPayment.js)

## Deposit and Withdraw:

Dentro de nuestra UI podemos ver los controles de como agregar y quitarle dinero a nuestra tarjeta, solo el dinero que este en la tarjeta podra ser usado para realizar pagos.

<img src="https://i.ibb.co/8M3655N/vlcsnap-2024-02-03-23h23m27s257.png" width="32%"> 

En el caso de los pagos entre wallets solo es necesario que el celular o POS tenga un lector NFC, posteriormente pongamos la cantidad a pagar y esperar a que se hacerque la tarjeta al lector.

<img src="https://i.ibb.co/vq1H3Xb/vlcsnap-2024-02-03-23h22m43s030-1.png" width="32%"> <img src="https://i.ibb.co/pjQwcpD/vlcsnap-2024-02-04-00h07m37s498.png" width="32%"> <img src="https://i.ibb.co/k4NS8Zv/vlcsnap-2024-02-04-00h07m43s579.png" width="32%"> 

Ya que nuestras tarjetas son duales, crypto y tradfi, tendremos que seleccionar el protocolo de pago, en este caso seleciconaremos ETH y una vez realizada la tranaccion podremos ver el pago en el explorer.

<img src="https://i.ibb.co/jWtqRzG/vlcsnap-2024-02-04-00h07m46s631.png" width="32%"> <img src="https://i.ibb.co/BCRSDXJ/vlcsnap-2024-02-04-00h07m52s271.png" width="32%"> <img src="https://i.ibb.co/T4v5jHQ/vlcsnap-2024-02-04-00h07m58s702.png" width="32%"> 

# Blockscout Interactions:

Blockscount ademas de ser el explorer principal de nuestro proyecto, gracias a la watch list podemos tener un mejor control de las wallets y asi poder mandar a los usuarios correos cada vez que se realiza una transaccion.

<img src="https://i.ibb.co/LxmCSqN/image.png"> 

Ademas la API no permite una mejor intgracion con cualquier sistema ya que no ocupamos ningun modulo como lo es Ethers.

<img src="https://i.ibb.co/hcR2T6G/image.png"> 

# Team

#### 3 Engineers with experience developing IoT and hardware solutions. We have been working together now for 5 years since University.

[<img src="https://img.shields.io/badge/Luis%20Eduardo-Arevalo%20Oliver-blue">](https://www.linkedin.com/in/luis-eduardo-arevalo-oliver-989703122/)

[<img src="https://img.shields.io/badge/Victor%20Alonso-Altamirano%20Izquierdo-lightgrey">](https://www.linkedin.com/in/alejandro-s%C3%A1nchez-guti%C3%A9rrez-11105a157/)

[<img src="https://img.shields.io/badge/Alejandro-Sanchez%20Gutierrez-red">](https://www.linkedin.com/in/victor-alonso-altamirano-izquierdo-311437137/)

## References:

