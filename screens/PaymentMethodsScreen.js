import React, { useState } from 'react';
import { View, ScrollView, Text, TextInput, TouchableOpacity, StyleSheet, Modal, Alert, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker'; // Import expo-image-picker
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';

const PaymentMethodsScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('all');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [paymentType, setPaymentType] = useState(''); // Tracks the type of payment being added (bank, upi, crypto)
  const [bankName, setBankName] = useState('');
  const [accountHolderName, setAccountHolderName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [upiNumber, setUpiNumber] = useState('');
  const [upiQRCode, setUpiQRCode] = useState(null); // Stores the UPI QR Code image URI
  const [cryptoWalletAddress, setCryptoWalletAddress] = useState('');
  const [cryptoQRCode, setCryptoQRCode] = useState(null); // Stores the Crypto QR Code image URI
  const [activeNav, setActiveNav] = useState('payment-method');
  const [paymentMethods, setPaymentMethods] = useState([
    { id: '1', type: 'Bank Transfer', details: 'Bank: SBI, A/C: ****1234' },
    { id: '2', type: 'UPI', details: 'UPI ID: user@upi' },
    { id: '3', type: 'Crypto', details: 'Wallet: 0x123...abc' },
  ]);

  const tabs = [
    { id: 'all', text: 'All' },
    { id: 'bank-transfer', text: 'Bank Transfer' },
    { id: 'upi', text: 'UPI' },
    { id: 'crypto', text: 'Crypto' },
  ];

  // Function to handle UPI QR Code upload
  const handleUploadUPIQRCode = async () => {
    // Request permission to access the media library
    
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to upload images.');
      return;
    }
    
    // Launch the image picker
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1], // Square aspect ratio for QR codes
      quality: 1,
    });
    if (!result.cancelled) {
      setUpiQRCode(result.assets[0].uri); 
    }
  };

  const savePaymentDetails = async (paymentData) => {
    try {
      // Create a FormData object
      const formData = new FormData();
  
      // Append all fields to the FormData object
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
  
      // Append the UPI QR Code file if it exists
      if (paymentData.upi_qr_code) {
        formData.append('upi_qr_code', {
          uri: paymentData.upi_qr_code,
          name: 'upi_qr_code.jpg', 
          type: 'image/jpeg', 
        });
      }
      for (let [key, value] of formData.entries()) {
        console.log(key, value);
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
  
      // if (!response.ok) {
      //   throw new Error(`HTTP error! Status: ${response.status}`);
      // }
  
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
    }
  };

  const handleAddPaymentMethod = () => {
    let newPaymentMethod;
    let paymentData = {
      user_id: '77', // Replace with the actual user ID
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

    // Add the new payment method locally
    setPaymentMethods([...paymentMethods, newPaymentMethod]);

    // Save payment details to the API
    savePaymentDetails(paymentData);

    // Reset form fields
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
            <TouchableOpacity style={styles.uploadButton}  onPress={handleUploadUPIQRCode}>
              <Text style={styles.uploadButtonText}>Upload Crypto QR Code</Text>
            </TouchableOpacity>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <Header navigation={navigation} />

      {/* Tabs */}

      {/* Payment Method Cards */}
      <ScrollView style={styles.paymentList}>
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
      </ScrollView>

      {/* Add Payment Method Button */}
      <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
        <Text style={styles.addButtonText}>+ Add Payment Method</Text>
      </TouchableOpacity>

      {/* Bottom Navigation */}
      <BottomNav navigation={navigation} activeNav={activeNav} setActiveNav={setActiveNav} />

      {/* Modal for Add Payment Method */}
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
});

export default PaymentMethodsScreen;