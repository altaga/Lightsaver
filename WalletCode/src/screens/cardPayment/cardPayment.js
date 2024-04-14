import {POLYGON_DATA_FEED_CONTRACT, POLYGON_DATA_FEED_URL} from '@env';
import {LAMPORTS_PER_SOL} from '@solana/web3.js';
import {ethers} from 'ethers';
import React, {Component} from 'react';
import {Dimensions, Image, Linking, Pressable, Text, View} from 'react-native';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import RNPrint from 'react-native-print';
import QRCode from 'react-native-qrcode-svg';
import VirtualKeyboard from 'react-native-virtual-keyboard';
import checkMark from '../../assets/checkMark.png';
import {logo} from '../../assets/extraLogos/logo';
import Renders from '../../assets/logo.png';
import {abiDataFeeds} from '../../contracts/dataFeeds';
import GlobalStyles, {footer, header, main} from '../../styles/styles';
import {blockchain} from '../../utils/constants';
import ContextModule from '../../utils/contextModule';
import {
  deleteLeadingZeros,
  epsilonRound,
  formatInputText,
  getAsyncStorageValue,
  setAsyncStorageValue,
} from '../../utils/utils';
import ReadCard from './components/readCard';

const baseStateCardPayment = {
  // Addresses
  publicKey: '11111111111111111111111111111111',
  cardAddress: '11111111111111111111111111111111',
  stage: 0, // 0
  text: '0.00', // "0.00"
  cardInfo: null,
  usdSOL: 1,
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
    this.svg = null;
  }

  async getDataURL() {
    return new Promise(async (resolve, reject) => {
      this.svg.toDataURL(async data => {
        this.setState(
          {
            printData: 'data:image/png;base64,' + data,
          },
          () => resolve('ok'),
        );
      });
    });
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
      await this.setStateAsync({
        publicKey: publicKey ?? '11111111111111111111111111111111',
      });
      console.log(this.state.publicKey);
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
    };
    await this.setStateAsync({usdSOL: res.SOL});
    await setAsyncStorageValue({usdSOL: res.SOL});
  }

  async paySOL() {
    return new Promise(async (resolve, reject) => {
      const myHeaders = new Headers();
      myHeaders.append('Content-Type', 'application/json');

      const raw = JSON.stringify({
        cardHash: this.state.cardInfo.card + this.state.cardInfo.exp,
        to: this.state.publicKey,
        amount: parseInt(
          (parseFloat(this.state.text) / this.state.usdSOL) * LAMPORTS_PER_SOL,
        ),
      });

      console.log(raw);

      const requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow',
      };

      fetch(
        'https://lf2w3laarl.execute-api.us-east-1.amazonaws.com/send-transaction-contactless',
        requestOptions,
      )
        .then(response => response.text())
        .then(async result => {
          console.log(result);
          // Update the state with the transaction hash
          this.setState({stage: 3, explorerURL: result}, () => resolve('ok'));
        })
        .catch(error => console.log('error', error));
    });
  }

  render() {
    return (
      <>
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
              {
                justifyContent: 'space-evenly',
                marginTop: header + 10,
                alignItems: 'center',
                height: main + footer - 20,
              },
            ]}>
            {this.state.stage === 0 && (
              <View
                style={{
                  flex: Dimensions.get('window').height - 100,
                  justifyContent: 'space-around',
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
                <Text style={GlobalStyles.title}>
                  {'Select\nPayment Method'}
                </Text>
                <Pressable
                  disabled={this.state.loading}
                  style={[
                    GlobalStyles.buttonStyle,
                    this.state.loading ? {opacity: 0.5} : {},
                  ]}
                  onPress={async () => {
                    await this.setStateAsync({loading: true});
                    await this.paySOL();
                    await this.setStateAsync({loading: false});
                  }}>
                  <Text style={GlobalStyles.buttonText}>Pay with SOL</Text>
                </Pressable>
                <Pressable
                  disabled={this.state.loading}
                  style={[
                    GlobalStyles.buttonStyle,
                    this.state.loading ? {opacity: 0.5} : {},
                  ]}
                  onPress={async () => {
                    await this.setStateAsync({loading: true});
                    await this.setStateAsync({loading: false});
                  }}>
                  <Text style={GlobalStyles.buttonText}>Pay with $MXN</Text>
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
                        {blockchain.network}
                      </Text>
                      <Text style={{fontSize: 14, color: 'white'}}>
                        solana_cardTransaction
                      </Text>
                    </View>
                  </View>
                  <View
                    style={{
                      marginHorizontal: 10,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                    <View style={{marginHorizontal: 5}}>
                      {setTokens(blockchain.tokens)[0].icon}
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
                    onPress={async () => {
                      await this.getDataURL();
                      const results = await RNHTMLtoPDF.convert({
                        html: `
                                          <div style="text-align: center;">
                                          <h1 style="font-size: 3rem;">------------------ • ------------------</h1>
                                              <img src='${logo}' width="500px"></img>
                                              <h1 style="font-size: 3rem;">--------- Original Reciept ---------</h1>
                                              <h1 style="font-size: 3rem;">Date: ${new Date().toLocaleDateString()}</h1>
                                              <h1 style="font-size: 3rem;">------------------ • ------------------</h1>
                                              <h1 style="font-size: 3rem;">Solana Card</h1>
                                              <h1 style="font-size: 3rem;">Amount: ${
                                                epsilonRound(
                                                  parseFloat(this.state.text) /
                                                    this.state.usdSOL,
                                                  4,
                                                ).toString() +
                                                ' ' +
                                                blockchain.tokens[0].symbol
                                              }</h1>
                                              <h1 style="font-size: 3rem;">------------------ • ------------------</h1>
                                              <img src='${
                                                this.state.printData
                                              }'></img>
                                          </div>
                                          `,
                        fileName: 'print',
                        base64: true,
                      });
                      await RNPrint.print({filePath: results.filePath});
                    }}>
                    <Text
                      style={{
                        fontSize: 24,
                        fontWeight: 'bold',
                        color: 'white',
                        textAlign: 'center',
                      }}>
                      Print Receipt
                    </Text>
                  </Pressable>
                  <Pressable
                    disabled={this.state.explorerURL === ''}
                    style={[
                      GlobalStyles.buttonStyle,
                      {backgroundColor: '#6978ff'},
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
                        backgroundColor: '#ff689e',
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
        <View style={{position: 'absolute', bottom: -500}}>
          <QRCode
            value={this.state.explorerURL}
            size={Dimensions.get('window').width * 0.7}
            ecl="L"
            getRef={c => (this.svg = c)}
          />
        </View>
      </>
    );
  }
}
