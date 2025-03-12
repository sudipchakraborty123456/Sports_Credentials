import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'; // Add TouchableOpacity here

const BottomNav = ({ navigation, activeNav, setActiveNav }) => {
  const navItems = [
    { id: 'home', icon: '🏠', text: 'Home' },
    { id: 'cut', icon: '✂️', text: 'Cut' },
    { id: 'list', icon: '📄', text: 'List' },
    { id: 'settings', icon: '⚙️', text: 'Settings' },
  ];

  return (
    <View style={styles.bottomNav}>
      {navItems.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={[styles.navItem, activeNav === item.id && styles.activeNavItem]}
          onPress={() => {
            setActiveNav(item.id);
            if (item.id === 'settings') {
              navigation.navigate('EditProfile'); // Navigate to EditProfile when settings is clicked
            }
            if (item.id === 'home') {
              navigation.navigate('Dashboard'); // Navigate to EditProfile when settings is clicked
            }
          }}
        >
          <Text style={styles.navIcon}>{item.icon}</Text>
          {activeNav === item.id && <Text style={styles.navText}>{item.text}</Text>}
        </TouchableOpacity>
      ))}
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
  navIcon: {
    fontSize: 22,
  },
  navText: {
    fontSize: 12,
    marginTop: 3,
  },
});

export default BottomNav;