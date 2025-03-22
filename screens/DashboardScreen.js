import React, { useState, useEffect, useCallback } from 'react';
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
  RefreshControl, // Import RefreshControl
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import axios from 'axios';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useFocusEffect } from '@react-navigation/native';

const NeoSportApp = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('cricket');
  const [activeNav, setActiveNav] = useState('home');
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [logInData, setIsLogInData] = useState(null);
  const [matchCards, setMatchCards] = useState([]);
  const [assignMatchCards, setAssignMatchCards] = useState([]);
  const [matches, setMatches] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false); // State for refresh control

  const tabs = [
    { id: 'cricket', icon: '🏏', text: 'Cricket' },
    { id: 'football', icon: '⚽', text: 'Football' },
    { id: 'tennis ', icon: '⚾', text: 'Tennis ' },
  ];



  const fetchData = async () => {
    setRefreshing(true);
    // await fetchMatchCards();
    await fetchMatchesFromNewAPI(); // Fetch matches from the new API

    const logInDataString = await AsyncStorage.getItem('loginData');
    const logInData = logInDataString ? JSON.parse(logInDataString) : null;
    setIsLogInData(logInData);

    if (logInData?.data?.id) {
      console.log("User is logged in, fetching assigned and unassigned match cards");
      await fetchAssignedMatchCards(logInData?.data?.id);
      await fetchUnAssignedMatchCards(logInData?.data?.id);
    } else {
      await fetchMatchCards()
      console.log("User is not logged in, skipping assigned and unassigned match cards");
    }
    setRefreshing(false);
  };
  const fetchMatchesFromNewAPI = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('https://api.reddyanna.com/api/get-series-redis/4', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      console.log('API Response:', data);

      if (response.ok && data?.data && Array.isArray(data.data)) {
        const formattedMatches = data.data.flatMap((competition) =>
          (competition.match || []).map((match) => {
            const [team1Name = '', team2Name = ''] = match.event?.name?.split(' v ') || [];
            return {
              id: match.event?.id,
              team1: { name: team1Name, logo: '' },
              team2: { name: team2Name, logo: '' },
              tournament: competition.competition?.name || 'Unknown Tournament',
              countdown: new Intl.DateTimeFormat('en-GB', {
                dateStyle: 'short',
                timeStyle: 'short',
              }).format(new Date(match.event?.openDate)),
            };
          })
        );

        setMatches(formattedMatches);
      } else {
        console.log('Failed to fetch matches:', data);
        Alert.alert('Error', 'Failed to fetch matches from the new API.');
      }
    } catch (error) {
      console.error('Error fetching matches:', error.message);
      Alert.alert('Error', ` An error occurred while fetching matches: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  // const fetchMatchesFromNewAPI = async () => {
  //   setIsLoading(true);
  //   try {
  //     const response = await fetch('https://api.reddyanna.com/api/get-series-redis/4', {
  //       method: 'GET',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //     });

  //     const data = await response.json();

  //     if (response.ok && Array.isArray(data.data)) {
  //       // Transform the data into a format suitable for your UI
  //       const formattedMatches = data.data.flatMap((competition) =>
  //         competition.match.map((match) => ({
  //           id: match.event.id,
  //           team1: { name: match.event.name.split(' v ')[0], logo: '' }, // Add a placeholder logo URL if needed
  //           team2: { name: match.event.name.split(' v ')[1], logo: '' }, // Add a placeholder logo URL if needed
  //           tournament: competition.competition.name,
  //           countdown: new Date(match.event.openDate).toLocaleString(), // Format the date as needed
  //         }))
  //       );
  //       setMatches(formattedMatches); // Update the matches state
  //     } else {
  //       Alert.alert('Error', 'Failed to fetch matches from the new API.');
  //     }
  //   } catch (error) {
  //     console.error('Error fetching matches from the new API:', error);
  //     Alert.alert('Error', 'An error occurred while fetching matches.');
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };
  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );


  const handleGetCredentials = async (card) => {
    // Ensure isLoggedIn is a string and properly checked
    if (logInData?.data?.id) {
      setIsLoading(true);
      try {
        console.log("game id:", card.game_id);

        // Create a FormData object
        const formData = new FormData();
        formData.append('user_id', logInData.data.id); // Add user_id
        formData.append('game_id', card.game_id); // Add game_id

        const response = await axios.post(
          'http://api.hatrickzone.com/api/request-assign-game',
          formData, // Use the FormData object as the request body
          {
            headers: {
              'Api-Key': 'base64:ipkojA8a0MLhbxrpG97TJq920WRM/D5rTXdh3uvlT+8=',
              'Content-Type': 'multipart/form-data', // Set the content type to multipart/form-data
            },
          }
        );

        const data = response.data;

        if (data.status === true) {
          // Success: Set credentials and show modal
          setSelectedMatch({
            ...card,
            userName: data.data.username,
            password: data.data.password,
            // login_link: data.data.login_link || 'http://example.com', // Replace with the actual login link if available
          });
          setModalVisible(true);
        } else {
          // Failure: Show error message
          Alert.alert('Error', data.message || 'Failed to fetch credentials.');
        }
      } catch (error) {
        console.error('Error fetching credentials:', error);
        Alert.alert('Error', 'An error occurred while fetching credentials.');
      } finally {
        setIsLoading(false);
      }
    } else {
      // Redirect to Login if not logged in
      navigation.navigate('Login');
    }
  };

  const openWebsite = async (url) => {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url); // Open the URL in the browser
    } else {
      Alert.alert(`Don't know how to open this URL: ${url}`);
    }
  };

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

      if (response.ok && data.success == true && Array.isArray(data.data)) {
        setMatchCards(data.data);
      } else {
        Alert.alert('Error', 'Failed to fetch match cards or invalid data format for all game.');
      }
    } catch (error) {
      console.error('Error fetching match cards:', error);
      Alert.alert('Error', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false); // Stop refreshing
    }
  };

  const fetchAssignedMatchCards = async (id) => {
    // setIsLoading(true);
    try {
      console.log(`http://api.hatrickzone.com/api/assigned-user-games/${id}`);

      const response = await fetch(`http://api.hatrickzone.com/api/assigned-user-games/${id}`, {
        method: 'GET',
        headers: {
          'Api-Key': 'base64:ipkojA8a0MLhbxrpG97TJq920WRM/D5rTXdh3uvlT+8=',
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok && data.status === true && Array.isArray(data?.data)) {
        setAssignMatchCards(data.data);
      } else {
        Alert.alert('Error', 'Failed to fetch match cards or invalid data format .');
      }
    } catch (error) {
      console.error('Error fetching match cards:', error);
      Alert.alert('Error', 'An error occurred while fetching match cards.');
    } finally {
      // setIsLoading(false);
      setRefreshing(false);
    }
  };

  const fetchUnAssignedMatchCards = async (id) => {
    // setIsLoading(true);
    try {
      console.log(`http://api.hatrickzone.com/api/unassigned-user-games/${id}`);

      const response = await fetch(`http://api.hatrickzone.com/api/unassigned-user-games/${id}`, {
        method: 'GET',
        headers: {
          'Api-Key': 'base64:ipkojA8a0MLhbxrpG97TJq920WRM/D5rTXdh3uvlT+8=',
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok && data.status === true && Array.isArray(data.data)) {
        setMatchCards(data.data);
      } else {
        Alert.alert('Error', 'Failed to fetch match cards or invalid data format .');
      }
    } catch (error) {
      console.error('Error fetching match cards:', error);
      Alert.alert('Error', 'An error occurred while fetching match cards.1');
    } finally {
      // setIsLoading(false);
      setRefreshing(false);
    }
  };
  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
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

      {/* Match List with RefreshControl */}
      <ScrollView
        style={styles.liveList}
        refreshControl={
          <RefreshControl
            refreshing={refreshing} // Bind refreshing state
            onRefresh={onRefresh} // Bind refresh function
            colors={['#4a63ff']} // Customize refresh spinner color
          />
        }
      >
        {/* Matches Section */}
        {matches.slice(0, 5).map((match, index) => (
          <View key={index} style={styles.card}> {/* Use index as key */}
            <View style={styles.cardContent}>
              {/* Team 1 */}
              <View style={styles.team}>
                {/* <Image source={{ uri: match.team1.logo }} style={styles.teamLogo} /> */}
                <Text style={styles.teamName}>{match.team1.name}</Text>
              </View>

              {/* Match Info */}
              <View style={styles.matchInfo}>
                <Text style={styles.tournament}>{match.tournament}</Text>
                <Text style={styles.vsText}>V/S</Text>
                <Text style={styles.countdown}>{match.countdown}</Text>
                <TouchableOpacity
                  style={styles.liveButton}
                // onPress={() => handleLiveStream(match.id)}
                >
                  <Text style={styles.liveButtonText}>Live Stream</Text>
                  <View style={styles.liveIcon} />
                </TouchableOpacity>
              </View>

              {/* Team 2 */}
              <View style={styles.team}>
                {/* <Image source={{ uri: match.team2.logo }} style={styles.teamLogo} /> */}
                <Text style={styles.teamName}>{match.team2.name}</Text>
              </View>
            </View>
          </View>
        ))}

        {/* Not Assigned Match Cards */}
        <Text style={styles.sectionHeader}>Not Assigned</Text>
        <View style={styles.matchContainer}>
          <View style={styles.matchRow}>
            {isLoading ? (
              <ActivityIndicator size="large" color="#4a63ff" />
            ) : (
              matchCards.map((card, index) => (
                <View key={index} style={styles.matchCard}> {/* Use index as key */}
                  <View style={styles.teamBox}>
                    <Image source={{ uri: card.game_logo }} style={styles.teamLogo} />
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

        {/* Assigned Match Cards */}
        {assignMatchCards.length > 0 && <Text style={styles.sectionHeader}>Assigned</Text>}
        <View style={styles.matchContainer}>
          <View style={styles.matchRow}>
            {isLoading ? (
              <ActivityIndicator size="large" color="#4a63ff" />
            ) : (
              assignMatchCards.map((card, index) => (
                <View key={index} style={styles.matchCard}> {/* Use index as key */}
                  <View style={styles.teamBox}>
                    <Image source={{ uri: card.game_logo }} style={styles.teamLogo} />
                    <Text>{card.game_name}</Text>
                    {/* Display Username and Password */}
                    <View style={styles.credentialsContainer}>
                      <Text style={styles.credentialText}>Username: {card.username}</Text>
                      <TouchableOpacity onPress={() => Clipboard.setStringAsync(card.username)}>
                        <Icon name="content-copy" size={16} color="#4a63ff" />
                      </TouchableOpacity>
                    </View>
                    <View style={styles.credentialsContainer}>
                      <Text style={styles.credentialText}>Password: {card.password}</Text>
                      <TouchableOpacity onPress={() => Clipboard.setStringAsync(card.password)}>
                        <Icon name="content-copy" size={16} color="#4a63ff" />
                      </TouchableOpacity>
                    </View>
                    {/* View Website Icon */}
                    <TouchableOpacity onPress={() => openWebsite(card.login_link)}>
                      <Icon name="web" size={24} color="#4a63ff" />
                    </TouchableOpacity>
                  </View>
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
    width: 100,
    height: 50,
    // borderRadius: 25,
  },
  teamLogo1: {
    width: 50,
    height: 50,
    // borderRadius: 25,
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
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4a63ff',
    marginTop: 20,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  credentialsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 5,
  },
  credentialText: {
    fontSize: 12,
    color: '#666',
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


  card: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  team: {
    alignItems: 'center',
    flex: 1,
  },
  teamLogo: {
    width: 100,
    height: 50,
    // borderRadius: 25,
    marginBottom: 8,
  },
  teamName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  matchInfo: {
    alignItems: 'center',
    flex: 1,
  },
  tournament: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  vsText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
    marginVertical: 8,
  },
  countdown: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 8,
  },
  liveButton: {
    backgroundColor: '#3b82f6',
    padding: 8,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  liveButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 4,
  },
  liveIcon: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'red',
  },
});

export default NeoSportApp;