import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Modal,
  Linking,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import axios from 'axios'; // Import axios for API calls
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const NeoSportApp = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('cricket');
  const [activeNav, setActiveNav] = useState('home');
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [matchCards, setMatchCards] = useState([]);
  const [matches, setMatches] = useState([]); // State for matches
  const [isLoading, setIsLoading] = useState(false);

  const tabs = [
    { id: 'cricket', icon: '🏏', text: 'Cricket' },
    { id: 'basketball', icon: '🏀', text: 'Basketball' },
    { id: 'football', icon: '⚽', text: 'Football' },
    { id: 'baseball', icon: '⚾', text: 'Baseball' },
    { id: 'ball', icon: '⚾', text: 'Ball' },
    { id: 'hockey', icon: '🏏', text: 'Hockey' },
  ];

  // Fetch matchCards data (unchanged)
  useEffect(() => {
    const fetchMatchCards = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('http://api.hatrickzone.com/api/games', {
          method: 'GET',
          headers: {
            'Api-Key': 'base64:ipkojA8a0MLhbxrpG97TJq920WRM/D5rTXdh3uvlT+8=',
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();

        if (response.ok && data.status === 'success' && Array.isArray(data.data)) {
          setMatchCards(data.data);
        } else {
          Alert.alert('Error', 'Failed to fetch match cards or invalid data format.');
        }
      } catch (error) {
        console.error('Error fetching match cards:', error);
        Alert.alert('Error', 'An error occurred while fetching match cards.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMatchCards();
  }, []);

  // Fetch series and matches data
  useEffect(() => {
    const fetchSeriesAndMatches = async () => {
      try {
        const response = await axios.get('https://api.reddyanna.com/api/get-series-redis/4');
        console.log('API Response:', response.data); // Log the response to inspect its structure

        const data = response.data.data; // Access the "data" property from the response

        if (data && Array.isArray(data)) {
          const formattedMatches = data
            .filter((series) => series.matches && Array.isArray(series.matches)) // Ensure "matches" exists and is an array
            .map((series) => {
              return series.matches.map((match) => ({
                id: match.match_id, // Use match_id as the unique identifier
                team1: { name: match.team1_name, logo: match.team1_logo },
                team2: { name: match.team2_name, logo: match.team2_logo },
                tournament: series.series_name,
                countdown: match.match_time, // Use match_time for the countdown
              }));
            })
            .flat(); // Flatten the array of arrays into a single array

          setMatches(formattedMatches); // Update the matches state
        } else {
          console.error('API response is not an array:', data);
          Alert.alert('Error', 'Invalid data format received from the API.');
        }
      } catch (error) {
        console.error('Error fetching series and matches:', error);
        Alert.alert('Error', 'Failed to fetch series and matches.');
      }
    };

    fetchSeriesAndMatches(); // Call the function to fetch data
  }, []);

  // Handle "Live" button click
  const handleLiveStream = async (eventid) => {
    try {
      const streamUrl = `https://sfront.starrexch.me/d?eventid=${eventid}`;
      const supported = await Linking.canOpenURL(streamUrl);

      if (supported) {
        await Linking.openURL(streamUrl); // Open the stream URL in the browser
      } else {
        Alert.alert(`Don't know how to open this URL: ${streamUrl}`);
      }
    } catch (error) {
      console.error('Error opening live stream:', error);
      Alert.alert('Error', 'An error occurred while trying to open the live stream.');
    }
  };

  const handleGetCredentials = (match) => {
    if (!isLoggedIn) {
      navigation.navigate('Login');
    } else {
      setSelectedMatch(match);
      setModalVisible(true);
    }
  };

  const copyToClipboard = async (text) => {
    await Clipboard.setStringAsync(text);
    Alert.alert('Copied to Clipboard', text);
  };

  const openWebsite = async (url) => {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert(`Don't know how to open this URL: ${url}`);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <Header navigation={navigation} />

      {/* Tabs */}
      <View>
        <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} style={styles.tabs}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tab, activeTab === tab.id && styles.activeTab]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Text style={styles.tabIcon}>{tab.icon}</Text>
              <Text style={styles.tabText}>{tab.text}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Match List */}
      <ScrollView style={styles.liveList}>
        {matches.map((match) => (
          <View key={match.id} style={styles.match}>
            <View style={styles.team}>
              <Image source={{ uri: match.team1.logo }} style={styles.teamLogo} />
              <Text>{match.team1.name}</Text>
            </View>
            <View style={styles.info}>
              <Text>{match.tournament}</Text>
              <Text>V/S</Text>
              <Text style={styles.countdown}>{match.countdown}</Text>
              <TouchableOpacity
                style={styles.liveButton}
                onPress={() => handleLiveStream(match.id)} // Pass the eventid (match.id) here
              >
                <Text style={styles.liveButtonText}>Live</Text>
                <View style={styles.liveIcon} />
              </TouchableOpacity>
            </View>
            <View style={styles.team}>
              <Image source={{ uri: match.team2.logo }} style={styles.teamLogo} />
              <Text>{match.team2.name}</Text>
            </View>
          </View>
        ))}

        {/* Match Cards */}
        <View style={styles.matchContainer}>
          <View style={styles.matchRow}>
            {isLoading ? (
              <ActivityIndicator size="large" color="#4a63ff" />
            ) : (
              matchCards.map((card) => (
                <View key={card.id} style={styles.matchCard}>
                  <View style={styles.teamBox}>
                    <Image source={{ uri: `https://www.allpanelpro.com/${card.logo}` }} style={styles.teamLogo} />
                    <Text>{card.name}</Text>
                  </View>
                  <TouchableOpacity style={styles.liveButton} onPress={() => handleGetCredentials(card)}>
                    <Text style={styles.liveButtonText}>Get Credentials</Text>
                    <View style={styles.liveIcon} />
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomNav navigation={navigation} activeNav={activeNav} setActiveNav={setActiveNav} />

      {/* Modal for Credentials */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Credentials</Text>

            {/* Username Section */}
            <View style={styles.credentialSection}>
              <Text style={styles.modalText}>Username: {selectedMatch?.userName}</Text>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => copyToClipboard(selectedMatch?.userName)}
              >
                <Icon name="content-copy" size={24} color="#4a63ff" />
              </TouchableOpacity>
            </View>

            {/* Password Section */}
            <View style={styles.credentialSection}>
              <Text style={styles.modalText}>Password: {selectedMatch?.password}</Text>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => copyToClipboard(selectedMatch?.password)}
              >
                <Icon name="content-copy" size={24} color="#4a63ff" />
              </TouchableOpacity>
            </View>

            {/* View Website Button */}
            <TouchableOpacity style={styles.viewButton} onPress={() => openWebsite(selectedMatch?.login_link)}>
              <Text style={styles.viewButtonText}>View Website</Text>
            </TouchableOpacity>

            {/* Close Button */}
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
  tabs: {
    backgroundColor: 'white',
    paddingVertical: 10,
  },
  tab: {
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 0,
    opacity: 0.6,
  },
  activeTab: {
    opacity: 1,
    fontWeight: 'bold',
  },
  tabIcon: {
    fontSize: 24,
  },
  tabText: {
    fontSize: 12,
  },
  liveList: {
    flex: 1,
    paddingHorizontal: 10,
    marginTop: 10,
  },
  match: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  team: {
    alignItems: 'center',
  },
  teamLogo: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  info: {
    alignItems: 'center',
  },
  countdown: {
    fontWeight: 'bold',
    color: 'red',
    fontSize: 12,
  },
  liveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ff4d4d',
    padding: 5,
    borderRadius: 15,
  },
  liveButtonText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  liveIcon: {
    width: 8,
    height: 8,
    backgroundColor: 'white',
    borderRadius: 4,
    marginLeft: 5,
  },
  matchContainer: {
    marginTop: 10,
  },
  matchRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  matchCard: {
    width: '48%',
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
    alignItems: 'center',
  },
  teamBox: {
    alignItems: 'center',
  },
  timerCountdown: {
    fontWeight: 'bold',
    color: 'red',
    fontSize: 12,
  },
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
  modalText: {
    fontSize: 16,
    marginBottom: 10,
  },
  credentialSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 10,
  },
  iconButton: {
    padding: 5,
  },
  viewButton: {
    backgroundColor: '#4a63ff',
    padding: 10,
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  viewButtonText: {
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
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default NeoSportApp;