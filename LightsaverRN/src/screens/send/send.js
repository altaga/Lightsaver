import {ethers} from 'ethers';
import React, {Component} from 'react';
import reactAutobind from 'react-autobind';
import {
  Dimensions,
  Image,
  Linking,
  Modal,
  Pressable,
  SafeAreaView,
  Text,
  TextInput,
  View,
} from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import IconFeatherIcons from 'react-native-vector-icons/Feather';
import IconIonIcons from 'react-native-vector-icons/Ionicons';
import checkMark from '../../assets/checkMark.png';
import Renders from '../../assets/logo.png';
import {abiERC20} from '../../contracts/erc20';
import GlobalStyles from '../../styles/styles';
import {EVM} from '../../utils/constants';
import ContextModule from '../../utils/contextModule';
import {
  balancedSaving,
  balancedSavingToken,
  epsilonRound,
  getAsyncStorageValue,
  getETHUSD,
  getEncryptedStorageValue,
  percentageSaving,
  percentageSavingToken,
} from '../../utils/utils';
import Cam from './components/cam';
import CryptoSign from './components/cryptoSign';
import KeyboardAwareScrollViewComponent from './components/keyboardAvoid';

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

const SendBaseState = {
  publicKey: '0x0000000000000000000000000000000000000000',
  address: '', // ""
  amount: '', // ""
  tokenSelected: setTokens(EVM.tokens)[0], // [0]
  transaction: {},
  transactionDisplay: {
    name: setTokens(EVM.tokens)[0].symbol,
    decimals: setTokens(EVM.tokens)[0].decimals,
    amount: 0,
    gas: 0,
  },
  stage: 0,
  hash: '', // ""
  check: 'Check',
  modal: false, // false
  explorerURL: '',
  status: 'Processing...',
  errorText: '',
  maxSelected: false,
  maxLoading: false,
  // Savings Flags
  savingsAccount: '0x0000000000000000000000000000000000000000',
  savingsActive: false,
  protocolSelected: 0,
  transactionSavings: {},
  ethUSD: [1, 1, 1, 1],
  percentage: 0,
  loading: true,
};

class Send extends Component {
  constructor(props) {
    super(props);
    this.state = SendBaseState;
    reactAutobind(this);
    this.provider = new ethers.providers.JsonRpcProvider(EVM.rpc);
  }

  static contextType = ContextModule;

  async componentDidMount() {
    this.props.navigation.addListener('focus', async () => {
      console.log(this.props.route.name);
      const publicKey = await getAsyncStorageValue('publicKey');
      const savingsAccount = await getAsyncStorageValue('savingsAccount');
      const savingsActive = await getAsyncStorageValue('mySwitch');
      const protocolSelected = await getAsyncStorageValue('protocolSelected');
      const percentage = await getAsyncStorageValue('percentage');
      const ethUSD = await getETHUSD();
      this.setState({
        ...SendBaseState,
        publicKey,
        savingsAccount:
          savingsAccount ?? '0x0000000000000000000000000000000000000000',
        savingsActive: savingsActive ?? false,
        protocolSelected: protocolSelected ?? 0,
        ethUSD,
        percentage: percentage ?? 0,
        loading: false,
      });
    });
    this.props.navigation.addListener('blur', async () => {
      this.setState(SendBaseState);
    });
  }

  componentWillUnmount() {}

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

  async sign(signedTx) {
    this.setState({
      status: 'Processing...',
      stage: 2,
      explorerURL: '',
    });
    try {
      const {hash} = await this.provider.sendTransaction(signedTx);
      await this.provider.waitForTransaction(hash);
      this.state.savingsActive && (await this.savings());
      this.setState({
        explorerURL: `${EVM.blockExplorer}tx/${hash}`,
        status: 'Confirmed',
      });
    } catch (e) {
      console.log(e);

      this.setState({
        stage: 0,
        explorerURL: '',
        transaction: {},
        check: 'Check',
        loading: false,
        modal: false,
        status: 'Processing...',
        errorText: '',
      });
    }
  }

