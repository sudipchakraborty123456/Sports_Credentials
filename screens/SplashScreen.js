import React, { useEffect, useRef } from 'react';
import { View, Text, Image, StyleSheet, Animated, Easing } from 'react-native';

const SplashScreen = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current; // Initial value for opacity: 0

  useEffect(() => {
    // Start the fade-in animation
    Animated.timing(fadeAnim, {
      toValue: 1, // Animate to opacity: 1
      duration: 2000, // Animation duration in milliseconds
      easing: Easing.linear, // Smooth easing
      useNativeDriver: true, // Use native driver for better performance
    }).start();

    // Navigate to the next screen after 3 seconds
    const timer = setTimeout(() => {
      navigation.replace('Onboarding1'); // Replace with your desired screen
    }, 3000);

    return () => clearTimeout(timer); // Cleanup the timer
  }, [fadeAnim, navigation]);

  return (
    <View style={styles.container}>
      <Animated.View style={{ opacity: fadeAnim }}>
        <Image
          source={require('../assets/logo.webp')} // Replace with your logo
          style={styles.logo}
        />
      </Animated.View>
      <Animated.View style={{ opacity: fadeAnim }}>
        <Text style={styles.text}>A. P. P</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#4a63ff', // Replace with your desired background color
  },
  logo: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    // marginTop: 20,
  },
});

export default SplashScreen;