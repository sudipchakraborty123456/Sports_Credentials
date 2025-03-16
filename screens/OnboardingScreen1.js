import React from 'react';
import { View, Text, Button, StyleSheet, Image } from 'react-native';

const OnboardingScreen1 = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Image source={require('../assets/logo.webp')} style={styles.image} />
      <Text style={styles.title}>Welcome to A.P.P !</Text>
      <Text style={styles.description}>
        Discover the best sports events and stay updated with live scores.
      </Text>
      <Button title="Next" onPress={() => navigation.navigate('Onboarding2')} />
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
    // marginBottom: 10,
    resizeMode: 'contain',
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

export default OnboardingScreen1;