  async savings() {
    try {
      const privateKey = await getEncryptedStorageValue('privateKey');
      let tx = this.state.transactionSavings;
      tx = {
        ...tx,
        nonce: await this.provider.getTransactionCount(this.state.publicKey),
      };
      const wallet = new ethers.Wallet(privateKey);
      const signedTx = await wallet.signTransaction(tx);
      const {hash} = await this.provider.sendTransaction(signedTx);
      await this.provider.waitForTransaction(hash);
    } catch (err) {
      console.log(err);
    }
  }

  async savingsCalculate(amount, usd) {
    try {
      let {chainId} = EVM;
      console.log('Savings:', amount, usd);
      const amountSaved = epsilonRound(
        this.state.protocolSelected === 0
          ? balancedSaving(amount, usd)
          : percentageSaving(amount, this.state.percentage),
        18,
      );
      const gasPrice = await this.provider.getGasPrice();
      const nonce = await this.provider.getTransactionCount(
        this.state.publicKey,
      );
      let transaction = {
        chainId,
        to: this.state.savingsAccount,
        value: ethers.utils.parseEther(amountSaved.toString()),
        gasPrice,
        nonce,
      };
      const gas = await this.provider.estimateGas(transaction);
      transaction = {
        ...transaction,
        gasLimit: gas,
      };
      return transaction;
    } catch (err) {
      console.log('Savings Error:', err);
    }
  }

  async savingsCalculateToken(amount, usd1, usd2) {
    try {
      let {chainId} = EVM;
      console.log('Savings:', amount, usd1, usd2);
      const amountSaved = epsilonRound(
        this.state.protocolSelected === 0
          ? balancedSavingToken(amount, usd1, usd2)
          : percentageSavingToken(amount, this.state.percentage, usd1, usd2),
        18,
      );
      const gasPrice = await this.provider.getGasPrice();
      const nonce = await this.provider.getTransactionCount(
        this.state.publicKey,
      );
      let transaction = {
        chainId,
        to: this.state.savingsAccount,
        value: ethers.utils.parseEther(amountSaved.toString()),
        gasPrice,
        nonce,
      };
      const gas = await this.provider.estimateGas(transaction);
      transaction = {
        ...transaction,
        gasLimit: gas,
      };
      return transaction;
    } catch (err) {
      console.log('Savings Error:', err);
    }
  }

  async transfer() {
    let errorText = '';
    try {
      // Transaction
      let {chainId} = EVM;
      this.setState({
        loading: true,
        check: 'Checking...',
      });
      const balance = await this.provider.getBalance(this.state.publicKey);
      const gasPrice = await this.provider.getGasPrice();
      const nonce = await this.provider.getTransactionCount(
        this.state.publicKey,
      );
      let transaction = {
        chainId,
        to: this.state.address,
        value: ethers.utils.parseEther(this.state.amount),
        gasPrice,
        nonce,
      };
      const gas = await this.provider.estimateGas(transaction);
      let value;
      if (this.state.maxSelected) {
        value = ethers.utils
          .parseEther(this.state.amount)
          .sub(gas.mul(gasPrice));
        transaction = {
          ...transaction,
          gasLimit: gas,
          value,
        };
      } else {
        value = ethers.utils.parseEther(this.state.amount);
        transaction = {
          ...transaction,
          gasLimit: gas,
        };
      }
      const check = balance.gte(value.add(gas.mul(gasPrice)));
      if (!check) {
        errorText = `Not enough balance, you need ${ethers.utils.formatEther(
          value.add(gas.mul(gasPrice)).sub(balance).abs(),
        )} ${this.state.tokenSelected.symbol} to complete transaction`;
        throw 'Not enough balance';
      }
      // Savings Transaction

      let transactionDisplay = {};
      let transactionSavings = {};

      if (this.state.savingsActive && !this.state.maxSelected) {
        transactionSavings = await this.savingsCalculate(
          this.state.amount,
          this.state.ethUSD[0],
        );
        const displayAmount = ethers.utils.formatEther(
          transaction.value.add(transactionSavings.value),
        );
        const displayGas = ethers.utils.formatEther(gas.mul(gasPrice).mul(2));
        transactionDisplay = {
          name: this.state.tokenSelected.symbol,
          decimals: 18,
          amount: epsilonRound(displayAmount, 8),
          gas: epsilonRound(displayGas, 8),
        };
      } else {
        const displayAmount = ethers.utils.formatEther(value);
        const displayGas = ethers.utils.formatEther(gas.mul(gasPrice));
        transactionDisplay = {
          name: this.state.tokenSelected.symbol,
          decimals: 18,
          amount: epsilonRound(displayAmount, 8),
          gas: epsilonRound(displayGas, 8),
        };
      }

      this.setState({
        transactionSavings,
        transactionDisplay,
        transaction,
        check: check ? 'Check' : 'Check Again',
        loading: false,
        modal: check,
        errorText,
      });
    } catch (err) {
      console.log(err);
      this.setState({
        stage: 0,
        explorerURL: '',
        transaction: {},
        transactionSavings: {},
        transactionDisplay: {},
        check: 'Check',
        loading: false,
        modal: false,
        status: 'Processing...',
        errorText,
        maxSelected: false,
      });
    }
  }

