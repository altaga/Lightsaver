import {POLYGON_DATA_FEED_CONTRACT, POLYGON_DATA_FEED_URL} from '@env';
import Slider from '@react-native-community/slider';
import {ethers} from 'ethers';
import React, {Component} from 'react';
import {
  Dimensions,
  Pressable,
  ScrollView,
  Switch,
  Text,
  View,
} from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import {abiDataFeeds} from '../../../contracts/dataFeeds';
import GlobalStyles from '../../../styles/styles';
import {
  epsilonRound,
  getAsyncStorageValue,
  formatDate,
  setAsyncStorageValue,
  arraySum,
} from '../../../utils/utils';
import {Connection, LAMPORTS_PER_SOL, PublicKey} from '@solana/web3.js';
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  blockchain,
} from '../../../utils/constants';

const periodsAvailable = [
  {
    label: 'Daily',
    value: 0,
  },
  {
    label: 'Weekly',
    value: 1,
  },
  {
    label: 'Monthly',
    value: 2,
  },
  {
    label: 'Yearly',
    value: 3,
  },
];

const periodsValues = {86400: 0, 604800: 1, 2629800: 2, 31557600: 3};
const periodsValues2 = {0: 86400, 1: 604800, 2: 2629800, 3: 31557600};

const protocolsAvailable = [
  {
    label: 'Balanced',
    value: 0,
  },
  {
    label: 'Percentage',
    value: 1,
  },
];

const baseTab2State = {
  savingsAccount: new PublicKey('11111111111111111111111111111111'),
  publicKey: new PublicKey('11111111111111111111111111111111'),
  periodSelected: 2,
  protocolSelected: 0,
  percentage: 0,
  period: periodsValues2[2],
  // Account Details
  balancesSavings: [0, 0, 0],
  usdConversionSavings: [1, 1, 1],
  // Utils
  loading: false,
  mySwitch: true,
  withdrawAvailable: false,
};

export default class Tab2 extends Component {
  constructor(props) {
    super(props);
    this.state = baseTab2State;
    this.connection = new Connection(blockchain.rpc, 'confirmed');
    this.factory;
  }

  async componentDidMount() {
    //await setAsyncStorageValue({savingsAccount: "0x647aE2991caafFA28b435feD3578d3b07875f544"});
    const [
      protocolSelected,
      percentage,
      publicKey,
      savingsAccount,
      mySwitch,
      balancesSavings,
      usdConversionSavings,
      withdrawAvailable,
      periodSelected,
      period,
    ] = await Promise.all([
      getAsyncStorageValue('protocolSelected'),
      getAsyncStorageValue('percentage'),
      getAsyncStorageValue('publicKey'),
      getAsyncStorageValue('publicKeySavings'),
      getAsyncStorageValue('mySwitch'),
      getAsyncStorageValue('balancesSavings'),
      getAsyncStorageValue('usdConversionSavings'),
      getAsyncStorageValue('withdrawAvailable'),
      getAsyncStorageValue('periodSelected'),
      getAsyncStorageValue('period'),
    ]);
    await this.setStateAsync({
      savingsAccount: new PublicKey(
        savingsAccount ?? '11111111111111111111111111111111',
      ),
      balancesSavings: balancesSavings ?? [0, 0, 0],
      usdConversionSavings: usdConversionSavings ?? [1, 1, 1],
      publicKey: new PublicKey(publicKey ?? '11111111111111111111111111111111'),
      mySwitch: mySwitch ?? false,
      protocolSelected: protocolSelected ?? 0,
      percentage: percentage ?? 0,
      withdrawAvailable: withdrawAvailable ?? false,
      periodSelected: periodSelected ?? 2,
      period: period ?? periodsValues2[2],
    });
    this.refresh();
  }

  async refresh() {
    this.getBalances();
    this.getUSD();
  }

