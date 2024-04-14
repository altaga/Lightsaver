import React, {Component} from 'react';
import {Pressable, RefreshControl, ScrollView, Text, View} from 'react-native';
import IconIonicons from 'react-native-vector-icons/Ionicons';
import GlobalStyles from '../../../styles/styles';
import ContextModule from '../../../utils/contextModule';
import {
  arraySum,
  epsilonRound,
  getAsyncStorageValue,
  setAsyncStorageValue,
} from '../../../utils/utils';
import {blockchain, tradFi} from '../../../utils/constants';
import {Connection, LAMPORTS_PER_SOL, PublicKey} from '@solana/web3.js';
import {POLYGON_DATA_FEED_URL, POLYGON_DATA_FEED_CONTRACT} from '@env';
import {ethers} from 'ethers';
import {abiDataFeeds} from '../../../contracts/dataFeeds';

const TOKEN_PROGRAM_ID = new PublicKey(
  'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
);
const ASSOCIATED_TOKEN_PROGRAM_ID = new PublicKey(
  'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL',
);

class Tab1 extends Component {
  constructor(props) {
    super(props);
    this.state = {
      refreshing: false,
      publicKey: new PublicKey('11111111111111111111111111111111'),
      balances: [0, 0, 0, 1500, 86.5],
      usdConversion: [1, 1, 1, 0.06, 1],
      nfcSupported: true,
    };
    this.connection = new Connection(blockchain.rpc, 'confirmed');
  }
  static contextType = ContextModule;

