import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';

const paymentMethods = [
  { id: '1', type: 'Credit/Debit Card', details: '**** **** **** 1234' },
  { id: '2', type: 'UPI', details: 'user@upi' },
  { id: '3', type: 'Net Banking', details: 'Bank Name' },
  { id: '4', type: 'E-wallet', details: 'Wallet Name' },
];

const PaymentMethodsScreen = () => {
  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <Text style={styles.title}>{item.type}</Text>
      <Text style={styles.details}>{item.details}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={paymentMethods}
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
  item: {
    backgroundColor: '#f9c2ff',
    padding: 20,
    marginVertical: 8,
    borderRadius: 5,
  },
  title: {
    fontSize: 18,
  },
  details: {
    fontSize: 14,
    color: '#666',
  },
});

export default PaymentMethodsScreen;