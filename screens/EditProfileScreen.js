import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from '../components/Header'; // Import Header
import BottomNav from '../components/BottomNav'; // Import BottomNav

const EditProfileScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [description, setDescription] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [activeNav, setActiveNav] = useState('edit-profile'); // Set active nav for BottomNav

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const logInDataString = await AsyncStorage.getItem('loginData');
      const logInData = logInDataString ? JSON.parse(logInDataString) : null;
      if (logInData && logInData.data.id) {
        setUserId(logInData.data.id);
        // Pre-fill form with existing user data (if available)
        setName(logInData.data.name || '');
        setUsername(logInData.data.username || '');
        setEmail(logInData.data.email || '');
        setPhoneNumber(logInData.data.phone_number || '');
        setDescription(logInData.data.description || '');
        setProfileImage(logInData.data.profile_image || null);
      } else {
        Alert.alert('Error', 'User data not found.');
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to fetch user data.');
    }
  };

  const handleUploadProfileImage = async () => {
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
      setProfileImage(result.assets[0].uri);
    }
  };

  const handleUpdateProfile = async () => {
    if (!userId) {
      Alert.alert('Error', 'User ID not found.');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();

      formData.append('user_id', userId);
      formData.append('phone_number', phoneNumber);
      formData.append('name', name);
      formData.append('username', username);
      formData.append('email', email);
      formData.append('description', description);

      if (profileImage) {
        formData.append('profile_image', {
          uri: profileImage,
          name: 'profile_image.jpg',
          type: 'image/jpeg',
        });
      }

      const response = await fetch('http://api.hatrickzone.com/api/update-profile', {
        method: 'POST',
        headers: {
          'Api-Key': 'base64:ipkojA8a0MLhbxrpG97TJq920WRM/D5rTXdh3uvlT+8=',
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      const responseText = await response.text();
      const data = JSON.parse(responseText);

      if (data?.status === true) {
        Alert.alert('Success', 'Profile updated successfully!');
        navigation.goBack(); // Navigate back to the previous screen
      } else {
        Alert.alert('Error', data?.message || 'Failed to update profile.');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'An error occurred while updating the profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header Component */}
      <Header navigation={navigation} title="Edit Profile" />

      {/* Scrollable Content */}
      <ScrollView style={styles.scrollView}>
        <View style={styles.form}>
          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            style={[styles.input, !editable && styles.disabledInput]} // Apply disabled style
            placeholder="Enter phone number"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
            editable={false} // Disable the input field
          />

          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your name"
            value={name}
            onChangeText={setName}
          />

          <Text style={styles.label}>Username</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter username"
            value={username}
            onChangeText={setUsername}
          />

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />

          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.multilineInput]}
            placeholder="Enter a short description"
            value={description}
            onChangeText={setDescription}
            multiline
          />

          <Text style={styles.label}>Profile Image</Text>
          <TouchableOpacity style={styles.uploadButton} onPress={handleUploadProfileImage}>
            <Text style={styles.uploadButtonText}>Upload Profile Image</Text>
          </TouchableOpacity>
          {profileImage && (
            <Image source={{ uri: profileImage }} style={styles.profileImage} />
          )}

          <TouchableOpacity style={styles.submitButton} onPress={handleUpdateProfile} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>Update Profile</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Bottom Navigation Component */}
      <BottomNav navigation={navigation} activeNav={activeNav} setActiveNav={setActiveNav} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f4',
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  form: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  uploadButton: {
    backgroundColor: '#4a63ff',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: 'center',
    marginBottom: 16,
  },
  submitButton: {
    backgroundColor: '#4a63ff',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default EditProfileScreen;