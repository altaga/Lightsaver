import {POLYGON_DATA_FEED_CONTRACT, URL_AWS} from '@env';
import {ethers} from 'ethers';
import React, {Component} from 'react';
import reactAutobind from 'react-autobind';
import {Dimensions, Image, Linking, Pressable, Text, View} from 'react-native';
import VirtualKeyboard from 'react-native-virtual-keyboard';
import Renders from '../../assets/logo.png';
import {abiDataFeeds} from '../../contracts/dataFeeds';
import GlobalStyles from '../../styles/styles';
import ContextModule from '../../utils/contextModule';
import {
  deleteLeadingZeros,
  epsilonRound,
  formatInputText,
  getAsyncStorageValue,
  setAsyncStorageValue,
} from '../../utils/utils';
import ReadCard from './components/readCard';
import {EVM} from '../../utils/constants';
import checkMark from '../../assets/checkMark.png';

const baseStateCardPayment = {
  // Addresses
  publicKey: '0x0000000000000000000000000000000000000000',
  cardAddress: '0x0000000000000000000000000000000000000000',
  stage: 0, // 0
  text: '0.00', // "0.00"
  cardInfo: null,
  usdETH: 1,
};

function setTokens(array) {
  return array.map((item, index) => {
    return {
      ...item,
      value: index,
      label: item.name,
      key: item.symbol,
    };
  });
}

export default class CardPayment extends Component {
  constructor(props) {
    super(props);
    this.state = baseStateCardPayment;
    reactAutobind(this);
    this.provider = new ethers.providers.JsonRpcProvider(EVM.rpc);
  }

  static contextType = ContextModule;

  componentDidMount() {
    this.props.navigation.addListener('focus', async () => {
      this.context.setValue({
        page: this.props.route.name,
      });
      console.log(this.props.route.name);
      await this.setStateAsync(baseStateCardPayment);
      const publicKey = await getAsyncStorageValue('publicKey');
      const savingsAccount = await getAsyncStorageValue('savingsAccount');
      await this.setStateAsync({
        publicKey: publicKey,
        savingsAccount:
          savingsAccount ?? '0x0000000000000000000000000000000000000000',
      });
      await this.getUSD();
    });
  }

