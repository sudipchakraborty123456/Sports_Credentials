import React from 'react';
import { View, Text, Button, StyleSheet, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const OnboardingScreen3 = ({ navigation }) => {
  const completeOnboarding = async () => {
    await AsyncStorage.setItem('onboardingComplete', 'true');
    navigation.navigate('Login'); // Navigate to the main app
  };

  return (
    <View style={styles.container}>
      <Image source={require('../assets/logo.jpg')} style={styles.image} />
      <Text style={styles.title}>Ready to Get Started?</Text>
      <Text style={styles.description}>
        Join NeoSport and enjoy the best sports experience.
      </Text>
      <Button title="Get Started" onPress={completeOnboarding} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  image: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
});

export default OnboardingScreen3;