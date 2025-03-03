import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import SplashScreen from './screens/SplashScreen';
import LoginScreen from './screens/LoginScreen.js';
import SignUpScreen from './screens/SignUpScreen.js';
import DashboardScreen from './screens/DashboardScreen.js';
import SportsWebsitesScreen from './screens/SportsWebsitesScreen.js';
import EditProfileScreen from './screens/EditProfileScreen.js';
import PaymentMethodsScreen from './screens/PaymentMethodsScreen.js';
import AddPaymentMethodScreen from './screens/AddPaymentMethodScreen.js';
import WithdrawRequestScreen from './screens/WithdrawRequestScreen.js';

const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Splash">
        <Stack.Screen name="Splash" component={SplashScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }}/>
        <Stack.Screen name="SignUp" component={SignUpScreen} options={{ headerShown: false }}/>
        <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ headerShown: false }}/>
        <Stack.Screen name="SportsWebsites" component={SportsWebsitesScreen} options={{ headerShown: false }}/>
        <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ headerShown: false }}/>
        <Stack.Screen name="PaymentMethods" component={PaymentMethodsScreen} options={{ headerShown: false }}/>
        <Stack.Screen name="AddPaymentMethod" component={AddPaymentMethodScreen} options={{ headerShown: false }}/>
        <Stack.Screen name="WithdrawRequest" component={WithdrawRequestScreen} options={{ headerShown: false }}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;