  changeText(newText) {
    this.setState({text: newText});
  }

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
    await this.setStateAsync({usdETH: res.ETH});
    await setAsyncStorageValue({usdETH: res.ETH});
  }

  async payETH() {
    return new Promise(async (resolve, reject) => {
      var myHeaders = new Headers();
      myHeaders.append('Content-Type', 'application/json');

      var raw = JSON.stringify({
        amount: epsilonRound(
          parseFloat(this.state.text) / this.state.usdETH,
          18,
        ),
        currency: 'ETH',
        address: this.state.publicKey,
        addressCard: '0x531bBf90b1f691DB2CFe361fE2e8E30E7e77CDe1',
      });
      console.log(raw);

      var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow',
      };

      fetch(
        `https://${URL_AWS}.execute-api.us-east-1.amazonaws.com/pay-with-card`,
        requestOptions,
      )
        .then(response => response.json())
        .then(async result => {
          console.log(result);
          const {tx} = result;
          console.log(tx);
          // Wait for the transaction to be mined
          await new Promise(resolver => {
            const interval = setInterval(async () => {
              const txReceipt = await this.provider.getTransactionReceipt(tx);
              if (txReceipt && txReceipt.blockNumber) {
                resolver(txReceipt);
                clearInterval(interval);
              }
            }, 1000);
          });
          // Update the state with the transaction hash
          this.setState(
            {tx, stage: 3, explorerURL: `${EVM.blockExplorer}tx/${tx}`},
            () => resolve('ok'),
          );
        })
        .catch(error => console.log('error', error));
    });
  }

  render() {
    return (
      <View style={GlobalStyles.container}>
        <View
          style={[
            GlobalStyles.headerMain,
            {
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignContent: 'center',
            },
          ]}>
          <View style={GlobalStyles.headerItem}>
            <Image
              source={Renders}
              alt="Cat"
              style={{width: 304 / 6, height: 342 / 6, marginLeft: 20}}
            />
          </View>
          <View style={GlobalStyles.headerItem} />
          <View style={GlobalStyles.headerItem}>
            <Pressable
              style={GlobalStyles.buttonLogoutStyle}
              onPress={() => {
                this.props.navigation.goBack();
              }}>
              <Text style={GlobalStyles.headerTextButton}>Return</Text>
            </Pressable>
          </View>
        </View>
        <View
          style={[
            GlobalStyles.mainSend,
            {justifyContent: 'space-around', alignItems: 'center'},
          ]}>
          {this.state.stage === 0 && (
            <View
              style={{
                flex: Dimensions.get('window').height - 100,
                justifyContent: 'space-evenly',
                alignItems: 'center',
              }}>
              <Text style={GlobalStyles.title}>Enter Amount (USD)</Text>
              <Text style={{fontSize: 36, color: 'white'}}>
                {deleteLeadingZeros(formatInputText(this.state.text))}
              </Text>
              <VirtualKeyboard
                style={{
                  width: '80vw',
                  fontSize: 40,
                  textAlign: 'center',
                  marginTop: -10,
                }}
                cellStyle={{
                  width: 50,
                  height: 50,
                  borderWidth: 1,
                  borderColor: '#77777777',
                  borderRadius: 5,
                  margin: 1,
                }}
                color="white"
                pressMode="string"
                onPress={val => this.changeText(val)}
                decimal
              />
              <View
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'space-evenly',
                  width: Dimensions.get('window').width,
                }}>
                <Pressable
                  style={GlobalStyles.buttonStyle}
                  onPress={() => this.setState({stage: 1})}>
                  <Text style={GlobalStyles.buttonText}>Pay with Card</Text>
                </Pressable>
              </View>
            </View>
          )}
          {this.state.stage === 1 && (
            <React.Fragment>
              <View
                style={{
                  justifyContent: 'space-evenly',
                  alignItems: 'center',
                }}>
                <Text style={GlobalStyles.title}>Amount</Text>
                <Text style={{fontSize: 36, color: 'white'}}>
                  $ {deleteLeadingZeros(formatInputText(this.state.text))}
                </Text>
              </View>
              <ReadCard
                cardInfo={cardInfo => {
                  if (cardInfo) {
                    this.setState({stage: 2, cardInfo});
                  }
                }}
              />
            </React.Fragment>
          )}
          {this.state.stage === 2 && (
            <View
              style={{
                flex: 1,
                justifyContent: 'space-evenly',
                alignItems: 'center',
              }}>
              <Text style={GlobalStyles.title}>{'Select\nPayment Method'}</Text>
              <Pressable
                disabled={this.state.loading}
                style={[
                  GlobalStyles.buttonStyle,
                  this.state.loading ? {opacity: 0.5} : {},
                ]}
                onPress={async () => {
                  await this.setStateAsync({loading: true});
                  await this.payETH();
                  await this.setStateAsync({loading: false});
                }}>
                <Text style={GlobalStyles.buttonText}>Pay with ETH</Text>
              </Pressable>
              <Pressable
                disabled={this.state.loading}
                style={[
                  GlobalStyles.buttonStyle,
                  this.state.loading ? {opacity: 0.5} : {},
                ]}
                onPress={async () => {
                  await this.setStateAsync({loading: true});
                  await this.payUSD();
                  await this.setStateAsync({loading: false});
                }}>
                <Text style={GlobalStyles.buttonText}>Pay with $USD</Text>
              </Pressable>
            </View>
          )}
          {this.state.stage === 3 && (
            <View
              style={{
                flex: 1,
                justifyContent: 'space-evenly',
                alignItems: 'center',
              }}>
              <Image
                source={checkMark}
                alt="check"
                style={{width: 200, height: 200}}
              />
              <Text
                style={{
                  textShadowRadius: 1,
                  fontSize: 28,
                  fontWeight: 'bold',
                  color:
                    this.state.status === 'Confirmed' ? '#0fb9f9' : '#6978ff',
                }}>
                {this.state.status}
              </Text>
              <View
                style={[
                  GlobalStyles.network,
                  {width: Dimensions.get('screen').width * 0.9},
                ]}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-around',
                  }}>
                  <View style={{marginHorizontal: 20}}>
                    <Text style={{fontSize: 20, color: 'white'}}>
                      {EVM.network}
                    </Text>
                    <Text style={{fontSize: 14, color: 'white'}}>
                      eth_cardTransaction
                    </Text>
                  </View>
                </View>
                <View
                  style={{
                    marginHorizontal: 20,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <View style={{marginHorizontal: 10}}>
                    {setTokens(EVM.tokens)[0].icon}
                  </View>
                  <Text style={{color: 'white'}}>
                    {`${epsilonRound(
                      deleteLeadingZeros(formatInputText(this.state.text)),
                      4,
                    )}`}{' '}
                    {'USD'}
                  </Text>
                </View>
              </View>
              <View>
                <Pressable
                  disabled={this.state.explorerURL === ''}
                  style={[
                    GlobalStyles.buttonStyle,
                    this.state.explorerURL === '' ? {opacity: 0.5} : {},
                  ]}
                  onPress={() => Linking.openURL(this.state.explorerURL)}>
                  <Text
                    style={{
                      fontSize: 24,
                      fontWeight: 'bold',
                      color: 'white',
                      textAlign: 'center',
                    }}>
                    View on Explorer
                  </Text>
                </Pressable>
                <Pressable
                  style={[
                    GlobalStyles.buttonStyle,
                    {
                      backgroundColor: '#6978ff',
                    },
                    this.state.explorerURL === '' ? {opacity: 0.5} : {},
                  ]}
                  onPress={() => {
                    this.props.navigation.goBack();
                  }}
                  disabled={this.state.explorerURL === ''}>
                  <Text
                    style={{
                      color: 'white',
                      fontSize: 24,
                      fontWeight: 'bold',
                    }}>
                    Done
                  </Text>
                </Pressable>
              </View>
            </View>
          )}
        </View>
      </View>
    );
  }
}