  async tokenTransfer() {
    let errorText = '';
    try {
      let {chainId} = EVM;

      this.setState({
        loading: true,
        check: 'Checking...',
      });
      const tokenContract = new ethers.Contract(
        this.state.tokenSelected.address,
        abiERC20,
        this.provider,
      );
      let encoder = new ethers.utils.Interface(abiERC20);
      const balance = await this.provider.getBalance(this.state.publicKey);
      const tokenBalance = await tokenContract.balanceOf(this.state.publicKey);
      const tokenDecimals = await tokenContract.decimals();
      const amount = ethers.utils.parseUnits(this.state.amount, tokenDecimals);
      const gasPrice = await this.provider.getGasPrice();
      const nonce = this.provider.getTransactionCount(this.state.publicKey);
      let transaction = {
        chainId,
        from: this.state.publicKey,
        to: this.state.tokenSelected.address,
        data: encoder.encodeFunctionData('transfer', [
          this.state.address,
          amount,
        ]),
        gasPrice,
        nonce,
      };
      let gas = ethers.BigNumber.from(0);
      let check2 = false;
      try {
        gas = await this.provider.estimateGas(transaction);
        transaction = {
          ...transaction,
          gasLimit: gas,
        };
        check2 = true;
      } catch (e) {
        errorText = `Not enough token balance, you need ${ethers.utils
          .formatUnits(
            ethers.utils
              .parseUnits(this.state.amount, tokenDecimals)
              .sub(tokenBalance)
              .abs(),
            tokenDecimals,
          )
          .toString()} ${
          this.state.tokenSelected.symbol
        } to complete transaction`;
      }
      const checkGas = gas.mul(gasPrice);
      const check = balance.gte(gas.mul(gasPrice));
      if (!check) {
        errorText = `Not enough balance, you need ${ethers.utils.formatEther(
          checkGas.sub(balance).abs().toString(),
        )} ${EVM.token} to complete transaction`;
      }

      // Savings Transaction

      let transactionDisplay = {};
      let transactionSavings = {};

      if (this.state.savingsActive && !this.state.maxSelected) {
        transactionSavings = await this.savingsCalculateToken(
          this.state.amount,
          this.state.ethUSD[this.state.tokenSelected.value],
          this.state.ethUSD[0],
        );
        const displayGas = ethers.utils.formatEther(
          gas.mul(gasPrice).add(transactionSavings.value),
        );
        transactionDisplay = {
          name: this.state.tokenSelected.symbol,
          decimals: 18,
          amount: parseFloat(this.state.amount),
          gas: epsilonRound(displayGas, 8),
        };
        console.log(transactionSavings);
      } else {
        const displayGas = ethers.utils.formatEther(gas.mul(gasPrice));
        transactionDisplay = {
          name: this.state.tokenSelected.symbol,
          decimals: 18,
          amount: parseFloat(this.state.amount),
          gas: epsilonRound(displayGas, 8),
        };
      }

      this.setState({
        transactionSavings,
        transactionDisplay,
        transaction,
        check: check && check2 ? 'Check' : 'Check Again',
        loading: false,
        modal: check && check2,
        errorText,
      });
    } catch (err) {
      console.log(err);
      this.setState({
        stage: 0,
        explorerURL: '',
        transaction: {},
        check: 'Check Again',
        loading: false,
        modal: false,
        status: 'Processing...',
        errorText,
      });
    }
  }