  async getBalances() {
    let {balancesSavings} = this.state;
    balancesSavings[0] =
      (await this.connection.getBalance(this.state.savingsAccount)) /
      LAMPORTS_PER_SOL;
    await this.setStateAsync({balancesSavings});
    await setAsyncStorageValue({balancesSavings});
  }
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
      this.setState({usdConversionSavings: [res.SOL, res.USDC, res.USDT]}); // Peso to Dollar to be done
      await setAsyncStorageValue({
        usdConversionSavings: this.state.usdConversionSavings,
      });
    } catch (err) {
      console.log(err);
    }
  }

  async changePeriod() {}

  async withdraw() {}

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
      <View
        style={{
          width: Dimensions.get('window').width,
        }}>
        <View
          style={{
            justifyContent: 'space-evenly',
            alignItems: 'center',
            height: '100%',
          }}>
          <ScrollView
            style={GlobalStyles.tab2Container}
            contentContainerStyle={GlobalStyles.tab2ScrollContainer}>
            <View
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                borderBottomWidth: 2,
                paddingVertical: 20,
                borderColor: '#0fb9f9',
                width: '90%',
              }}>
              <Text style={[GlobalStyles.titleSaves]}>
                Savings Account Balance{' '}
              </Text>
              <Text style={{fontSize: 38, color: 'white', marginTop: 10}}>
                {`$ ${epsilonRound(
                  arraySum(
                    this.state.balancesSavings.map(
                      (x, i) => x * this.state.usdConversionSavings[i],
                    ),
                  ),
                  2,
                )} USD`}
              </Text>
            </View>
            <View
              style={{
                justifyContent: 'flex-start',
                alignItems: 'center',
                width: '90%',
              }}>
              <View
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignContent: 'center',
                  width: '100%',
                  borderBottomWidth: 2,
                  marginTop: 20,
                  paddingBottom: 20,
                  borderColor: '#0fb9f9',
                }}>
                <Text style={[GlobalStyles.titleSaves]}>Activate Savings</Text>
                <Switch
                  style={{
                    transform: [{scaleX: 1.3}, {scaleY: 1.3}],
                  }}
                  trackColor={{false: '#3e3e3e', true: '#0fb9f977'}}
                  thumbColor={this.state.mySwitch ? '#0fb9f9' : '#f4f3f4'}
                  ios_backgroundColor="#3e3e3e"
                  onValueChange={async () => {
                    await setAsyncStorageValue({
                      mySwitch: !this.state.mySwitch,
                    });
                    await this.setStateAsync({
                      mySwitch: !this.state.mySwitch,
                    });
                  }}
                  value={this.state.mySwitch}
                />
              </View>
              {this.state.mySwitch && (
                <React.Fragment>
                  <View
                    style={{
                      borderBottomWidth: 2,
                      paddingBottom: 20,
                      borderColor: '#0fb9f9',
                    }}>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        width: '100%',
                      }}>
                      <Text style={[GlobalStyles.titleSaves]}>
                        Savings Period
                      </Text>
                      <RNPickerSelect
                        style={{
                          inputAndroidContainer: {
                            textAlign: 'center',
                          },
                          inputAndroid: {
                            textAlign: 'center',
                            color: 'gray',
                          },
                          viewContainer: {
                            ...GlobalStyles.input,
                            width: '55%',
                          },
                        }}
                        value={this.state.periodSelected}
                        items={periodsAvailable}
                        onValueChange={value => {
                          this.setState({
                            periodSelected: value,
                          });
                        }}
                      />
                    </View>
                    <Pressable
                      disabled={this.state.loading}
                      style={[
                        GlobalStyles.buttonStyle,
                        this.state.loading ? {opacity: 0.5} : {},
                      ]}
                      onPress={async () => {
                        await this.setStateAsync({loading: true});
                        await this.changePeriod();
                        await this.setStateAsync({loading: false});
                      }}>
                      <Text
                        style={{
                          color: 'white',
                          fontSize: 18,
                          fontWeight: 'bold',
                        }}>
                        {this.state.loading
                          ? 'Changing...'
                          : 'Change Savings Period'}
                      </Text>
                    </Pressable>
                  </View>
                  <View
                    style={
                      ({
                        width: '100%',
                      },
                      this.state.protocolSelected !== 1 && {
                        borderBottomWidth: 2,
                        borderColor: '#0fb9f9',
                      })
                    }>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        width: '100%',
                      }}>
                      <Text style={[GlobalStyles.titleSaves]}>
                        Savings Protocol
                      </Text>
                      <RNPickerSelect
                        style={{
                          inputAndroidContainer: {
                            textAlign: 'center',
                          },
                          inputAndroid: {
                            textAlign: 'center',
                            color: 'gray',
                          },
                          viewContainer: {
                            ...GlobalStyles.input,
                            width: Dimensions.get('screen').width * 0.5,
                          },
                        }}
                        value={this.state.protocolSelected}
                        items={protocolsAvailable}
                        onValueChange={async value => {
                          await this.setStateAsync({
                            protocolSelected: value,
                          });
                          await setAsyncStorageValue({
                            protocolSelected: value,
                          });
                        }}
                      />
                    </View>
                  </View>
                  {this.state.protocolSelected === 1 ? (
                    <View
                      style={{
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignContent: 'center',
                        width: '100%',
                        borderBottomWidth: 2,
                        marginBottom: 20,
                        paddingBottom: 20,
                        borderColor: '#0fb9f9',
                      }}>
                      <Slider
                        value={this.state.percentage}
                        style={{
                          width: '80%',
                          height: 40,
                        }}
                        step={1}
                        minimumValue={1}
                        maximumValue={15}
                        minimumTrackTintColor="#FFFFFF"
                        maximumTrackTintColor="#0fb9f9"
                        onValueChange={async value => {
                          await this.setStateAsync({percentage: value});
                          await setAsyncStorageValue({
                            percentage: value,
                          });
                        }}
                      />
                      <Text
                        style={{
                          width: '20%',
                          fontSize: 24,
                          color: '#FFF',
                          fontWeight: 'bold',
                        }}>
                        {this.state.percentage}%
                      </Text>
                    </View>
                  ) : (
                    <View
                      style={{
                        width: '100%',
                        marginBottom: 20,
                      }}
                    />
                  )}
                  <View
                    style={{
                      display: 'flex',
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignContent: 'center',
                      marginBottom: 20,
                      width: '100%',
                    }}>
                    <Text style={[GlobalStyles.titleSaves]}>
                      Next Withdraw Date
                    </Text>
                    <Pressable
                      disabled={
                        this.state.loading || !this.state.withdrawAvailable
                      }
                      style={[
                        GlobalStyles.buttonStyle,
                        {width: '50%'},
                        this.state.loading || !this.state.withdrawAvailable
                          ? {opacity: 0.5}
                          : {},
                      ]}
                      onPress={async () => {
                        await this.setStateAsync({loading: true});
                        await this.withdraw();
                        await this.setStateAsync({loading: false});
                      }}>
                      <Text
                        style={{
                          color: 'white',
                          fontSize: 18,
                          fontWeight: 'bold',
                        }}>
                        {!this.state.withdrawAvailable
                          ? formatDate(
                              new Date(
                                (Math.floor(Date.now() / 1000) +
                                  this.state.period) *
                                  1000,
                              ),
                            )
                          : this.state.loading
                          ? 'Withdrawing...'
                          : 'Withdraw Now'}
                      </Text>
                    </Pressable>
                  </View>
                </React.Fragment>
              )}
            </View>
          </ScrollView>
        </View>
      </View>
    );
  }
}
