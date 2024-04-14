# Lightsaver
 Lightsaver is a blockchain lending platform that empowers underserverd comunities through saving. With the ultimate goal of increasing financial inclusion. 

# System Diagram :

<img src="https://i.ibb.co/8cvsX01/Scheme-New-drawio.png">

The entire diagram explains all the data flows and services that our app has, although ambitious, it provides the following services.

- Cloud analysis of the user's financial habits.
- POS now compatible with TradFi and Crypto.
- Virtual and physical debit card to make both types of payments in our terminal.
- Smart Contract Wallets, which are already developed and deployed in solana.
- Microcredit facilitator based on data provided by Zillow.

WALLET CODE: [CODE](./WalletCode/)

WALLET APK: [APK](./WalletAPK/)

# Screens:

Lightsaver is a comprehensive platform to improve financial inclusion, educate users on the use of their money and provide a way to improve the user's credit history.

## Wallet:

The first screen that our solution incorporates is the main screen, which forms a traditional solana wallet, however including the assets that we will be using such as USD and MXN.

<img src="https://i.ibb.co/SvPyk2q/Screenshot-20240414-064547.png" width="32%">

## Smart Contract Wallets (Account Abstraction):

As we well know, today the adoption of crypto can be complicated, due to the difficulty for users to save their private keys, the only access to their assets and the difficult way to configure a wallet for the first time. Through Solana we were able to develop a SCW which allows us to manage all the user's credentials from the cloud, but allowing the user total freedom to move the assets at their convenience, but not stopping at this, we made two use cases of them in our app.

SMART CONTRACT CODE: [CODE](./SolanaProgram/card.rs)

### Savings:

The second screen that was developed was a smart contract wallet or PDA account, which allows us to intelligently save on each transaction made with any of our wallets or services within Lightsaver.

<img src="https://i.ibb.co/5YcWdK8/Screenshot-20240414-064550.png" width="32%"> <img src="https://i.ibb.co/PCdrSCt/Screenshot-20240414-064558.pngg" width="32%"> <img src="https://i.ibb.co/HYcdFgx/Screenshot-20240414-064602.png" width="32%">

### Cards:

The third screen that was developed was a virtual card in the same way as a smart contract wallet, which not only offers all the security advantages of solana, but is linked to our physical card and only this card will be able to make purchases in our POS points of sale.

<img src="https://i.ibb.co/XWZszSq/Screenshot-20240414-064606.png" width="32%"> <img src="https://i.ibb.co/hFxQptj/Screenshot-20240414-064609.png" width="32%">

## Lending:

Finally, we created a section where an analysis of all the transactions that have been made with the wallet will be carried out and comparing it with the Zillow databases, we will be able to offer a credit score that companies associated with Zillow can use to attract more users.

<img src="https://i.ibb.co/JK9sxY7/Screenshot-20240414-064656.png" width="32%"> <img src="https://i.ibb.co/pdDYHmh/Screenshot-20240414-064714.png" width="32%"> <img src="https://i.ibb.co/z67vys1/Screenshot-20240414-064614.png" width="32%">

We can see that depending on the score that the user has, they will have better offers, which they can accept from the app directly.

## Payment:

As we have said before, continuous analyzes of user fees are carried out in order to be able to increase credit history without requiring bank registration. So one way to encourage these payments was to include the ability to make TradFi and Crypto payments directly in the app.

<img src="https://i.ibb.co/NZwWvC9/Screenshot-20240414-064800.png" width="32%"> <img src="https://i.ibb.co/qNXBRHt/Screenshot-20240414-064806.png" width="32%"> <img src="https://i.ibb.co/SstYQKm/Screenshot-20240414-064813.png" width="32%"> 

You can see that it is as simple as using a traditional POS, but fully compatible with Tradfi and Crypto.

<img src="https://i.ibb.co/gZFn6Ph/Screenshot-20240414-064827.png" width="32%"> <img src="https://i.ibb.co/XCM3fhZ/Screenshot-20240414-064844.png" width="32%"> <img src="https://i.ibb.co/34vkf2W/Screenshot-20240414-064852.png" width="32%">

In addition, as it is a POS you can review the transaction online directly with the explorer in real time and at the same time print a physical ticket for the customer.








