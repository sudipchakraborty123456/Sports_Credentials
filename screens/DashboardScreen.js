import React, { useState } from 'react';
import { View, ScrollView, Text,TouchableOpacity, Image, StyleSheet, Modal, Linking, Alert } from 'react-native'; // Add TouchableOpacity here
import * as Clipboard from 'expo-clipboard';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
const NeoSportApp = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('cricket');
  const [activeNav, setActiveNav] = useState('home');
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const tabs = [
    { id: 'cricket', icon: '🏏', text: 'Cricket' },
    { id: 'basketball', icon: '🏀', text: 'Basketball' },
    { id: 'football', icon: '⚽', text: 'Football' },
    { id: 'baseball', icon: '⚾', text: 'Baseball' },
    { id: 'ball', icon: '⚾', text: 'Ball' },
    { id: 'hockey', icon: '🏏', text: 'Hockey' },
  ];

  const matches = [
    {
        id: 1,
        team1: { name: 'AUS', logo: 'https://city-png.b-cdn.net/preview/preview_public/uploads/preview/australia-sport-cricket-team-logo-hd-transparent-png-701751712502591qatlzstlo8.png' },
        team2: { name: 'AUS', logo: 'https://banner2.cleanpng.com/lnd/20250108/ah/7526db520fe5c594dfebe519cd0ab5.webp' },
        tournament: 'T20 World Cup',
        countdown: '22h: 19m: 12s',
    },
    {
        id: 2,
        team1: { name: 'RCB', logo: 'https://banner2.cleanpng.com/lnd/20250107/gp/8381e7ef2caab7674871267dde56a3.webp' },
        team2: { name: 'CSK', logo: 'https://banner2.cleanpng.com/20190220/ws/kisspng-logo-chennai-illustration-graphic-design-brand-1713906525653.webp' },
        tournament: 'Indian Premier League',
        countdown: '22h: 19m: 12s',
    },
    {
        id: 3,
        team1: { name: 'RCB', logo: 'https://banner2.cleanpng.com/lnd/20250107/gp/8381e7ef2caab7674871267dde56a3.webp' },
        team2: { name: 'CSK', logo: 'https://banner2.cleanpng.com/20190220/ws/kisspng-logo-chennai-illustration-graphic-design-brand-1713906525653.webp' },
        tournament: 'Indian Premier League',
        countdown: '22h: 19m: 12s',
    },
    {
        id: 4,
        team1: { name: 'RCB', logo: 'https://banner2.cleanpng.com/lnd/20250107/gp/8381e7ef2caab7674871267dde56a3.webp' },
        team2: { name: 'CSK', logo: 'https://banner2.cleanpng.com/20190220/ws/kisspng-logo-chennai-illustration-graphic-design-brand-1713906525653.webp' },
        tournament: 'Indian Premier League',
        countdown: '22h: 19m: 12s',
    },
    {
        id: 5,
        team1: { name: 'RCB', logo: 'https://banner2.cleanpng.com/lnd/20250107/gp/8381e7ef2caab7674871267dde56a3.webp' },
        team2: { name: 'CSK', logo: 'https://banner2.cleanpng.com/20190220/ws/kisspng-logo-chennai-illustration-graphic-design-brand-1713906525653.webp' },
        tournament: 'Indian Premier League',
        countdown: '22h: 19m: 12s',
    },
];

const matchCards = [
    {
        id: 1,
        name: 'RCB',
        logo: 'https://banner2.cleanpng.com/lnd/20250107/gp/8381e7ef2caab7674871267dde56a3.webp',
        website: 'https://google.com',
        userName: 'John',
        password: 'password'
    },
    {
        id: 2,
        name: 'RCB',
        logo: 'https://banner2.cleanpng.com/lnd/20250107/gp/8381e7ef2caab7674871267dde56a3.webp',
        website: 'https://google.com',
        userName: 'John',
        password: 'password'
    },
    {
        id: 3,
        name: 'RCB',
        logo: 'https://banner2.cleanpng.com/lnd/20250107/gp/8381e7ef2caab7674871267dde56a3.webp',
        website: 'https://google.com',
        userName: 'John',
        password: 'password'
    },
    {
        id: 4,
        name: 'RCB',
        logo: 'https://banner2.cleanpng.com/lnd/20250107/gp/8381e7ef2caab7674871267dde56a3.webp',
        website: 'https://google.com',
        userName: 'John',
        password: 'password'
    }
];

  const handleGetCredentials = (match) => {
    setSelectedMatch(match);
    setModalVisible(true);
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
              <TouchableOpacity style={styles.liveButton}>
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
            {matchCards.map((card) => (
              <View key={card.id} style={styles.matchCard}>
                <View style={styles.teamBox}>
                  <Image source={{ uri: card.logo }} style={styles.teamLogo} />
                  <Text>{card.name}</Text>
                </View>
                <TouchableOpacity style={styles.liveButton} onPress={() => handleGetCredentials(card)}>
                  <Text style={styles.liveButtonText}>Get Credentials</Text>
                  <View style={styles.liveIcon} />
                </TouchableOpacity>
              </View>
            ))}
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
            <Text style={styles.modalText}>Username: {selectedMatch?.userName}</Text>
            <TouchableOpacity style={styles.copyButton} onPress={() => copyToClipboard(selectedMatch?.userName)}>
              <Text style={styles.copyButtonText}>Copy Username</Text>
            </TouchableOpacity>
            <Text style={styles.modalText}>Password: {selectedMatch?.password}</Text>
            <TouchableOpacity style={styles.copyButton} onPress={() => copyToClipboard(selectedMatch?.password)}>
              <Text style={styles.copyButtonText}>Copy Password</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.viewButton} onPress={() => openWebsite(selectedMatch?.website)}>
              <Text style={styles.viewButtonText}>View Website</Text>
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
    copyButton: {
        backgroundColor: '#4a63ff',
        padding: 10,
        borderRadius: 5,
        marginBottom: 10,
    },
    copyButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: 'bold',
    },
    viewButton: {
        backgroundColor: '#4a63ff',
        padding: 10,
        borderRadius: 5,
        marginBottom: 10,
    },
    viewButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: 'bold',
    },
    closeButton: {
        backgroundColor: '#ff4d4d',
        padding: 10,
        borderRadius: 5,
    },
    closeButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: 'bold',
    },
});

export default NeoSportApp;