  async componentDidMount() {
    const publicKey = await getAsyncStorageValue('publicKey');
    const balances = await getAsyncStorageValue('balances');
    const usdConversion = await getAsyncStorageValue('usdConversion');
    await this.setStateAsync({
      publicKey: new PublicKey(publicKey),
      balances: balances ?? [0, 0, 0, 1500, 86.5],
      usdConversion: usdConversion ?? [1, 1, 1, 0.06, 1],
    });
    //this.refresh();
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

  async refresh() {
    await this.setStateAsync({refreshing: true});
    await this.getUSD();
    await this.getBalances();
    await this.setStateAsync({refreshing: false});
  }

  // Get Balances

  async getBalances() {
    let {balances} = this.state;
    balances[0] =
      (await this.connection.getBalance(this.state.publicKey)) /
      LAMPORTS_PER_SOL;
    let tempTokens = [...blockchain.tokens];
    tempTokens.shift();
    let [usdc, usdt] = tempTokens.map(token =>
      PublicKey.findProgramAddressSync(
        [
          this.state.publicKey.toBuffer(),
          TOKEN_PROGRAM_ID.toBuffer(),
          new PublicKey(token.address).toBuffer(),
        ],
        ASSOCIATED_TOKEN_PROGRAM_ID,
      ),
    );
    try {
      usdc = await this.connection.getTokenAccountBalance(usdc[0]);
      balances[1] =
        parseFloat(usdc.value.amount) / Math.pow(10, usdc.value.decimals);
    } catch (err) {
      balances[1] = 0;
    }
    try {
      usdt = await this.connection.getTokenAccountBalance(usdt[0]);
      balances[2] =
        parseFloat(usdt.value.amount) / Math.pow(10, usdt.value.decimals);
    } catch (err) {
      balances[2] = 0;
    }
    console.log(balances);
    await this.setStateAsync({balances});
    await setAsyncStorageValue({balances});
  }

  // USD Conversions

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
      console.log(feedsUSD);
      const usdPrices = feedsUSD[0].map(
        (item, index) => parseFloat(item) * Math.pow(10, -feedsUSD[1][index]),
      );
      console.log(usdPrices);
      const res = {
        SOL: usdPrices[11],
        USDT: usdPrices[13],
        USDC: usdPrices[12],
      };
      console.log(res);
      this.setState({usdConversion: [res.SOL, res.USDC, res.USDT, 0.06, 1]}); // Peso to Dollar to be done
      await setAsyncStorageValue({usdConversion: this.state.usdConversion});
    } catch (err) {
      console.log(err);
    }
  }

  render() {
    return (
      <View
        style={{
          width: '100%',
          height: '100%',
        }}>
        <View style={GlobalStyles.tab1Container1}>
          <View
            style={{
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Text
              style={{
                fontSize: 30,
                fontFamily: 'Exo2-Regular',
                color: 'white',
              }}>
              Balance
            </Text>
            <Text
              style={{
                fontSize: 38,
                color: 'white',
                fontFamily: 'Exo2-Regular',
              }}>
              {`$ ${epsilonRound(
                arraySum(
                  this.state.balances.map(
                    (x, i) => x * this.state.usdConversion[i],
                  ),
                ),
                2,
              )} USD`}
            </Text>
          </View>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-evenly',
              alignItems: 'center',
              width: '100%',
            }}>
            <View style={{justifyContent: 'center', alignItems: 'center'}}>
              <Pressable
                onPress={() => this.props.navigation.navigate('Send')}
                style={GlobalStyles.singleButton}>
                <IconIonicons
                  name="arrow-up-outline"
                  size={30}
                  color={'white'}
                />
              </Pressable>
              <Text style={GlobalStyles.singleButtonText}>Send</Text>
            </View>
            {this.state.nfcSupported && (
              <View style={{justifyContent: 'center', alignItems: 'center'}}>
                <Pressable
                  onPress={() => this.props.navigation.navigate('CardPayment')}
                  style={GlobalStyles.singleButton}>
                  <IconIonicons name="card" size={30} color={'white'} />
                </Pressable>
                <Text style={GlobalStyles.singleButtonText}>{'Payment'}</Text>
              </View>
            )}
            <View style={{justifyContent: 'center', alignItems: 'center'}}>
              <Pressable
                onPress={() => this.props.navigation.navigate('Deposit')}
                style={GlobalStyles.singleButton}>
                <IconIonicons
                  name="arrow-down-outline"
                  size={30}
                  color={'white'}
                />
              </Pressable>
              <Text style={GlobalStyles.singleButtonText}>Receive</Text>
            </View>
          </View>
        </View>
        <ScrollView
          refreshControl={
            <RefreshControl
              progressBackgroundColor="#0fb9f9"
              refreshing={this.state.refreshing}
              onRefresh={async () => {
                await setAsyncStorageValue({
                  lastRefresh: Date.now().toString(),
                });
                await this.refresh();
              }}
            />
          }
          showsVerticalScrollIndicator={false}
          style={GlobalStyles.tab1Container2}
          contentContainerStyle={{
            justifyContent: 'flex-start',
            alignItems: 'center',
          }}>
          {blockchain.tokens.map((token, index) => (
            <View key={index} style={GlobalStyles.network}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-around',
                }}>
                <View style={{marginHorizontal: 20}}>
                  <View>{token.icon}</View>
                </View>
                <View style={{justifyContent: 'center'}}>
                  <Text style={{fontSize: 18, color: 'white'}}>
                    {token.name}
                  </Text>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'flex-start',
                    }}>
                    <Text style={{fontSize: 12, color: 'white'}}>
                      {this.state.balances[index] === 0
                        ? '0'
                        : this.state.balances[index] < 0.001
                        ? '<0.001'
                        : epsilonRound(this.state.balances[index], 3)}{' '}
                      {token.symbol}
                    </Text>
                    <Text style={{fontSize: 12, color: 'white'}}>
                      {`  -  ($${epsilonRound(
                        this.state.usdConversion[index],
                        0,
                      )} USD)`}
                    </Text>
                  </View>
                </View>
              </View>
              <View style={{marginHorizontal: 20}}>
                <Text style={{color: 'white'}}>
                  $
                  {epsilonRound(
                    this.state.balances[index] *
                      this.state.usdConversion[index],
                    2,
                  )}{' '}
                  USD
                </Text>
              </View>
            </View>
          ))}
          {tradFi.tokens.map((token, index) => (
            <View key={index} style={GlobalStyles.network}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-around',
                }}>
                <View style={{marginHorizontal: 20}}>
                  <View>{token.icon}</View>
                </View>
                <View style={{justifyContent: 'center'}}>
                  <Text style={{fontSize: 18, color: 'white'}}>
                    {token.name}
                  </Text>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'flex-start',
                    }}>
                    <Text style={{fontSize: 12, color: 'white'}}>
                      {this.state.balances[index + blockchain.tokens.length] ===
                      0
                        ? '0'
                        : this.state.balances[
                            index + blockchain.tokens.length
                          ] < 0.001
                        ? '<0.001'
                        : epsilonRound(
                            this.state.balances[
                              index + blockchain.tokens.length
                            ],
                            3,
                          )}{' '}
                      {token.symbol}
                    </Text>
                    <Text style={{fontSize: 12, color: 'white'}}>
                      {`  -  ($${epsilonRound(
                        this.state.usdConversion[
                          index + blockchain.tokens.length
                        ],
                        2,
                      )} USD)`}
                    </Text>
                  </View>
                </View>
              </View>
              <View style={{marginHorizontal: 20}}>
                <Text style={{color: 'white'}}>
                  $
                  {epsilonRound(
                    this.state.balances[index + blockchain.tokens.length] *
                      this.state.usdConversion[
                        index + blockchain.tokens.length
                      ],
                    2,
                  )}{' '}
                  USD
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    );
  }
}

export default Tab1;
