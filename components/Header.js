import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native'; // Add TouchableOpacity here

const Header = ({ navigation }) => {
  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.navigate('EditProfile')}>
        <Image
          source={{ uri: 'https://img.freepik.com/free-vector/businessman-character-avatar-isolated_24877-60111.jpg?t=st=1741780683~exp=1741784283~hmac=1500acb6157432667546a4180ca46d592543de03ed8ee534fd2ec22c27ac17e6&w=740' }}
          style={styles.profilePic}
        />
      </TouchableOpacity>
      <Text style={styles.headerTitle} onPress={() => navigation.navigate('Dashboard')}>NeoSport</Text>
      <Text style={styles.bellIcon}>💰</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#4a63ff',
    padding: 15,
    paddingTop: 40,
  },
  profilePic: {
    width: 30,
    height: 30,
    backgroundColor: 'white',
    borderRadius: 15,
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  bellIcon: {
    fontSize: 20,
  },
});

export default Header;