import {POLYGON_DATA_FEED_CONTRACT, POLYGON_DATA_FEED_URL} from '@env';
import {Connection, LAMPORTS_PER_SOL, PublicKey} from '@solana/web3.js';
import {ethers} from 'ethers';
import React, {Component} from 'react';
import {
  Keyboard,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import CreditCard from 'react-native-credit-card';
import {abiDataFeeds} from '../../../contracts/dataFeeds';
import GlobalStyles from '../../../styles/styles';
import {blockchain} from '../../../utils/constants';
import {
  arraySum,
  epsilonRound,
  getAsyncStorageValue,
  randomNumber,
  setAsyncStorageValue,
} from '../../../utils/utils';

const generator = require('creditcard-generator');

export default class Tab3 extends Component {
  constructor(props) {
    super(props);
    this.state = {
      // Addresses
      publicKey: new PublicKey('11111111111111111111111111111111'),
      publicKeyCard: new PublicKey('11111111111111111111111111111111'),
      // Account Details
      balancesCard: [0, 0, 0],
      usdConversionCard: [1, 1, 1],
      // Card
      cvc: randomNumber(111, 999),
      expiry: '1226',
      name: 'Jedi Card',
      number: generator.GenCC('VISA'),
      imageFront: require('../../../assets/cardAssets/card-front.png'),
      imageBack: require('.../../../assets/cardAssets/card-back.png'),
      // Utils
      loading: false,
      keyboardHeight: 0,
    };
    this.connection = new Connection(blockchain.rpc, 'confirmed');
  }
  async componentDidMount() {
    const [publicKey, publicKeyCard, balancesCard, usdConversionCard] =
      await Promise.all([
        getAsyncStorageValue('publicKey'),
        getAsyncStorageValue('publicKeyCard'),
        getAsyncStorageValue('balancesCard'),
        getAsyncStorageValue('usdConversionCard'),
      ]);
    await this.setStateAsync({
      publicKey: new PublicKey(publicKey ?? '11111111111111111111111111111111'),
      publicKeyCard: new PublicKey(
        publicKeyCard ?? '11111111111111111111111111111111',
      ),
      balancesCard: balancesCard ?? [0, 0, 0],
      usdConversionCard: usdConversionCard ?? [1, 1, 1],
    });
    this.refresh();
  }

  refresh = async () => {
    this.getUSD();
    this.getBalances();
  };

  async getBalances() {
    let {balancesCard} = this.state;
    balancesCard[0] =
      (await this.connection.getBalance(this.state.publicKeyCard)) /
      LAMPORTS_PER_SOL;
    await this.setStateAsync({balancesCard});
    await setAsyncStorageValue({balancesCard});
  }

  componentWillUnmount() {
    Keyboard.removeAllListeners('keyboardDidShow');
    Keyboard.removeAllListeners('keyboardDidHide');
  }

  async createCard() {}

  async addBalance() {}

  async removeBalance() {}

  async getUSD() {
    try {
      const provider = new ethers.providers.JsonRpcProvider(
        `${POLYGON_DATA_FEED_URL}`,
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
        SOL: usdPrices[11],
        USDT: usdPrices[13],
        USDC: usdPrices[12],
      };
      this.setState({usdConversionCard: [res.SOL, res.USDC, res.USDT]}); // Peso to Dollar to be done
      await setAsyncStorageValue({
        usdConversionCard: this.state.usdConversionCard,
      });
    } catch (err) {
      console.log(err);
    }
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
                arraySum(
                  this.state.balancesCard.map(
                    (x, i) => x * this.state.usdConversionCard[i],
                  ),
                ),
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
      </ScrollView>
    );
  }
}
