import React, { useState, useEffect } from 'react';
import { View, ScrollView, Text, TextInput, TouchableOpacity, StyleSheet, Modal, Alert, Image, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  const [logInData, setIsLogInData] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const tabs = [
    { id: 'all', text: 'All' },
    { id: 'bank-transfer', text: 'Bank Transfer' },
    { id: 'upi', text: 'UPI' },
    { id: 'crypto', text: 'Crypto' },
  ];
  useEffect(() => {
    const fetchLoginStatus = async () => {
      try {
        const logedIn = await AsyncStorage.getItem('isLoggedIn');
        setIsLoggedIn(logedIn === 'true');
        const logInData = await AsyncStorage.getItem('loginData');
        setIsLogInData(logInData ? JSON.parse(logInData) : null);
      } catch (error) {
        console.error('Error fetching login status or data:', error);
      }
    };

    fetchLoginStatus();
    // fetchData(); 
  }, []);
  useEffect(() => {
    const fetchPaymentMethods = async () => {
      setLoading(true);
      try {
        console.log(logInData.data.id);
        
        const response = await fetch(`http://api.hatrickzone.com/api/get-payment-details/27`, {
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
      }
    };

    fetchPaymentMethods();
  }, []);

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

  const savePaymentDetails = async (paymentData) => {
    setLoading(true);
    try {
      const formData = new FormData();

      formData.append('user_id', paymentData.user_id);
      formData.append('payment_method', paymentData.payment_method);
      formData.append('bank_name', paymentData.bank_name);
      formData.append('account_number', paymentData.account_number);
      formData.append('account_holder_name', paymentData.account_holder_name);
      formData.append('iban_number', paymentData.iban_number);
      formData.append('branch_name', paymentData.branch_name);
      formData.append('crypto_wallet', paymentData.crypto_wallet);
      formData.append('upi_number', paymentData.upi_number);
      formData.append('ifc_number', paymentData.ifc_number);

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
      console.log('API Response Text:', responseText);

      const data = JSON.parse(responseText);
      console.log('API Response Data:', data);

      if (data.status === true) {
        Alert.alert('Success', 'Payment details saved successfully!');
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
    let newPaymentMethod;
    let paymentData = {
      user_id: logInData.data.id,
      payment_method: paymentType,
      bank_name: bankName,
      account_holder_name: accountHolderName,
      account_number: accountNumber,
      ifc_number: ifscCode,
      upi_number: upiNumber,
      crypto_wallet: cryptoWalletAddress,
      upi_qr_code: upiQRCode,
    };

    switch (paymentType) {
      case 'bank-transfer':
        if (!bankName || !accountHolderName || !accountNumber || !ifscCode) {
          Alert.alert('Error', 'Please fill in all fields for Bank Transfer.');
          return;
        }
        newPaymentMethod = {
          id: String(paymentMethods.length + 1),
          type: 'Bank Transfer',
          details: `Bank: ${bankName}, A/C: ${accountNumber.slice(-4)}`,
        };
        break;
      case 'upi':
        if (!accountHolderName || !upiNumber) {
          Alert.alert('Error', 'Please fill in all fields for UPI.');
          return;
        }
        newPaymentMethod = {
          id: String(paymentMethods.length + 1),
          type: 'UPI',
          details: `UPI ID: ${upiNumber}`,
        };
        break;
      case 'crypto':
        if (!accountHolderName || !cryptoWalletAddress) {
          Alert.alert('Error', 'Please fill in all fields for Crypto.');
          return;
        }
        newPaymentMethod = {
          id: String(paymentMethods.length + 1),
          type: 'Crypto',
          details: `Wallet: ${cryptoWalletAddress.slice(0, 6)}...${cryptoWalletAddress.slice(-4)}`,
        };
        break;
      default:
        Alert.alert('Error', 'Please select a payment type.');
        return;
    }

    setPaymentMethods([...paymentMethods, newPaymentMethod]);
    savePaymentDetails(paymentData);

    setModalVisible(false);
    setBankName('');
    setAccountHolderName('');
    setAccountNumber('');
    setIfscCode('');
    setUpiNumber('');
    setUpiQRCode(null);
    setCryptoWalletAddress('');
    setCryptoQRCode(null);
  };

  const handleViewDetails = (payment) => {
    setSelectedPayment(payment);
    setModalVisible(true);
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

  return (
    <View style={styles.container}>
      <Header navigation={navigation} />

      <ScrollView style={styles.paymentList}>
        {loading ? (
          <ActivityIndicator size="large" color="#4a63ff" style={styles.loadingIndicator} />
        ) : (
          <View style={styles.paymentRow}>
            {paymentMethods.map((payment) => (
              <TouchableOpacity
                key={payment.id}
                style={styles.paymentCard}
                onPress={() => handleViewDetails(payment)}
              >
                <Text style={styles.paymentType}>{payment.type}</Text>
                <Text style={styles.paymentDetails}>{payment.details}</Text>
              </TouchableOpacity>
            ))}
          </View>
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
  tabs: {
    backgroundColor: 'white',
    paddingVertical: 10,
  },
  tab: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    opacity: 0.6,
  },
  activeTab: {
    opacity: 1,
    borderBottomWidth: 2,
    borderBottomColor: '#4a63ff',
  },
  tabText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  paymentList: {
    flex: 1,
    paddingHorizontal: 10,
    marginTop: 10,
  },
  paymentRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  paymentCard: {
    width: '48%',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  paymentType: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  paymentDetails: {
    fontSize: 14,
    color: '#666',
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
  loadingIndicator: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
});

export default PaymentMethodsScreen;