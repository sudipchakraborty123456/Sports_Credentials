import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

const PaymentMethodsScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('bank-transfer');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [paymentType, setPaymentType] = useState('bank-transfer');
  const [bankName, setBankName] = useState('');
  const [accountHolderName, setAccountHolderName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [upiNumber, setUpiNumber] = useState('');
  const [upiQRCode, setUpiQRCode] = useState(null);
  const [cryptoWalletAddress, setCryptoWalletAddress] = useState('');
  const [cryptoQRCode, setCryptoQRCode] = useState(null);
  const [activeNav, setActiveNav] = useState('payment-method');
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const tabs = [
    { id: 'all', text: 'All' },
    { id: 'bank-transfer', text: 'Bank Transfer' },
    { id: 'upi', text: 'UPI' },
    { id: 'crypto', text: 'Crypto' },
  ];

  useFocusEffect(
    useCallback(() => {
      fetchUserId();
    }, [])
  );

  useEffect(() => {
    if (userId) {
      fetchPaymentMethods();
    }
  }, [userId]);

  const fetchUserId = async () => {
    try {
      const logInDataString = await AsyncStorage.getItem('loginData');
      const logInData = logInDataString ? JSON.parse(logInDataString) : null;
      if (logInData && logInData.data.id) {
        setUserId(logInData.data.id);
      } else {
        Alert.alert('Error', 'User ID not found in login data');
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to fetch user ID');
    }
  };

  const fetchPaymentMethods = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://api.hatrickzone.com/api/get-payment-details/${userId}`, {
        method: 'GET',
        headers: {
          'Api-Key': 'base64:ipkojA8a0MLhbxrpG97TJq920WRM/D5rTXdh3uvlT+8=',
          'Content-Type': 'application/json',
        },
      });

      const responseText = await response.text();
      const data = JSON.parse(responseText);

      if (data?.status === true) {
        const formattedMethods = formatPaymentMethods(data?.data);
        setPaymentMethods(formattedMethods);
      } else {
        Alert.alert('Error', 'Failed to fetch payment methods.');
      }
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      Alert.alert('Error', 'An error occurred while fetching payment methods.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchPaymentMethods();
  };

  const formatPaymentMethods = (data) => {
    const formattedMethods = [];

    if (data['bank-transfer'] && Array.isArray(data['bank-transfer'])) {
      data['bank-transfer'].forEach((method, index) => {
        formattedMethods.push({
          id: `bank-${index}`,
          type: 'Bank Transfer',
          details: `Bank: ${method.bank_name}, A/C: ${method.account_number.slice(-4)}`,
        });
      });
    }

    if (data.upi && Array.isArray(data.upi)) {
      data.upi.forEach((method, index) => {
        formattedMethods.push({
          id: `upi-${index}`,
          type: 'UPI',
          details: `UPI ID: ${method.upi_number}`,
        });
      });
    }

    if (data.crypto && Array.isArray(data.crypto)) {
      data.crypto.forEach((method, index) => {
        formattedMethods.push({
          id: `crypto-${index}`,
          type: 'Crypto',
          details: `Wallet: ${method.crypto_wallet.slice(0, 6)}...${method.crypto_wallet.slice(-4)}`,
        });
      });
    }

    return formattedMethods;
  };

  const handleUploadUPIQRCode = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to upload images.');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.cancelled) {
      setUpiQRCode(result.assets[0].uri);
    }
  };

  const renderPaymentForm = () => {
    switch (paymentType) {
      case 'bank-transfer':
        return (
          <>
            <TextInput
              style={styles.input}
              placeholder="Bank Name"
              value={bankName}
              onChangeText={setBankName}
            />
            <TextInput
              style={styles.input}
              placeholder="Account Holder Name"
              value={accountHolderName}
              onChangeText={setAccountHolderName}
            />
            <TextInput
              style={styles.input}
              placeholder="Account Number"
              value={accountNumber}
              onChangeText={setAccountNumber}
              keyboardType="numeric"
            />
            <TextInput
              style={styles.input}
              placeholder="IFSC Code"
              value={ifscCode}
              onChangeText={setIfscCode}
            />
          </>
        );
      case 'upi':
        return (
          <>
            <TextInput
              style={styles.input}
              placeholder="Account Holder Name"
              value={accountHolderName}
              onChangeText={setAccountHolderName}
            />
            <TextInput
              style={styles.input}
              placeholder="UPI Number"
              value={upiNumber}
              onChangeText={setUpiNumber}
            />
            <TouchableOpacity style={styles.uploadButton} onPress={handleUploadUPIQRCode}>
              <Text style={styles.uploadButtonText}>Upload UPI QR Code</Text>
            </TouchableOpacity>
            {upiQRCode && (
              <Image source={{ uri: upiQRCode }} style={styles.qrCodeImage} />
            )}
          </>
        );
      case 'crypto':
        return (
          <>
            <TextInput
              style={styles.input}
              placeholder="Account Holder Name"
              value={accountHolderName}
              onChangeText={setAccountHolderName}
            />
            <TextInput
              style={styles.input}
              placeholder="Crypto Wallet Address"
              value={cryptoWalletAddress}
              onChangeText={setCryptoWalletAddress}
            />
            <TouchableOpacity style={styles.uploadButton} onPress={handleUploadUPIQRCode}>
              <Text style={styles.uploadButtonText}>Upload Crypto QR Code</Text>
            </TouchableOpacity>
            {upiQRCode && (
              <Image source={{ uri: upiQRCode }} style={styles.qrCodeImage} />
            )}
          </>
        );
      default:
        return null;
    }
  };

  const savePaymentDetails = async (paymentData) => {
    setLoading(true);
    try {
      const formData = new FormData();

      formData.append('user_id', paymentData.user_id);
      formData.append('payment_method', paymentData.payment_method);
      formData.append('bank_name', paymentData.bank_name);
      formData.append('account_number', paymentData.account_number);
      formData.append('account_holder_name', paymentData.account_holder_name);
      formData.append('ifc_number', paymentData.ifc_number);
      formData.append('upi_number', paymentData.upi_number);
      formData.append('crypto_wallet', paymentData.crypto_wallet);

      if (paymentData.upi_qr_code) {
        formData.append('upi_qr_code', {
          uri: paymentData.upi_qr_code,
          name: 'upi_qr_code.jpg',
          type: 'image/jpeg',
        });
      }

      const response = await fetch('http://api.hatrickzone.com/api/save-payment-details', {
        method: 'POST',
        headers: {
          'Api-Key': 'base64:ipkojA8a0MLhbxrpG97TJq920WRM/D5rTXdh3uvlT+8=',
        },
        body: formData,
      });

      const responseText = await response.text();
      const data = JSON.parse(responseText);

      if (data.status === true) {
        Alert.alert('Success', 'Payment details saved successfully!');
        fetchPaymentMethods(); // Refresh the list
      } else {
        Alert.alert('Error', 'Failed to save payment details.');
      }
    } catch (error) {
      console.error('Error saving payment details:', error);
      Alert.alert('Error', `An error occurred while saving payment details: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPaymentMethod = () => {
    let paymentData = {
      user_id: userId,
      payment_method: paymentType,
      bank_name: bankName,
      account_holder_name: accountHolderName,
      account_number: accountNumber,
      ifc_number: ifscCode,
      upi_number: upiNumber,
      crypto_wallet: cryptoWalletAddress,
      upi_qr_code: upiQRCode,
    };

    savePaymentDetails(paymentData);
    setModalVisible(false);
    resetForm();
  };

  const resetForm = () => {
    setBankName('');
    setAccountHolderName('');
    setAccountNumber('');
    setIfscCode('');
    setUpiNumber('');
    setUpiQRCode(null);
    setCryptoWalletAddress('');
    setCryptoQRCode(null);
  };

  const handleDeletePayment = async (id) => {
    Alert.alert('Delete Payment', 'Are you sure you want to delete this payment method?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setLoading(true);
          try {
            const response = await fetch('http://api.hatrickzone.com/api/delete-payment-details', {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'Api-Key': 'base64:ipkojA8a0MLhbxrpG97TJq920WRM/D5rTXdh3uvlT+8=',
              },
              body: JSON.stringify({
                user_id: userId,
                id: id,
              }),
            });

            const responseText = await response.text();
            const data = JSON.parse(responseText);

            if (data?.status === true) {
              // Remove the deleted payment method from the local state
              setPaymentMethods(paymentMethods.filter((payment) => payment.id !== id));
              Alert.alert('Success', 'Payment method deleted successfully!');
            } else {
              Alert.alert('Error', 'Failed to delete payment method.');
            }
          } catch (error) {
            console.error('Error deleting payment method:', error);
            Alert.alert('Error', 'An error occurred while deleting the payment method.');
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Header navigation={navigation} />

      <ScrollView
        style={styles.liveList}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#4a63ff']}
          />
        }
      >
        {loading ? (
          <ActivityIndicator size="large" color="#4a63ff" style={styles.loadingIndicator} />
        ) : (
          <>
            {/* Bank Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Bank</Text>
              <View style={styles.cardList}>
                {paymentMethods
                  .filter((payment) => payment.type === 'Bank Transfer')
                  .map((payment) => (
                    <View key={payment.id} style={styles.card}>
                      <Text style={styles.cardTitle}>
                        Account Holder: <Text style={styles.link}>{payment.account_holder_name}</Text>
                      </Text>
                      <View style={styles.cardItem}>
                        <Text>Bank Name:</Text>
                        <Text>{payment.details.split(',')[0].replace('Bank: ', '')}</Text>
                      </View>
                      <View style={styles.cardItem}>
                        <Text>Account #:</Text>
                        <Text>{payment.details.split(',')[1].replace(' A/C: ', '')}</Text>
                      </View>
                      <View style={styles.cardItem}>
                        <Text>IFSC No:</Text>
                        <Text>{payment.details.split(',')[2]?.replace(' IFSC: ', '') || 'N/A'}</Text>
                      </View>
                      <View style={styles.actions}>
                        <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeletePayment(payment.id)}>
                          <Text>🗑️ Delete</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
              </View>
            </View>

            {/* UPI Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>UPI</Text>
              <View style={styles.cardList}>
                {paymentMethods
                  .filter((payment) => payment.type === 'UPI')
                  .map((payment) => (
                    <View key={payment.id} style={styles.card}>
                      <Text style={styles.cardTitle}>
                        Account Holder: <Text style={styles.link}>{payment.account_holder_name}</Text>
                      </Text>
                      <View style={styles.cardItem}>
                        <Text>UPI ID:</Text>
                        <Text>{payment.details.replace('UPI ID: ', '')}</Text>
                      </View>
                      <View style={styles.actions}>
                        <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeletePayment(payment.id)}>
                          <Text>🗑️ Delete</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
              </View>
            </View>

            {/* Crypto Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Crypto</Text>
              <View style={styles.cardList}>
                {paymentMethods
                  .filter((payment) => payment.type === 'Crypto')
                  .map((payment) => (
                    <View key={payment.id} style={styles.card}>
                      <Text style={styles.cardTitle}>
                        Account Holder: <Text style={styles.link}>{payment.account_holder_name}</Text>
                      </Text>
                      <View style={styles.cardItem}>
                        <Text>Crypto Wallet:</Text>
                        <Text>{payment.details.replace('Wallet: ', '')}</Text>
                      </View>
                      <View style={styles.actions}>
                        <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeletePayment(payment.id)}>
                          <Text>🗑️ Delete</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
              </View>
            </View>
          </>
        )}
      </ScrollView>

      <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
        <Text style={styles.addButtonText}>+ Add Payment Method</Text>
      </TouchableOpacity>

      <BottomNav navigation={navigation} activeNav={activeNav} setActiveNav={setActiveNav} />

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Payment Method</Text>
            <View style={styles.paymentTypeButtons}>
              <TouchableOpacity
                style={[styles.paymentTypeButton, paymentType === 'bank-transfer' && styles.activePaymentTypeButton]}
                onPress={() => setPaymentType('bank-transfer')}
              >
                <Text style={styles.paymentTypeButtonText}>Bank Transfer</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.paymentTypeButton, paymentType === 'upi' && styles.activePaymentTypeButton]}
                onPress={() => setPaymentType('upi')}
              >
                <Text style={styles.paymentTypeButtonText}>UPI</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.paymentTypeButton, paymentType === 'crypto' && styles.activePaymentTypeButton]}
                onPress={() => setPaymentType('crypto')}
              >
                <Text style={styles.paymentTypeButtonText}>Crypto</Text>
              </TouchableOpacity>
            </View>
            {renderPaymentForm()}
            <TouchableOpacity style={styles.submitButton} onPress={handleAddPaymentMethod}>
              <Text style={styles.submitButtonText}>Add</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f4',
  },
  liveList: {
    flex: 1,
    padding: 10,
    paddingBottom: 70, // Space for bottom navigation
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  cardList: {
    gap: 16,
  },
  card: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  link: {
    color: '#2563eb',
    fontWeight: '500',
  },
  cardItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 6,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  deleteButton: {
    backgroundColor: '#fee2e2',
    borderWidth: 1,
    borderColor: '#ef4444',
    borderRadius: 6,
    padding: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButton: {
    backgroundColor: '#4a63ff',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    margin: 10,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingIndicator: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  paymentTypeButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  paymentTypeButton: {
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#ddd',
    marginHorizontal: 5,
  },
  activePaymentTypeButton: {
    backgroundColor: '#4a63ff',
  },
  paymentTypeButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  input: {
    width: '100%',
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  uploadButton: {
    backgroundColor: '#4a63ff',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
  uploadButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  qrCodeImage: {
    width: 100,
    height: 100,
    marginTop: 10,
  },
  submitButton: {
    backgroundColor: '#4a63ff',
    padding: 10,
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  closeButton: {
    backgroundColor: '#ff4d4d',
    padding: 10,
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default PaymentMethodsScreen;