import {POLYGON_DATA_FEED_CONTRACT} from '@env';
import {ethers} from 'ethers';
import React, {Component} from 'react';
import {
  Dimensions,
  Keyboard,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import CreditCard from 'react-native-credit-card';
import {abiDataFeeds} from '../../../contracts/dataFeeds';
import {abiSaverCard, bytecodeSaverCard} from '../../../contracts/saverCard';
import GlobalStyles, {header} from '../../../styles/styles';
import {EVM, saverCardNFT} from '../../../utils/constants';
import {
  epsilonRound,
  getAsyncStorageValue,
  getEncryptedStorageValue,
  randomNumber,
  setAsyncStorageValue,
} from '../../../utils/utils';

const generator = require('creditcard-generator');

export default class Tab4 extends Component {
  constructor(props) {
    super(props);
    this.state = {
      // Addresses
      publicKey: '0x0000000000000000000000000000000000000000',
      cardAddress: '0x0000000000000000000000000000000000000000',
      // Account Details
      balance: ethers.BigNumber.from(0),
      usdETH: 0,
      // Card
      cvc: randomNumber(111, 999),
      expiry: '1226',
      name: 'Saver Card',
      number: generator.GenCC('VISA'),
      imageFront: require('../../../assets/cardAssets/card-front.png'),
      imageBack: require('.../../../assets/cardAssets/card-back.png'),
      // Utils
      loading: false,
      keyboardHeight: 0,
    };
    this.provider = new ethers.providers.JsonRpcProvider(EVM.rpc);
  }
  async componentDidMount() {
    Keyboard.addListener('keyboardDidShow', e =>
      this.setState({keyboardHeight: e.endCoordinates.height - header}),
    );
    Keyboard.addListener('keyboardDidHide', () =>
      this.setState({keyboardHeight: 0}),
    );
    const [cardAddress, publicKey, cardBalance] = await Promise.all([
      getAsyncStorageValue('cardAddress'),
      getAsyncStorageValue('publicKey'),
      getAsyncStorageValue('cardBalance'),
    ]);
    await this.setStateAsync({
      publicKey,
      cardAddress: cardAddress ?? '0x0000000000000000000000000000000000000000',
      balance: cardBalance ?? ethers.BigNumber.from(0),
    });
    console.log(this.state.cardAddress);
    if (
      this.state.cardAddress !== '0x0000000000000000000000000000000000000000'
    ) {
      this.refresh();
    }
  }

  refresh = async () => {
    this.getUSD();
    this.provider.getBalance(this.state.cardAddress).then(async balance => {
      balance = parseFloat(ethers.utils.formatEther(balance));
      await this.setStateAsync({balance});
      await setAsyncStorageValue({cardBalance: balance});
    });
  };

  componentWillUnmount() {
    Keyboard.removeAllListeners('keyboardDidShow');
    Keyboard.removeAllListeners('keyboardDidHide');
  }

  async createCard() {
    try {
      const privateKey = await getEncryptedStorageValue('privateKey');
      const signer = new ethers.Wallet(privateKey, this.provider);
      const factory = new ethers.ContractFactory(
        abiSaverCard,
        bytecodeSaverCard,
        signer,
      );
      const contract = await factory.deploy(saverCardNFT);
      await setAsyncStorageValue({
        cardAddress: contract.address,
      });
      await contract.deployTransaction.wait();
    } catch (err) {
      console.log(err);
    }
  }

  async addBalance() {
    let {chainId} = EVM;
    const privateKey = await getEncryptedStorageValue('privateKey');
    const signer = new ethers.Wallet(privateKey, this.provider);
    const nonce = await this.provider.getTransactionCount(this.state.publicKey);
    const gasPrice = await this.provider.getGasPrice();
    let transaction = {
      chainId,
      to: this.state.cardAddress,
      value: ethers.utils.parseEther(this.state.amountAdd),
      gasPrice,
      nonce,
    };
    const gas = await this.provider.estimateGas(transaction);
    transaction = {
      ...transaction,
      gasLimit: gas,
    };
    const tx = await signer.sendTransaction(transaction);
    await tx.wait();
  }

  async removeBalance() {
    let {chainId} = EVM;
    const privateKey = await getEncryptedStorageValue('privateKey');
    const signer = new ethers.Wallet(privateKey, this.provider);
    const tokenContract = new ethers.Contract(
      this.state.cardAddress,
      abiSaverCard,
      this.provider,
    );
    const nonce = await this.provider.getTransactionCount(this.state.publicKey);
    let encoder = new ethers.utils.Interface(abiSaverCard);
    const gasPrice = await this.provider.getGasPrice();
    let transaction = {
      chainId,
      from: this.state.publicKey,
      to: tokenContract,
      data: encoder.encodeFunctionData('transferNative', [
        this.state.address,
        ethers.utils.parseEther(this.state.amountRemove),
      ]),
      gasPrice,
      nonce,
    };
    const gas = await this.provider.estimateGas(transaction);
    transaction = {
      ...transaction,
      gasLimit: gas,
    };
    const tx = await signer.sendTransaction(transaction);
    await tx.wait();
  }

  async getUSD() {
    const provider = new ethers.providers.JsonRpcProvider(
      'https://polygon-mainnet.g.alchemy.com/v2/XXXXXXXXXXXXXXXXXX',
    );
    const dataFeeds = new ethers.Contract(
      POLYGON_DATA_FEED_CONTRACT,
      abiDataFeeds,
      provider,
    );
    const feedsUSD = await dataFeeds.getLatestPrices();
    const usdPrices = feedsUSD[0].map(
      (item, index) => parseFloat(item) * Math.pow(10, -feedsUSD[1][index]),
    );
    const res = {
      ETH: usdPrices[8],
    };
    this.setState({usdETH: res.ETH});
    await setAsyncStorageValue({usdETH: res.ETH});
  }

  // Utils
  async setStateAsync(value) {
    return new Promise(resolve => {
      this.setState(
        {
          ...value,
        },
        () => resolve(),
      );
    });
  }

  render() {
    return (
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{width: '100%', height: '100%'}}
        contentContainerStyle={{
          justifyContent: 'center',
          alignItems: 'center',
          paddingVertical: 0,
          paddingBottom:
            this.state.keyboardHeight > 0 ? this.state.keyboardHeight : 0,
        }}>
        {this.state.cardAddress ===
        '0x0000000000000000000000000000000000000000' ? (
          <React.Fragment>
            <Text style={[GlobalStyles.formTitle, {marginBottom: 15}]}>
              {'Create Smart Contract Card'}
            </Text>
            <Pressable
              disabled={this.state.loading}
              style={[
                GlobalStyles.buttonStyle,
                this.state.loading ? {opacity: 0.5} : {},
              ]}
              onPress={async () => {
                await this.setStateAsync({loading: true});
                await this.createCard();
                await this.setStateAsync({loading: false});
              }}>
              <Text style={GlobalStyles.buttonText}>
                {this.state.loading ? 'Deploying...' : 'Deploy'}
              </Text>
            </Pressable>
          </React.Fragment>
        ) : (
          <React.Fragment>
            <View style={{height: 180, marginVertical: 20}}>
              <CreditCard
                type={this.state.type}
                imageFront={this.state.imageFront}
                imageBack={this.state.imageBack}
                shiny={false}
                bar={false}
                number={this.state.number}
                name={this.state.name}
                expiry={this.state.expiry}
                cvc={this.state.cvc}
              />
            </View>
            <View
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                borderBottomWidth: 2,
                borderTopWidth: 2,
                paddingVertical: 15,
                marginBottom: 15,
                borderColor: '#0fb9f9',
                width: '90%',
              }}>
              <Text style={[GlobalStyles.exoTitle]}>Card Balance </Text>
              <Text style={{fontSize: 38, color: 'white', marginTop: 10}}>
                {`$ ${epsilonRound(
                  this.state.balance * this.state.usdETH,
                  2,
                )} USD`}
              </Text>
            </View>
            <View
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                borderBottomWidth: 2,
                paddingBottom: 15,
                marginBottom: 15,
                borderColor: '#0fb9f9',
                width: '90%',
              }}>
              <Text style={GlobalStyles.formTitle}>Add Balance</Text>
              <View
                style={{
                  width: '100%',
                  flexDirection: 'row',
                  justifyContent: 'space-evenly',
                  alignItems: 'center',
                }}>
                <TextInput
                  style={[GlobalStyles.input, {width: '60%'}]}
                  keyboardType="decimal-pad"
                  value={this.state.amountAdd}
                  onChangeText={value => this.setState({amountAdd: value})}
                />
                <Pressable
                  disabled={this.state.loading}
                  style={[
                    GlobalStyles.buttonStyle,
                    {width: '35%', padding: 10},
                    this.state.loading ? {opacity: 0.5} : {},
                  ]}
                  onPress={async () => {
                    await this.setStateAsync({loading: true});
                    await this.addBalance();
                    await this.setStateAsync({loading: false});
                    await this.refresh();
                  }}>
                  <Text style={[GlobalStyles.buttonText, {fontSize: 18}]}>
                    {this.state.loading ? 'Adding...' : 'Add'}
                  </Text>
                </Pressable>
              </View>
            </View>
            <View
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                borderBottomWidth: 0,
                paddingBottom: 15,
                marginBottom: 15,
                borderColor: '#0fb9f9',
                width: '90%',
              }}>
              <Text style={GlobalStyles.formTitle}>Remove Balance</Text>
              <View
                style={{
                  width: '100%',
                  flexDirection: 'row',
                  justifyContent: 'space-evenly',
                  alignItems: 'center',
                }}>
                <TextInput
                  style={[GlobalStyles.input, {width: '60%'}]}
                  keyboardType="decimal-pad"
                  value={this.state.amountRemove}
                  onChangeText={value => this.setState({amountRemove: value})}
                />
                <Pressable
                  disabled={this.state.loading}
                  style={[
                    GlobalStyles.buttonStyle,
                    {width: '35%', padding: 10},
                    this.state.loading ? {opacity: 0.5} : {},
                  ]}
                  onPress={async () => {
                    await this.setStateAsync({loading: true});
                    await this.removeBalance();
                    await this.setStateAsync({loading: false});
                    await this.refresh();
                  }}>
                  <Text style={[GlobalStyles.buttonText, {fontSize: 18}]}>
                    {this.state.loading ? 'Removing...' : 'Remove'}
                  </Text>
                </Pressable>
              </View>
            </View>
          </React.Fragment>
        )}
      </ScrollView>
    );
  }
}
