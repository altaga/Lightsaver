import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import React, {useEffect} from 'react';
import {StatusBar} from 'react-native';
import SplashLoading from './screens/splashLoading/splashLoading';
import {ContextProvider} from './utils/contextModule';
import AppStateListener from './utils/appStateListener';
import Main from './screens/main/main';
import CardPayment from './screens/cardPayment/cardPayment';

const Stack = createNativeStackNavigator();

export default function App() {
  useEffect(() => {}, []);

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
            // Main
          }
          <Stack.Screen name="Main" component={Main} />
          {
            // Card payment
          }
          <Stack.Screen name="CardPayment" component={CardPayment} />
        </Stack.Navigator>
      </NavigationContainer>
    </ContextProvider>
  );
}
