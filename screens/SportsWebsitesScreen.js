import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';

const websites = [
  { id: '1', name: 'Website 1' },
  { id: '2', name: 'Website 2' },
  { id: '3', name: 'Website 3' },
];

const SportsWebsitesScreen = ({ route }) => {
  const { sport } = route.params;

  const handleGetCredentials = (website) => {
    // Implement logic to get credentials
    alert(`Credentials for ${website.name}`);
  };

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <Text style={styles.title}>{item.name}</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => handleGetCredentials(item)}
      >
        <Text style={styles.buttonText}>Get Credentials</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{sport} Websites</Text>
      <FlatList
        data={websites}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    fontSize: 24,
    marginBottom: 20,
  },
  item: {
    backgroundColor: '#f9c2ff',
    padding: 20,
    marginVertical: 8,
    borderRadius: 5,
  },
  title: {
    fontSize: 18,
  },
  button: {
    marginTop: 10,
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
  },
});

export default SportsWebsitesScreen;