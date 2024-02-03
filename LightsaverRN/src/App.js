import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import React, {useEffect} from 'react';
import {StatusBar} from 'react-native';
import BackgroundService from 'react-native-background-actions';
import {fetchNFTtask, options} from './BackgroundTask';
import Deposit from './screens/deposit/deposit';
import Lock from './screens/lock/lock';
import Main from './screens/main/main';
import Send from './screens/send/send';
import Setup from './screens/setup/setup';
import SplashLoading from './screens/splashLoading/splashLoading';
import {ContextProvider} from './utils/contextModule';
import AppStateListener from './utils/appStateListener';
import CardPayment from './screens/cardPayment/cardPayment';

const Stack = createNativeStackNavigator();

export default function App() {
  // Background Service

  useEffect(() => {
    const nftFetcher = async () => {
      let isRunning = BackgroundService.isRunning();
      if (!isRunning) {
        BackgroundService.start(fetchNFTtask, options);
        console.log('Background Service Started');
      }
    };
    nftFetcher();
  }, []);

  return (
    <ContextProvider>
      <NavigationContainer>
        <AppStateListener />
        <StatusBar barStyle="light-content" />
        <Stack.Navigator
          initialRouteName="SplashLoading"
          screenOptions={{
            headerShown: false,
          }}>
          <Stack.Screen name="SplashLoading" component={SplashLoading} />
          {
            // Setups
          }
          <Stack.Screen name="Setup" component={Setup} />
          {
            // Main
          }
          <Stack.Screen name="Lock" component={Lock} />
          <Stack.Screen name="Main" component={Main} />
          {
            // Wallet Actions
          }
          <Stack.Screen name="Deposit" component={Deposit} />
          <Stack.Screen name="Send" component={Send} />
          <Stack.Screen name="CardPayment" component={CardPayment} />
        </Stack.Navigator>
      </NavigationContainer>
    </ContextProvider>
  );
}
