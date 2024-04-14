# Lightsaver
 Lightsaver is a blockchain lending platform that empowers underserverd comunities through saving. With the ultimate goal of increasing financial inclusion. 

# System Diagram :

<img src="https://i.ibb.co/Lx9PQ9J/scheme-New-drawio.png">

Todo el esquema explica todos los flujos de datos y servicios que tiene nuestra app, aunque ambiscioso, esta provee los siguientes servicios.

- Analisis en cloud de los habitos financieros del usuario.
- POS compatible ya con TradFi y Crypto.
- Tarjeta de debido virtual y fisica para realizar ambos tipos de pagos en nuestra terminal.
- Smart Contract Wallets, las cuales estan ya desarrolladas y desplegadas en solana.
- Facilitador de microcreditos basados en los datos proporcionados por Zillow.

WALLET CODE: [CODE](./WalletCode/)

WALLET APK: [APK](./WalletAPK/)

# Screens:

Lightsaver es una plataforma integral para mejorar la inclusion financiera, educar a los usuarios en el uso de su dinero y proveer una forma de mejorar el historial credicitio del usuario.

## Wallet:

La primera pantalla que comprende nuestra solucion es la pantalla principal, la cual conforma una wallet tradicional de solana, sin embargo incluyendo los assets que estaremos usando como USD y MXN.

<img src="https://i.ibb.co/SvPyk2q/Screenshot-20240414-064547.png" width="32%">

## Smart Contract Wallets (Account Abstraction):

Como bien sabemos, hoy en dia la adopcion de crypto puede ser complicada, debido a la dificultad de los usuarios de guardar sus claves privadas, el unico acesso a sus assets y la dificl forma de configurar por primera vez una wallet. Gracias a Solana pudimos desarrollar una SCW la cual nos permite manejar desde nube todas las credenciales del usuario, pero permitiendole a el total libertad de mover los assets a su conveniencia, pero no quedandonos en esto, realizamos dos casos de uso de las mismas en nuestra app.

SMART CONTRACT CODE: [CODE](./SolanaProgram/card.rs)

### Savings:

La segunda pantalla que se desarrollo, fue una smart contract wallet o cuenta PDA, la cual nos permite de forma inteligete, ahorrar en cada transaccion que se realize con cualquiera de nuestras wallets o servicios dentro de Lightsaver.

<img src="https://i.ibb.co/5YcWdK8/Screenshot-20240414-064550.png" width="32%"> <img src="https://i.ibb.co/PCdrSCt/Screenshot-20240414-064558.pngg" width="32%"> <img src="https://i.ibb.co/HYcdFgx/Screenshot-20240414-064602.png" width="32%">

### Cards:

La tercera pantalla que se desarrollo fue una tarjeta virtual de igual forma como una smart contract wallet, la cual no solo ofrece todas las ventajas de seguridad de solana, sino que esta esta ligada a nuestra tarjeta fisica y solo esta tarjeta podra realizar compras en nuestros puntos de venta POS.

<img src="https://i.ibb.co/XWZszSq/Screenshot-20240414-064606.png" width="32%"> <img src="https://i.ibb.co/hFxQptj/Screenshot-20240414-064609.png" width="32%">

## Lending:

Por ultimo realizamos una seccion donde se realizaran analisis de todas las transacciones que se hayan realizado con la wallet y comparandolo con las bases de datos de Zillow, podremos ofrecer un score de credito que las empresas asiciadas a Zillow podran usar para captar mas usuarios.

<img src="https://i.ibb.co/JK9sxY7/Screenshot-20240414-064656.png" width="32%"> <img src="https://i.ibb.co/pdDYHmh/Screenshot-20240414-064714.png" width="32%"> <img src="https://i.ibb.co/z67vys1/Screenshot-20240414-064614.png" width="32%">

Podemos ver que segun el score que el usuario tenga, este tendra mejores ofertas, las cuales podra aceptar desde la app directamente.

## Payment:

Como hemos dicho antes se relizan analisis continuos de los gatos de usuario con el fin de poder aumentar el historial crediticio sin requerir estar bancarisado. Entones una forma de incentivar estos pagos, fue incluyendo la capaidad de realizar cobros TradFi y Crypto directamente en la app.

<img src="https://i.ibb.co/NZwWvC9/Screenshot-20240414-064800.png" width="32%"> <img src="https://i.ibb.co/qNXBRHt/Screenshot-20240414-064806.png" width="32%"> <img src="https://i.ibb.co/SstYQKm/Screenshot-20240414-064813.png" width="32%"> 

Puden ver que es tan sencillo como usar un POS tradicional, pero completamente compatible con Tradfi y Crypto.

<img src="https://i.ibb.co/gZFn6Ph/Screenshot-20240414-064827.png" width="32%"> <img src="https://i.ibb.co/XCM3fhZ/Screenshot-20240414-064844.png" width="32%"> <img src="https://i.ibb.co/34vkf2W/Screenshot-20240414-064852.png" width="32%">

Ademas, al ser un POS podras revisar la transaccion en solana diorectamente con el explorer en tiempo real y a su vez imprimir un ticket fisico para el cliente.