  async maxTransfer() {
    this.setState({
      maxLoading: true,
    });
    try {
      const balance = await this.provider.getBalance(this.state.publicKey);
      const gasPrice = await this.provider.getGasPrice();
      const nonce = this.provider.getTransactionCount(this.state.publicKey);
      let transaction = {
        chainId: EVM.chainId,
        to: '0x0000000000000000000000000000000000000000', // Test Account to Gas Calculation
        value: '0x0',
        gasPrice,
        nonce,
      };
      const gas = await this.provider.estimateGas(transaction);
      transaction = {
        ...transaction,
        gasLimit: gas,
      };
      const checkGas = gas.mul(gasPrice);
      let checkTotal = balance.sub(checkGas);
      if (checkTotal.lte(ethers.BigNumber.from(0))) {
        checkTotal = ethers.BigNumber.from(0);
      }

      this.setState({
        maxSelected: true,
        maxLoading: false,
        amount: ethers.utils.formatEther(checkTotal).toString(),
      });
    } catch (err) {
      console.log(err);
      this.setState({
        maxLoading: false,
        amount: '0',
      });
    }
  }

  async maxTokenTransfer() {
    this.setState({
      maxLoading: true,
    });
    try {
      const tokenContract = new ethers.Contract(
        this.state.tokenSelected.address,
        abiERC20,
        this.provider,
      );
      const tokenBalance = await tokenContract.balanceOf(this.state.publicKey);
      const tokenDecimals = await tokenContract.decimals();
      const amount = ethers.utils.formatUnits(tokenBalance, tokenDecimals);

      this.setState({
        maxSelected: true,
        maxLoading: false,
        amount: amount.toString(),
      });
    } catch (err) {
      console.log(err);
      this.setState({
        maxLoading: false,
        amount: '0',
      });
    }
  }

