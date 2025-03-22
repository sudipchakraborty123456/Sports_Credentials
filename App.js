import * as React from 'react';
import { StatusBar } from 'react-native'; // Import StatusBar
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SplashScreen from './screens/SplashScreen';
import LoginScreen from './screens/LoginScreen';
import SignUpScreen from './screens/SignUpScreen';
import DashboardScreen from './screens/DashboardScreen';
import SportsWebsitesScreen from './screens/SportsWebsitesScreen';
import EditProfileScreen from './screens/EditProfileScreen';
import PaymentMethodsScreen from './screens/PaymentMethodsScreen';
import AddPaymentMethodScreen from './screens/AddPaymentMethodScreen';
import WithdrawRequestScreen from './screens/WithdrawRequestScreen';
import OnboardingScreen1 from './screens/OnboardingScreen1';
import OnboardingScreen2 from './screens/OnboardingScreen2';
import OnboardingScreen3 from './screens/OnboardingScreen3';

const Stack = createStackNavigator();

const App = () => {
  const [isOnboardingComplete, setIsOnboardingComplete] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    // Check if onboarding is complete
    const checkOnboardingStatus = async () => {
      const onboardingComplete = await AsyncStorage.getItem('onboardingComplete');
      if (onboardingComplete === 'true') {
        setIsOnboardingComplete(true);
      }
      setIsLoading(false);
    };

    checkOnboardingStatus();
  }, []);

  if (isLoading) {
    return null; // Show a loading spinner or splash screen while checking onboarding status
  }

  return (
    <>
      {/* Set the status bar style */}
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" /> 
      <NavigationContainer>
        <Stack.Navigator initialRouteName={isOnboardingComplete ? 'Splash' : 'Onboarding1'}>
          {/* Onboarding Screens */}
          <Stack.Screen
            name="Onboarding1"
            component={OnboardingScreen1}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Onboarding2"
            component={OnboardingScreen2}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Onboarding3"
            component={OnboardingScreen3}
            options={{ headerShown: false }}
          />

          {/* Existing Screens */}
          <Stack.Screen name="Splash" component={SplashScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          <Stack.Screen name="SignUp" component={SignUpScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ headerShown: false }} />
          <Stack.Screen
            name="SportsWebsites"
            component={SportsWebsitesScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="EditProfile"
            component={EditProfileScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="PaymentMethods"
            component={PaymentMethodsScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="AddPaymentMethod"
            component={AddPaymentMethodScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="WithdrawRequest"
            component={WithdrawRequestScreen}
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
};

export default App;