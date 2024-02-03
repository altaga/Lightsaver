import {POLYGON_DATA_FEED_CONTRACT} from '@env';
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
import {
  abiSaverAccount,
  bytecodeSaverAccount,
} from '../../../contracts/saverAccount';
import {abiSaverNFT} from '../../../contracts/saverNFT';
import GlobalStyles from '../../../styles/styles';
import {EVM, NFTaddress, lightsaverNFT} from '../../../utils/constants';
import {
  epsilonRound,
  getAsyncStorageValue,
  getEncryptedStorageValue,
  setAsyncStorageValue,
} from '../../../utils/utils';
import BackgroundService from 'react-native-background-actions';
import {fetchNFTtask, options} from '../../../BackgroundTask';

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
  savingsAccount: '0x0000000000000000000000000000000000000000',
  publicKey: '0x0000000000000000000000000000000000000000',
  periodSelected: 2,
  protocolSelected: 0,
  percentage: 0,
  period: periodsValues2[2],
  // Account Details
  balance: ethers.BigNumber.from(0),
  usdETH: 0,
  // Utils
  loading: false,
  mySwitch: false,
  autoMint: false,
  withdrawAvailable: false,
};

export default class Tab2 extends Component {
  constructor(props) {
    super(props);
    this.state = baseTab2State;
    this.provider = new ethers.providers.JsonRpcProvider(EVM.rpc);
    this.factory;
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

  async componentDidMount() {
    //await setAsyncStorageValue({savingsAccount: "0x647aE2991caafFA28b435feD3578d3b07875f544"});
    const [
      protocolSelected,
      percentage,
      publicKey,
      savingsAccount,
      mySwitch,
      autoMint,
      savingsAccountBalance,
      withdrawAvailable,
      periodSelected,
      period,
    ] = await Promise.all([
      getAsyncStorageValue('protocolSelected'),
      getAsyncStorageValue('percentage'),
      getAsyncStorageValue('publicKey'),
      getAsyncStorageValue('savingsAccount'),
      getAsyncStorageValue('mySwitch'),
      getAsyncStorageValue('autoMint'),
      getAsyncStorageValue('savingsAccountBalance'),
      getAsyncStorageValue('withdrawAvailable'),
      getAsyncStorageValue('periodSelected'),
      getAsyncStorageValue('period'),
    ]);
    await this.setStateAsync({
      savingsAccount:
        savingsAccount ?? '0x0000000000000000000000000000000000000000',
      publicKey,
      mySwitch: mySwitch ?? false,
      autoMint: autoMint ?? false,
      protocolSelected: protocolSelected ?? 0,
      percentage: percentage ?? 0,
      balance: parseFloat(savingsAccountBalance ?? 0),
      withdrawAvailable: withdrawAvailable ?? false,
      periodSelected: periodSelected ?? 2,
      period: period ?? periodsValues2[2],
    });
    if (
      this.state.savingsAccount !== '0x0000000000000000000000000000000000000000'
    ) {
      this.getUSD();
      this.provider
        .getBalance(this.state.savingsAccount)
        .then(async balance => {
          balance = parseFloat(ethers.utils.formatEther(balance));
          await this.setStateAsync({balance});
          await setAsyncStorageValue({savingsAccountBalance: balance});
        });
      const contract = new ethers.Contract(
        this.state.savingsAccount,
        abiSaverAccount,
        this.provider,
      );
      const periodValue = await contract.period();
      const withdrawFlag = await contract.withdrawnAvailable();
      await this.setStateAsync({
        period: periodValue.toNumber(),
        periodSelected: periodsValues[periodValue.toNumber()],
        withdrawAvailable: withdrawFlag,
      });
      await setAsyncStorageValue({
        period: periodValue.toNumber(),
        periodSelected: periodsValues[periodValue.toNumber()],
        withdrawAvailable: withdrawFlag,
      });
    }
  }

  // Create Account
  async createSavingsAccount() {
    try {
      const privateKey = await getEncryptedStorageValue('privateKey');
      const signer = new ethers.Wallet(privateKey, this.provider);
      const factory = new ethers.ContractFactory(
        abiSaverAccount,
        bytecodeSaverAccount,
        signer,
      );
      const contract = await factory.deploy(this.state.periodSelected);
      await setAsyncStorageValue({
        savingsAccount: contract.address,
        mySwitch: true,
        protocolSelected: 0,
        percentage: 1,
      });
      await contract.deployTransaction.wait();
      await this.getFirstNFT();
      await this.setStateAsync({savingsAccount: contract.address});
    } catch (err) {
      console.log(err);
    }
  }

  async getFirstNFT() {
    try {
      const privateKey = await getEncryptedStorageValue('privateKey');
      const signer = new ethers.Wallet(privateKey, this.provider);
      const contract = new ethers.Contract(NFTaddress, abiSaverNFT, signer);
      const tx = await contract.mint(lightsaverNFT);
      await tx.wait();
    } catch (err) {
      console.log(err);
    }
  }

  async changePeriod() {
    try {
      const privateKey = await getEncryptedStorageValue('privateKey');
      const signer = new ethers.Wallet(privateKey, this.provider);
      const contract = new ethers.Contract(
        this.state.savingsAccount,
        abiSaverAccount,
        signer,
      );
      let tx = await contract.changePeriod(this.state.periodSelected);
      await tx.wait();
      await setAsyncStorageValue({
        periodSelected: this.state.periodSelected,
        period: periodsValues2[this.state.periodSelected],
      });
      await this.setStateAsync({
        period: periodsValues2[this.state.periodSelected],
      });
    } catch (err) {
      console.log(err);
    }
  }

  async withdraw() {
    try {
      const privateKey = await getEncryptedStorageValue('privateKey');
      const signer = new ethers.Wallet(privateKey, this.provider);
      const contract = new ethers.Contract(
        this.state.savingsAccount,
        abiSaverAccount,
        signer,
      );
      let balance = await this.provider.getBalance(this.state.savingsAccount);
      let tx = await contract.transferNative(balance, this.state.publicKey);
      await tx.wait();
      balance = await this.provider.getBalance(this.state.savingsAccount);
      const periodValue = await contract.period();
      const withdrawFlag = await contract.withdrawnAvailable();
      await this.setStateAsync({
        period: periodValue.toNumber(),
        periodSelected: periodsValues[periodValue.toNumber()],
        withdrawAvailable: withdrawFlag,
        balance: parseFloat(ethers.utils.formatEther(balance)),
      });
      await setAsyncStorageValue({
        period: periodValue.toNumber(),
        periodSelected: periodsValues[periodValue.toNumber()],
        withdrawAvailable: withdrawFlag,
        savingsAccountBalance: parseFloat(ethers.utils.formatEther(balance)),
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
          {this.state.savingsAccount ===
          '0x0000000000000000000000000000000000000000' ? (
            <View>
              <Text style={GlobalStyles.formTitle}>Select Savings Period</Text>
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
                    width: Dimensions.get('screen').width * 0.9,
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
              <Pressable
                disabled={this.state.loading}
                style={[
                  GlobalStyles.buttonStyle,
                  this.state.loading ? {opacity: 0.5} : {},
                ]}
                onPress={async () => {
                  await this.setStateAsync({loading: true});
                  await this.createSavingsAccount();
                  await this.setStateAsync({loading: false});
                }}>
                <Text style={GlobalStyles.buttonText}>
                  {this.state.loading
                    ? 'Creating...'
                    : 'Create Savings Account'}
                </Text>
              </Pressable>
            </View>
          ) : (
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
                    this.state.balance * this.state.usdETH,
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
                    marginVertical: 20,
                    paddingBottom: 20,
                    borderColor: '#0fb9f9',
                  }}>
                  <Text style={[GlobalStyles.titleSaves]}>
                    Activate Savings
                  </Text>
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
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignContent: 'center',
                        width: '100%',
                        borderBottomWidth: 2,
                        paddingBottom: 20,
                        borderColor: '#0fb9f9',
                      }}>
                      <Text style={[GlobalStyles.titleSaves]}>
                        Auto Mint Weekly NFT
                      </Text>
                      <Switch
                        style={{
                          transform: [{scaleX: 1.3}, {scaleY: 1.3}],
                          marginRight: 10,
                        }}
                        trackColor={{false: '#3e3e3e', true: '#0fb9f977'}}
                        thumbColor={this.state.mySwitch ? '#0fb9f9' : '#f4f3f4'}
                        ios_backgroundColor="#3e3e3e"
                        onValueChange={async () => {
                          await setAsyncStorageValue({
                            autoMint: !this.state.autoMint,
                          });
                          await this.setStateAsync({
                            autoMint: !this.state.autoMint,
                          });
                          if (this.state.autoMint) {
                            BackgroundService.start(fetchNFTtask, options);
                            console.log('Background Service Started');
                          } else {
                            BackgroundService.stop();
                            console.log('Background Service Stopped');
                          }
                        }}
                        value={this.state.autoMint}
                      />
                    </View>
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
                            ? new Date(
                                (Math.floor(Date.now() / 1000) +
                                  this.state.period) *
                                  1000,
                              ).toLocaleDateString('en-US')
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
          )}
        </View>
      </View>
    );
  }
}
