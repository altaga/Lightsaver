import Clipboard from '@react-native-clipboard/clipboard';
import React, {Component} from 'react';
import reactAutobind from 'react-autobind';
import {
  Dimensions,
  Image,
  Pressable,
  Text,
  ToastAndroid,
  View,
} from 'react-native';
import QRCodeStyled from 'react-native-qrcode-styled';
import IconIonicons from 'react-native-vector-icons/Ionicons';
import Renders from '../../assets/logo.png';
import GlobalStyles, {ratio} from '../../styles/styles';
import ContextModule from '../../utils/contextModule';
import {getAsyncStorageValue} from '../../utils/utils';

class Deposit extends Component {
  constructor(props) {
    super(props);
    this.state = {
      publicKey: '0x0000000000000000000000000000000000000000',
      savingsAccount: '0x0000000000000000000000000000000000000000',
      flag: false,
    };
    reactAutobind(this);
  }

  static contextType = ContextModule;

  componentDidMount() {
    this.props.navigation.addListener('focus', async () => {
      console.log(this.props.route.name);
      const publicKey = await getAsyncStorageValue('publicKey');
      const savingsAccount = await getAsyncStorageValue('savingsAccount');
      this.setState({
        publicKey: publicKey,
        savingsAccount:
          savingsAccount ?? '0x0000000000000000000000000000000000000000',
      });
    });
  }

  render() {
    return (
      <>
        {this.state.savingsAccount ===
        '0x0000000000000000000000000000000000000000' ? (
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
              <View>
                <Text style={GlobalStyles.exoTitle}>
                  Receive LightLink native{'\n'}or ERC-20 Tokens
                </Text>
              </View>
              <QRCodeStyled
                maxSize={
                  Dimensions.get('screen').width * (ratio > 1.7 ? 0.8 : 0.5)
                }
                data={this.state.publicKey}
                style={[
                  {
                    backgroundColor: 'white',
                    borderRadius: 10,
                  },
                ]}
                errorCorrectionLevel="H"
                padding={16}
                //pieceSize={10}
                pieceBorderRadius={4}
                isPiecesGlued
                color={'black'}
              />
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                <Text
                  style={{
                    fontSize: ratio > 1.7 ? 24 : 20,
                    fontWeight: 'bold',
                    color: 'white',
                    textAlign: 'center',
                    width: '85%',
                  }}>
                  {this.state.publicKey.substring(0, 21) +
                    '\n' +
                    this.state.publicKey.substring(21)}
                </Text>
                <Pressable
                  onPress={() => {
                    Clipboard.setString(this.state.publicKey);
                    ToastAndroid.show(
                      'Address copied to clipboard',
                      ToastAndroid.LONG,
                    );
                  }}
                  style={{
                    width: '15%',
                    alignItems: 'flex-start',
                  }}>
                  <IconIonicons name="copy" size={30} color={'white'} />
                </Pressable>
              </View>
              <Pressable
                style={GlobalStyles.buttonStyle}
                onPress={() => {
                  this.props.navigation.goBack();
                }}>
                <Text
                  style={{color: 'white', fontSize: 24, fontWeight: 'bold'}}>
                  Cancel
                </Text>
              </Pressable>
            </View>
          </View>
        ) : (
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
              <Text style={GlobalStyles.exoTitle}>
                Receive LightLink native{'\n'}or ERC-20 Tokens
              </Text>
              <QRCodeStyled
                maxSize={
                  Dimensions.get('screen').width * (ratio > 1.7 ? 0.8 : 0.5)
                }
                data={
                  this.state.flag
                    ? this.state.savingsAccount
                    : this.state.publicKey
                }
                style={[
                  {
                    backgroundColor: 'white',
                    borderRadius: 10,
                  },
                ]}
                errorCorrectionLevel="H"
                padding={16}
                //pieceSize={10}
                pieceBorderRadius={4}
                isPiecesGlued
                color={'black'}
              />
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                <Text
                  style={{
                    fontSize: ratio > 1.7 ? 24 : 20,
                    fontWeight: 'bold',
                    color: 'white',
                    textAlign: 'center',
                    width: '85%',
                  }}>
                  {(this.state.flag
                    ? this.state.savingsAccount
                    : this.state.publicKey
                  ).substring(0, 21) +
                    '\n' +
                    (this.state.flag
                      ? this.state.savingsAccount
                      : this.state.publicKey
                    ).substring(21)}
                </Text>
                <Pressable
                  onPress={() => {
                    Clipboard.setString(
                      this.state.flag
                        ? this.state.savingsAccount
                        : this.state.publicKey,
                    );
                    ToastAndroid.show(
                      'Address copied to clipboard',
                      ToastAndroid.LONG,
                    );
                  }}
                  style={{
                    width: '15%',
                    alignItems: 'flex-start',
                  }}>
                  <IconIonicons name="copy" size={30} color={'white'} />
                </Pressable>
              </View>
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
                  onPress={() => {
                    this.setState({
                      flag: false,
                    });
                  }}>
                  <Text style={[GlobalStyles.singleModalButtonText]}>
                    Wallet
                  </Text>
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
                      flag: true,
                    })
                  }>
                  <Text style={[GlobalStyles.singleModalButtonText]}>
                    Savings
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        )}
      </>
    );
  }
}

export default Deposit;