  render() {
    const modalScale = 0.5;
    return (
      <SafeAreaView style={GlobalStyles.container}>
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
        <Modal
          visible={this.state.modal}
          transparent={true}
          animationType="slide">
          <View
            style={{
              alignSelf: 'center',
              backgroundColor: '#1E2423',
              width: Dimensions.get('window').width * 0.94,
              height: Dimensions.get('window').height * modalScale,
              marginTop: Dimensions.get('window').height * (0.99 - modalScale),
              borderWidth: 2,
              borderColor: '#0fb9f9',
              padding: 20,
              borderRadius: 25,
              justifyContent: 'space-around',
              alignItems: 'center',
            }}>
            <Text
              style={{
                textAlign: 'center',
                color: 'white',
                fontSize: 30,
                width: '80%',
              }}>
              Transaction
            </Text>
            <View
              style={{
                backgroundColor: '#0fb9f9',
                height: 1,
                width: '90%',
                marginVertical: 10,
              }}
            />
            <Text
              style={{
                textAlign: 'center',
                color: 'white',
                fontSize: 26,
                width: '100%',
              }}>
              eth_signTransaction
            </Text>
            <View
              style={{
                backgroundColor: '#0fb9f9',
                height: 1,
                width: '90%',
                marginVertical: 10,
              }}
            />
            <Text
              style={{
                textAlign: 'center',
                color: 'white',
                fontSize: 20,
                width: '100%',
              }}>
              Amount:
            </Text>
            <Text
              style={{
                textAlign: 'center',
                color: 'white',
                fontSize: 24,
                width: '100%',
              }}>
              {`${epsilonRound(this.state.transactionDisplay.amount, 8)}`}{' '}
              {this.state.transactionDisplay.name}
              {' ( $'}
              {epsilonRound(
                this.state.transactionDisplay.amount *
                  this.state.ethUSD[this.state.tokenSelected.value],
                2,
              )}
              {' )'}
            </Text>
            <View
              style={{
                backgroundColor: '#0fb9f9',
                height: 1,
                width: '90%',
                marginVertical: 10,
              }}
            />
            <Text
              style={{
                textAlign: 'center',
                color: 'white',
                fontSize: 20,
                width: '100%',
              }}>
              Gas:
            </Text>
            <Text
              style={{
                textAlign: 'center',
                color: 'white',
                fontSize: 24,
                width: '100%',
              }}>
              {this.state.transactionDisplay.gas} {EVM.token}
              {' ( $'}
              {epsilonRound(
                this.state.transactionDisplay.gas * this.state.ethUSD[0],
                2,
              )}
              {' )'}
            </Text>
            <View
              style={{
                backgroundColor: '#0fb9f9',
                height: 1,
                width: '90%',
                marginVertical: 10,
              }}
            />
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                width: '100%',
              }}>
              <Pressable
                style={[
                  GlobalStyles.singleModalButton,
                  {
                    width: '45%',
                    borderTopRightRadius: 0,
                    borderBottomRightRadius: 0,
                    borderRightColor: 'black',
                    borderRightWidth: 2,
                    alignItems: 'center',
                    justifyContent: 'center',
                  },
                ]}
                onPress={async () => {
                  await this.setStateAsync({
                    modal: false,
                  });

                  this.setState({
                    stage: 1,
                  });
                }}>
                <Text style={[GlobalStyles.singleModalButtonText]}>Accept</Text>
              </Pressable>
              <Pressable
                style={[
                  GlobalStyles.singleModalButton,
                  {
                    width: '45%',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderTopLeftRadius: 0,
                    borderBottomLeftRadius: 0,
                  },
                ]}
                onPress={() =>
                  this.setState({
                    transaction: {},
                    check: 'Check',
                    loading: false,
                    modal: false,
                  })
                }>
                <Text style={[GlobalStyles.singleModalButtonText]}>Reject</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
        {this.state.stage === 0 && (
          <KeyboardAwareScrollViewComponent>
            <SafeAreaView style={GlobalStyles.mainSend}>
              <View
                style={{
                  alignItems: 'center',
                }}>
                <View style={{marginTop: 20}} />
                <Text style={GlobalStyles.formTitle}>Address</Text>
                <View
                  style={{
                    width: Dimensions.get('screen').width,
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                  <View style={{width: '90%'}}>
                    <TextInput
                      style={[GlobalStyles.input, {fontSize: 12}]}
                      keyboardType="default"
                      value={this.state.address}
                      onChangeText={value => this.setState({address: value})}
                    />
                  </View>
                  <Pressable
                    onPress={() => this.setState({stage: 10})}
                    style={{width: '10%'}}>
                    <IconIonIcons name="qr-code" size={30} color={'white'} />
                  </Pressable>
                </View>
                <Text style={GlobalStyles.formTitle}>Select Token</Text>
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
                  value={this.state.tokenSelected.value}
                  items={setTokens(EVM.tokens)}
                  onValueChange={item => {
                    this.setState({
                      tokenSelected: setTokens(EVM.tokens)[item],
                    });
                  }}
                />
                <Text style={GlobalStyles.formTitle}>Amount</Text>
                <View
                  style={{
                    width: Dimensions.get('screen').width,
                    flexDirection: 'row',
                    justifyContent: 'space-around',
                    alignItems: 'center',
                  }}>
                  <View style={{width: '80%'}}>
                    <TextInput
                      style={[GlobalStyles.input]}
                      keyboardType="decimal-pad"
                      value={this.state.amount}
                      onChangeText={value => this.setState({amount: value})}
                    />
                  </View>
                  <Pressable
                    disabled={this.state.maxLoading}
                    style={{width: '20%', alignItems: 'center'}}
                    onPress={() => {
                      if (this.state.tokenSelected.symbol === EVM.token) {
                        console.log('EVM Transfer');
                        this.maxTransfer();
                      } else {
                        console.log('EVM Token Transfer');
                        this.maxTokenTransfer();
                      }
                    }}>
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: 'bold',
                        color: 'white',
                      }}>
                      {this.state.maxLoading ? (
                        <IconFeatherIcons
                          name="loader"
                          size={24}
                          color="white"></IconFeatherIcons>
                      ) : (
                        'Max'
                      )}
                    </Text>
                  </Pressable>
                </View>
              </View>
              {this.state.check === 'Check Again' && (
                <Text
                  style={{
                    fontSize: 20,
                    color: '#F00',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    paddingHorizontal: 20,
                  }}>
                  {this.state.errorText}
                </Text>
              )}
              <Pressable
                disabled={this.state.loading}
                style={[
                  GlobalStyles.buttonStyle,
                  this.state.loading ? {opacity: 0.5} : {},
                ]}
                onPress={() => {
                  if (this.state.tokenSelected.symbol === EVM.token) {
                    console.log('EVM Transfer');
                    this.transfer();
                  } else {
                    console.log('EVM Token Transfer');
                    this.tokenTransfer();
                  }
                }}>
                <Text
                  style={{
                    color: 'white',
                    fontSize: 24,
                    fontWeight: 'bold',
                  }}>
                  {this.state.check}
                </Text>
              </Pressable>
            </SafeAreaView>
          </KeyboardAwareScrollViewComponent>
        )}
        {this.state.stage === 1 && (
          <View style={GlobalStyles.mainSend}>
            <CryptoSign
              transaction={this.state.transaction}
              cancelTrans={e =>
                this.setState({
                  stage: 0,
                  explorerURL: '',
                  transaction: {},
                  check: 'Check',
                  loading: false,
                  modal: false,
                  status: 'Processing...',
                  errorText: '',
                })
              }
              signEthereum={e => this.sign(e)}
            />
          </View>
        )}
        {this.state.stage === 2 && (
          <View style={GlobalStyles.mainSend}>
            <View
              style={{
                flex: 1,
                flexDirection: 'column',
                justifyContent: 'space-around',
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
                      eth_signTransaction
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
                    {this.state.tokenSelected.icon}
                  </View>
                  <Text>
                    {`${epsilonRound(this.state.transactionDisplay.amount, 4)}`}{' '}
                    {this.state.tokenSelected.symbol}
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
                  onPress={() =>
                    this.setState({
                      stage: 0,
                      explorerURL: '',
                      transaction: {},
                      transactionSavings: {},
                      transactionDisplay: {},
                      check: 'Check',
                      loading: false,
                      modal: false,
                      status: 'Processing...',
                      errorText: '',
                      maxSelected: false,
                    })
                  }
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
          </View>
        )}
        {this.state.stage === 10 && (
          <View
            style={[GlobalStyles.mainSend, {justifyContent: 'space-evenly'}]}>
            <View>
              <Text style={{color: 'white', fontSize: 28}}>Scan QR</Text>
            </View>
            <View
              style={{
                height: Dimensions.get('screen').height * 0.5,
                width: Dimensions.get('screen').width * 0.8,
                marginVertical: 20,
                borderColor: '#0fb9f9',
                borderWidth: 5,
                borderRadius: 10,
              }}>
              <Cam
                callbackAddress={e => {
                  this.setState({
                    address: e,
                    stage: 0,
                    transaction: {},
                    transactionDisplay: {
                      name: this.state.tokenSelected.symbol,
                      decimals: this.state.tokenSelected.decimals,
                      amount: 0,
                      gas: 0,
                    },
                  });
                }}
              />
            </View>
            <Pressable
              style={[GlobalStyles.buttonStyle]}
              onPress={async () => {
                this.setState({
                  stage: 0,
                });
              }}>
              <Text style={{color: 'white', fontSize: 24, fontWeight: 'bold'}}>
                Cancel
              </Text>
            </Pressable>
          </View>
        )}
      </SafeAreaView>
    );
  }
}

export default Send;
