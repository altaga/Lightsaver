// Basic Imports
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {Component} from 'react';
import {Dimensions, Image, View} from 'react-native';
import EncryptedStorage from 'react-native-encrypted-storage';
import logoSplash from '../../assets/logo.png';
import GlobalStyles from '../../styles/styles';
import ContextModule from '../../utils/contextModule';
import {
  setAsyncStorageValue,
  setEncryptedStorageValue,
} from '../../utils/utils';
import {PublicKey} from '@solana/web3.js';

class SplashLoading extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  static contextType = ContextModule;

  async componentDidMount() {
    this.props.navigation.addListener('focus', async () => {
      // // DEBUG ONLY
      //await this.erase()
      console.log(this.props.route.name);
      await setAsyncStorageValue({
        publicKey: 'ALZarKv3mrfZp7SDJezdYUKG6dkFYjiBf4gnQLg9hHju',
      });
      await setAsyncStorageValue({
        publicKeySavings: '6G7VmpRh6RdotphBVs1QyKhfKhfGVvRGN36fnSjAdWyY',
      });
      await setAsyncStorageValue({
        publicKeyCard: '4V5JowbtHf7GJQvbg1KiiL1D4oFngYRnRFQPCk6yzSQG',
      });
      /**
      await setAsyncStorageValue({
        publicKey: 'ALZarKv3mrfZp7SDJezdYUKG6dkFYjiBf4gnQLg9hHju',
      });
      await setAsyncStorageValue({
        publicKeySavings: '6G7VmpRh6RdotphBVs1QyKhfKhfGVvRGN36fnSjAdWyY',
      });
      await setAsyncStorageValue({
        publicKeyCard: '4V5JowbtHf7GJQvbg1KiiL1D4oFngYRnRFQPCk6yzSQG',
      });
        await setEncryptedStorageValue({
          privateKey:
            '5gP3bHJ8VJBn81N2xXnzjF9RWnmieAW4tXXBTvEKj3bskVyXBFWMMFHTLpb9AmU88PRNPtVRfpMaRE93VPShzmtK',
        });
      */
      this.props.navigation.navigate('Main');
    });
    this.props.navigation.addListener('blur', async () => {});
  }

  async erase() {
    // Debug Only
    try {
      await EncryptedStorage.clear();
      await AsyncStorage.clear();
    } catch (error) {
      console.log(error);
    }
  }

  render() {
    return (
      <View style={[GlobalStyles.container, {justifyContent: 'center'}]}>
        <Image
          resizeMode="contain"
          source={logoSplash}
          alt="Main Logo"
          style={{
            width: Dimensions.get('window').width,
          }}
        />
      </View>
    );
  }
}

export default SplashLoading;
