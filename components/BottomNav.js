import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; // Import the icon library

const BottomNav = ({ navigation, activeNav, setActiveNav }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check login status when the component mounts
  useEffect(() => {
    const checkLoginStatus = async () => {
      const loggedIn = await AsyncStorage.getItem('isLoggedIn');
      setIsLoggedIn(loggedIn === 'true');
    };

    checkLoginStatus();
  }, []);

  // Define navigation items with vector icons
  const navItems = [
    { id: 'home', icon: 'home', text: 'Home' },
    ...(isLoggedIn ? [{ id: 'payment-method', icon: 'credit-card', text: 'Payment Method' }] : []),
    ...(isLoggedIn ? [{ id: 'list', icon: 'format-list-bulleted', text: 'Add Payment' }] : []),
    ...(isLoggedIn ? [{ id: 'settings', icon: 'cog', text: 'Settings' }] : []),
    ,
  ];

  const handleLogout = async () => {
    try {
      await AsyncStorage.setItem('isLoggedIn', 'false'); // Update AsyncStorage
      await AsyncStorage.setItem('loginData', JSON.stringify(null));
      setIsLoggedIn(false); // Update login state
      navigation.navigate('Login'); // Redirect to Login after logout
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <View style={styles.bottomNav}>
      {navItems.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={[styles.navItem, activeNav === item.id && styles.activeNavItem]}
          onPress={() => {
            setActiveNav(item.id); // Set active navigation item
            if (item.id === 'settings') {
              navigation.navigate('EditProfile'); // Navigate to EditProfile when settings is clicked
            }
            if (item.id === 'home') {
              navigation.navigate('Dashboard'); // Navigate to Dashboard when home is clicked
            }
            if (item.id === 'payment-method') {
              navigation.navigate('PaymentMethods');
            }
            if (item.id === 'list') {
              navigation.navigate('AddPaymentMethod');
            }
          }}
        >
          <Icon
            name={item.icon}
            size={24}
            color={activeNav === item.id ? '#007bff' : '#000'}
          />
          {activeNav === item.id && <Text style={styles.navText}>{item.text}</Text>}
        </TouchableOpacity>
      ))}

      {/* Conditionally render Logout Button */}
      {isLoggedIn && (
        <TouchableOpacity style={styles.navItem} onPress={handleLogout}>
          <Icon name="logout" size={24} color="#000" />
          <Text style={styles.navText}>Logout</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  navItem: {
    alignItems: 'center',
  },
  activeNavItem: {
    color: '#007bff',
  },
  navText: {
    fontSize: 12,
    marginTop: 3,
    color: '#000',
  },
});

export default BottomNav;