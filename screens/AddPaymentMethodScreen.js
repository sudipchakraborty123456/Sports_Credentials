import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  ActivityIndicator,
  RefreshControl, // Import RefreshControl
  Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect } from '@react-navigation/native';

const PaymentRequest = ({ navigation }) => {
  const [activeNav, setActiveNav] = useState('list');
  const [activeTab, setActiveTab] = useState('deposit');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalVisibleWithdraw, setModalVisibleWithdraw] = useState(false);
  const [requestType, setRequestType] = useState('deposit');
  const [platform, setPlatform] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [receipt, setReceipt] = useState(null);
  const [withdrawRequests, setWithdrawRequests] = useState([]);
  const [depositRequests, setDepositRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);
  const [refreshing, setRefreshing] = useState(false); // State for refresh control
  const [games, setGames] = useState([]);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [myBankAccounts, setMyBankAccounts] = useState([]);

  // Fetch user ID from AsyncStorage
  const fetchUserId = async () => {
    try {
      const logInDataString = await AsyncStorage.getItem('loginData');
      const logInData = logInDataString ? JSON.parse(logInDataString) : null;
      if (logInData && logInData.data.id) {
        setUserId(logInData.data.id);
      } else {
        setError('User ID not found in login data');
      }
    } catch (err) {
      setError('Failed to fetch user ID');
    }
  };

  // Fetch assigned games (platforms)
  const fetchGames = async () => {
    try {
      const response = await fetch(
        `http://api.hatrickzone.com/api/assigned-user-games/${userId}`,
        {
          method: 'GET',
          headers: {
            'Api-Key': 'base64:ipkojA8a0MLhbxrpG97TJq920WRM/D5rTXdh3uvlT+8=',
            'Content-Type': 'application/json',
          },
        }
      );
      const data = await response.json();
      if (data.status) {
        setGames(data.data);
      } else {
        setError(data.message || 'Failed to fetch games');
      }
    } catch (err) {
      setError('An error occurred while fetching games');
    }
  };

  // Fetch admin bank accounts (payment methods)
  const fetchBankAccounts = async () => {
    try {
      const response = await fetch(
        'http://api.hatrickzone.com/api/admin-bank-accounts',
        {
          method: 'GET',
          headers: {
            'Api-Key': 'base64:ipkojA8a0MLhbxrpG97TJq920WRM/D5rTXdh3uvlT+8=',
            'Content-Type': 'application/json',
          },
        }
      );
      const data = await response.json();
      if (data.status) {
        setBankAccounts(data.data);
      } else {
        setError(data.message || 'Failed to fetch bank accounts');
      }
    } catch (err) {
      setError('An error occurred while fetching bank accounts');
    }
  };
  const handleDeleteWithdrawRequest = async (withdrawId) => {
    try {
      const formData = new FormData();
      formData.append('user_id', userId);
      formData.append('withdraw_id', withdrawId);

      const response = await fetch(
        'http://api.hatrickzone.com/api/delete-withdraw-request',
        {
          method: 'POST',
          headers: {
            'Api-Key': 'base64:ipkojA8a0MLhbxrpG97TJq920WRM/D5rTXdh3uvlT+8=',
            'Content-Type': 'multipart/form-data',
          },
          body: formData,
        }
      );
      const data = await response.json();
      if (data.status) {
        Alert.alert('Success', data.message);
        fetchWithdrawRequests(); // Refresh withdraw requests
      } else {
        Alert.alert('Error', data.message || 'Failed to delete withdraw request');
      }
    } catch (err) {
      Alert.alert('Error', 'An error occurred while deleting the withdraw request');
    }
  };
  const fetchMyBankAccounts = async () => {
    try {
      const response = await fetch(
        `http://api.hatrickzone.com/api/get-payment-details/${userId}`,
        {
          method: 'GET',
          headers: {
            'Api-Key': 'base64:ipkojA8a0MLhbxrpG97TJq920WRM/D5rTXdh3uvlT+8=',
            'Content-Type': 'application/json',
          },
        }
      );
      const data = await response.json();
      if (data.status) {
        setMyBankAccounts(data.data);
      } else {
        setError(data.message || 'Failed to fetch bank accounts');
      }
    } catch (err) {
      setError('An error occurred while fetching bank accounts');
    }
  };
  // Handle image upload
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission denied', 'You need to grant permission to access the gallery.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.cancelled) {
      setReceipt(result.assets[0].uri);
    }
  };

  // Handle deposit request submission
  const handleDepositSubmit = async () => {
    if (!platform || !amount || !paymentMethod || !receipt) {
      Alert.alert('Error', 'Please fill all fields and upload a receipt.');
      return;
    }

    if (parseFloat(amount) > 10000) {
      Alert.alert('Error', 'Amount should be under 10,000.');
      return;
    }

    const formData = new FormData();
    formData.append('user_id', userId);
    formData.append('game_id', platform);
    formData.append('amount', amount);
    formData.append('admin_bank_id', paymentMethod);
    formData.append('image', {
      uri: receipt,
      name: 'receipt.jpg',
      type: 'image/jpeg',
    });

    try {
      const response = await fetch(
        'http://api.hatrickzone.com/api/deposit-request',
        {
          method: 'POST',
          headers: {
            'Api-Key': 'base64:ipkojA8a0MLhbxrpG97TJq920WRM/D5rTXdh3uvlT+8=',
            'Content-Type': 'multipart/form-data',
          },
          body: formData,
        }
      );
      const data = await response.json();
      if (data.status) {
        Alert.alert('Success', data.message);
        setModalVisible(false);
        fetchDepositRequests(); // Refresh deposit requests
      } else {
        Alert.alert('Error', data.message || 'Failed to create deposit request');
      }
    } catch (err) {
      Alert.alert('Error', 'An error occurred while submitting the request');
    }
  };

  // Fetch deposit requests
  const fetchDepositRequests = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://api.hatrickzone.com/api/deposit-request-list/${userId}`,
        {
          method: 'GET',
          headers: {
            'Api-Key': 'base64:ipkojA8a0MLhbxrpG97TJq920WRM/D5rTXdh3uvlT+8=',
            'Content-Type': 'application/json',
          },
        }
      );
      const data = await response.json();
      if (data.status) {
        setDepositRequests(data.data);
      } else {
        setError(data.message || 'Failed to fetch deposit requests');
      }
    } catch (err) {
      setError('An error occurred while fetching deposit requests');
    } finally {
      setLoading(false);
    }
  };

  // Fetch withdraw requests
  const fetchWithdrawRequests = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://api.hatrickzone.com/api/withdraw-request-list/${userId}`,
        {
          method: 'GET',
          headers: {
            'Api-Key': 'base64:ipkojA8a0MLhbxrpG97TJq920WRM/D5rTXdh3uvlT+8=',
            'Content-Type': 'application/json',
          },
        }
      );
      const data = await response.json();
      if (data.status) {
        setWithdrawRequests(data.data);
      } else {
        setError(data.message || 'Failed to fetch withdraw requests');
      }
    } catch (err) {
      setError('An error occurred while fetching withdraw requests');
    } finally {
      setLoading(false);
    }
  };

  // Handle refresh
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      if (activeTab === 'deposit') {
        await fetchDepositRequests();
      } else {
        await fetchWithdrawRequests();
      }
    } catch (err) {
      setError('Failed to refresh data');
    } finally {
      setRefreshing(false);
    }
  };


  useFocusEffect(
    useCallback(() => {
      fetchUserId();
    }, [])
  );
  const handleWithdrawSubmit = async () => {
    if (!platform || !amount || !paymentMethod) {
      Alert.alert('Error', 'Please fill all fields.');
      return;
    }

    if (parseFloat(amount) > 10000) {
      Alert.alert('Error', 'Amount should be under 10,000.');
      return;
    }

    const formData = new FormData();
    formData.append('user_id', userId);
    formData.append('game_id', platform);
    formData.append('amount', amount);
    formData.append('account_id', paymentMethod);

    try {
      const response = await fetch(
        'http://api.hatrickzone.com/api/withdraw-request',
        {
          method: 'POST',
          headers: {
            'Api-Key': 'base64:ipkojA8a0MLhbxrpG97TJq920WRM/D5rTXdh3uvlT+8=',
            'Content-Type': 'multipart/form-data',
          },
          body: formData,
        }
      );
      const data = await response.json();
      if (data.status) {
        Alert.alert('Success', data.message);
        setModalVisibleWithdraw(false);
        fetchWithdrawRequests(); // Refresh withdraw requests
      } else {
        Alert.alert('Error', data.message || 'Failed to create withdraw request');
      }
    } catch (err) {
      Alert.alert('Error', 'An error occurred while submitting the request');
    }
  };
  // Fetch games and bank accounts when the modal is opened
  useEffect(() => {
    if (modalVisible && userId) {
      fetchGames();
      fetchBankAccounts();
    }
    if (modalVisibleWithdraw && userId) {
      fetchGames();
      fetchMyBankAccounts();
    }
  }, [modalVisible, modalVisibleWithdraw, userId]);

  // Fetch requests based on active tab
  useEffect(() => {
    if (userId) {
      if (activeTab === 'deposit') {
        fetchDepositRequests();
      } else {
        fetchWithdrawRequests();
      }
    }
  }, [activeTab, userId]);
  const handleDeleteDepositRequest = async (depositId) => {
    try {
      const formData = new FormData();
      formData.append('user_id', userId);
      formData.append('deposit_id', depositId);

      const response = await fetch(
        'http://api.hatrickzone.com/api/delete-deposit-request',
        {
          method: 'POST',
          headers: {
            'Api-Key': 'base64:ipkojA8a0MLhbxrpG97TJq920WRM/D5rTXdh3uvlT+8=',
            'Content-Type': 'multipart/form-data',
          },
          body: formData,
        }
      );
      const data = await response.json();
      if (data.status) {
        Alert.alert('Success', data.message);
        fetchDepositRequests(); // Refresh deposit requests
      } else {
        Alert.alert('Error', data.message || 'Failed to delete deposit request');
      }
    } catch (err) {
      Alert.alert('Error', 'An error occurred while deleting the deposit request');
    }
  };
  return (
    <View style={styles.container}>
      {/* Header */}
      <Header title="NeoSport" navigation={navigation} />

      {/* Tab Buttons */}
      <View style={styles.tabButtons}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'deposit' && styles.activeTabBtn]}
          onPress={() => setActiveTab('deposit')}
        >
          <Text style={styles.tabBtnText}>Deposit Requests List</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'withdraw' && styles.activeTabBtn]}
          onPress={() => setActiveTab('withdraw')}
        >
          <Text style={styles.tabBtnText}>Withdraw Requests List</Text>
        </TouchableOpacity>
      </View>

      {/* Request List with RefreshControl */}
      <ScrollView
        style={styles.liveList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.requestSection}>
          {activeTab === 'deposit' ? (
            <>
              <View style={styles.actionsReq}>
                <TouchableOpacity
                  style={styles.addBtn}
                  onPress={() => setModalVisible(true)}
                >
                  <Text style={styles.addBtnText}>+ Deposit Request</Text>
                </TouchableOpacity>
              </View>
              {/* Deposit Request Cards */}
              {depositRequests.map((request) => (
                <View key={request.deposit_id} style={styles.requestCard}>
                  <View style={styles.requestInfo}>
                    <Text style={styles.requestId}>#{request.deposit_id}</Text>
                    <Text style={styles.platformName}>Game ID: {request.game_id}</Text>
                    <Text style={styles.requestedOn}>{request.created_at}</Text>
                    <Text style={styles.amount}>Amount: ₹{request.amount}</Text>
                    <Text style={styles.statusPending}>{request.status}</Text>
                  </View>
                  <View style={styles.actions}>
                    <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDeleteDepositRequest(request.deposit_id)}>
                      <Text>🗑️</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </>
          ) : (
            <>
              <View style={styles.actionsReq}>
                <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisibleWithdraw(true)}>
                  <Text style={styles.addBtnText}>+ Withdraw Request</Text>
                </TouchableOpacity>
              </View>
              {/* Withdraw Request Cards */}
              {withdrawRequests.map((request) => (
                <View key={request.withdrawal_id} style={styles.requestCard}>
                  <View style={styles.requestInfo}>
                    <Text style={styles.requestId}>#{request.withdrawal_id}</Text>
                    <Text style={styles.platformName}>
                      {request.account ? request.account.payment_method : 'N/A'}
                    </Text>
                    <Text style={styles.requestedOn}>{request.created_at}</Text>
                    <Text style={styles.amount}>Amount: ₹{request.amount}</Text>
                    <Text style={styles.utr}>
                      UPI: {request.account ? request.account.upi_number : 'N/A'}
                    </Text>
                    <Text style={styles.statusPending}>{request.status}</Text>
                  </View>
                  <View style={styles.actions}>
                    <TouchableOpacity style={styles.deleteBtn}   onPress={() => handleDeleteWithdrawRequest(request.withdrawal_id)}>
                      <Text>🗑️</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </>
          )}
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomNav navigation={navigation} activeNav={activeNav} setActiveNav={setActiveNav} />

      {/* Modal for Deposit Request */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.closeBtn} onPress={() => setModalVisible(false)}>
              <Text>&times;</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Create Deposit Request</Text>

            {/* Choose Platform */}
            <Text style={styles.label}>Choose Platform</Text>
            <Picker
              selectedValue={platform}
              onValueChange={(itemValue) => setPlatform(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Choose platform" value="" />
              {games.map((game) => (
                <Picker.Item key={game.game_id} label={game.game_name} value={game.game_id} />
              ))}
            </Picker>

            {/* Amount */}
            <Text style={styles.label}>Amount</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter amount"
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
            />

            {/* Select Payment Method */}
            <Text style={styles.label}>Select Payment Method</Text>
            <Picker
              selectedValue={paymentMethod}
              onValueChange={(itemValue) => setPaymentMethod(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Choose Account" value="" />
              {Object.entries(bankAccounts).map(([type, accounts]) =>
                accounts.map((account) => (
                  <Picker.Item
                    key={account.id}
                    label={`${type} - ${account.account_holder_name}`}
                    value={account.id}
                  />
                ))
              )}
            </Picker>

            {/* File Upload */}
            <Text style={styles.label}>Choose your payment receipt</Text>
            <TouchableOpacity style={styles.uploadBtn} onPress={pickImage}>
              <Text style={styles.uploadBtnText}>Upload Receipt</Text>
            </TouchableOpacity>
            {receipt && <Text style={styles.fileName}>File: {receipt}</Text>}

            {/* Submit Button */}
            <TouchableOpacity style={styles.submitBtn} onPress={handleDepositSubmit}>
              <Text style={styles.submitBtnText}>Send Request</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      {/* Modal for withdraw Request */}
      {/* Modal for Withdraw Request */}
      <Modal visible={modalVisibleWithdraw} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.closeBtn} onPress={() => setModalVisibleWithdraw(false)}>
              <Text>&times;</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Create Withdraw Request</Text>

            {/* Choose Platform */}
            <Text style={styles.label}>Choose Platform</Text>
            <Picker
              selectedValue={platform}
              onValueChange={(itemValue) => setPlatform(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Choose platform" value="" />
              {games.map((game) => (
                <Picker.Item key={game.game_id} label={game.game_name} value={game.game_id} />
              ))}
            </Picker>

            {/* Enter Amount */}
            <Text style={styles.label}>Enter Amount</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter amount"
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
            />

            {/* Select Payment Method */}
            <Text style={styles.label}>Select Payment Method</Text>
            <Picker
              selectedValue={paymentMethod}
              onValueChange={(itemValue) => setPaymentMethod(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Choose payment method" value="" />
              {/* Display Bank Transfer Payment Methods */}
              {myBankAccounts['bank-transfer'] &&
                myBankAccounts['bank-transfer'].map((bank) => (
                  <Picker.Item
                    key={bank.id}
                    label={`Bank: ${bank.bank_name} (${bank.account_holder_name})`}
                    value={bank.id}
                  />
                ))}
              {/* Display UPI Payment Methods */}
              {myBankAccounts.upi &&
                myBankAccounts.upi.map((upi) => (
                  <Picker.Item
                    key={upi.id}
                    label={`UPI: ${upi.upi_number} (${upi.account_holder_name})`}
                    value={upi.id}
                  />
                ))}
              {/* Display Crypto Payment Methods */}
              {myBankAccounts.crypto &&
                myBankAccounts.crypto.map((crypto) => (
                  <Picker.Item
                    key={crypto.id}
                    label={`Crypto: ${crypto.crypto_wallet} (${crypto.account_holder_name})`}
                    value={crypto.id}
                  />
                ))}
            </Picker>

            {/* Submit Button */}
            <TouchableOpacity style={styles.submitBtn} onPress={handleWithdrawSubmit}>
              <Text style={styles.submitBtnText}>Send Request</Text>
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
  tabButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    margin: 10,
  },
  tabBtn: {
    flex: 1,
    padding: 10,
    backgroundColor: '#e5e7eb',
    borderRadius: 8,
    alignItems: 'center',
  },
  activeTabBtn: {
    backgroundColor: '#3b82f6',
  },
  tabBtnText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  liveList: {
    flex: 1,
    padding: 10,
  },
  requestSection: {
    marginBottom: 70,
  },
  actionsReq: {
    marginBottom: 10,
  },
  addBtn: {
    backgroundColor: '#dc2625',
    padding: 6,
    borderRadius: 6,
    alignItems: 'center',
  },
  addBtnText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  requestCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  requestInfo: {
    flex: 1,
  },
  requestId: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  platformName: {
    fontSize: 14,
    color: '#374151',
  },
  requestedOn: {
    fontSize: 12,
    color: '#6b7280',
  },
  amount: {
    fontSize: 12,
    color: '#6b7280',
  },
  utr: {
    fontSize: 12,
    color: '#6b7280',
  },
  statusPending: {
    fontSize: 12,
    fontWeight: 'bold',
    backgroundColor: '#bfdbfe',
    color: '#2563eb',
    padding: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  viewBtn: {
    backgroundColor: '#f3f4f6',
    padding: 6,
    borderRadius: 8,
  },
  deleteBtn: {
    backgroundColor: '#fee2e2',
    padding: 6,
    borderRadius: 8,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    width: '90%',
    maxWidth: 400,
  },
  closeBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  picker: {
    width: '100%',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
  },
  input: {
    width: '100%',
    padding: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
  },
  uploadBtn: {
    backgroundColor: '#3b82f6',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 15,
  },
  uploadBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  fileName: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 15,
  },
  submitBtn: {
    backgroundColor: '#3b82f6',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  submitBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default PaymentRequest;