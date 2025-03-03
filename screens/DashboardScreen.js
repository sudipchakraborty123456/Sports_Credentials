import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Modal, Clipboard, Alert, Linking } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';

// Dummy data for sports and websites
const sportsData = {
    Cricket: [
        { id: '1', name: 'Cricket Website 1', username: 'user1', password: 'pass1', url: 'https://cricketwebsite1.com' },
        { id: '2', name: 'Cricket Website 2', username: 'user2', password: 'pass2', url: 'https://cricketwebsite2.com' },
    ],
    Soccer: [
        { id: '3', name: 'Soccer Website 1', username: 'user3', password: 'pass3', url: 'https://soccerwebsite1.com' },
        { id: '4', name: 'Soccer Website 2', username: 'user4', password: 'pass4', url: 'https://soccerwebsite2.com' },
    ],
    Tennis: [
        { id: '5', name: 'Tennis Website 1', username: 'user5', password: 'pass5', url: 'https://tenniswebsite1.com' },
        { id: '6', name: 'Tennis Website 2', username: 'user6', password: 'pass6', url: 'https://tenniswebsite2.com' },
    ],
    Basketball: [
        { id: '7', name: 'Basketball Website 1', username: 'user7', password: 'pass7', url: 'https://basketballwebsite1.com' },
        { id: '8', name: 'Basketball Website 2', username: 'user8', password: 'pass8', url: 'https://basketballwebsite2.com' },
    ],
};

// SportTab Component
const SportTab = ({ sport }) => {
    const websites = sportsData[sport];
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedWebsite, setSelectedWebsite] = useState(null);

    const handleGetCredentials = (website) => {
        setSelectedWebsite(website);
        setModalVisible(true);
    };

    const copyToClipboard = (text) => {
        Clipboard.setString(text);
        Alert.alert('Copied to Clipboard', text);
    };

    const openWebsite = (url) => {
        Linking.openURL(url).catch(() => Alert.alert('Error', 'Unable to open the website.'));
    };

    return (
        <LinearGradient colors={['#4c669f', '#3b5998', '#192f6a']} style={styles.gradient}>
            <View style={styles.tabContainer}>
                <FlatList
                    data={websites}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <View style={styles.websiteItem}>
                            <Text style={styles.websiteName}>{item.name}</Text>
                            <TouchableOpacity
                                style={styles.credentialsButton}
                                onPress={() => handleGetCredentials(item)}
                            >
                                <LinearGradient
                                    colors={['#4c669f', '#3b5998', '#192f6a']}
                                    style={styles.gradientButton}
                                >
                                    <Text style={styles.getCredentials}>Get Credentials</Text>
                                    <MaterialIcons name="arrow-forward" size={20} color="white" />
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    )}
                />
            </View>

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>{selectedWebsite?.name}</Text>
                        <View style={styles.credentialItem}>
                            <Text style={styles.credentialText}>Username: {selectedWebsite?.username}</Text>
                            <TouchableOpacity
                                style={styles.copyButton}
                                onPress={() => copyToClipboard(selectedWebsite?.username)}
                            >
                                <Text style={styles.copyButtonText}>Copy</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.credentialItem}>
                            <Text style={styles.credentialText}>Password: {selectedWebsite?.password}</Text>
                            <TouchableOpacity
                                style={styles.copyButton}
                                onPress={() => copyToClipboard(selectedWebsite?.password)}
                            >
                                <Text style={styles.copyButtonText}>Copy</Text>
                            </TouchableOpacity>
                        </View>
                        <TouchableOpacity
                            style={styles.visitWebsiteButton}
                            onPress={() => openWebsite(selectedWebsite?.url)}
                        >
                            <Text style={styles.visitWebsiteButtonText}>Play Now</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => setModalVisible(false)}
                        >
                            <Text style={styles.closeButtonText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </LinearGradient>
    );
};

// Create Top Tabs
const Tab = createMaterialTopTabNavigator();

const DashboardScreen = () => {
    return (
        <Tab.Navigator
            screenOptions={{
                tabBarLabelStyle: { fontSize: 14, fontWeight: 'bold', color: 'white' },
                tabBarIndicatorStyle: { backgroundColor: 'blue' },
                tabBarStyle: { backgroundColor: '#4c669f' },
            }}
        >
            {Object.keys(sportsData).map((sport) => (
                <Tab.Screen key={sport} name={sport}>
                    {() => <SportTab sport={sport} />}
                </Tab.Screen>
            ))}
        </Tab.Navigator>
    );
};

// Custom Drawer Content
const CustomDrawerContent = (props) => {
    return (
        <DrawerContentScrollView {...props} style={styles.drawerContainer}>
            <View style={styles.drawerHeader}>
                <Image
                    source={{ uri: 'https://sts-christtube-dev.s3.ap-south-1.amazonaws.com/sn/test999/profile-images/resize_1740654588933_1740654588850.jpeg' }} // Replace with your profile image URL
                    style={styles.profileImage}
                />
                <Text style={styles.drawerHeaderText}>John Doe</Text>
            </View>
            <DrawerItem
                label="Home"
                onPress={() => props.navigation.navigate('Dashboard')}
                labelStyle={styles.drawerItemLabel}
            />
            <DrawerItem
                label="Edit Profile"
                onPress={() => props.navigation.navigate('EditProfile')}
                labelStyle={styles.drawerItemLabel}
            />
            <DrawerItem
                label="Logout"
                onPress={() => props.navigation.navigate('Login')}
                labelStyle={styles.drawerItemLabel}
            />
        </DrawerContentScrollView>
    );
};

// Create Drawer Navigator
const Drawer = createDrawerNavigator();

const App = () => {
    return (
        <Drawer.Navigator drawerContent={(props) => <CustomDrawerContent {...props} />}>
            <Drawer.Screen name="Dashboard" component={DashboardScreen} />
        </Drawer.Navigator>
    );
};

// Styles
const styles = StyleSheet.create({
    gradient: {
        flex: 1,
    },
    tabContainer: {
        flex: 1,
        padding: 16,
    },
    websiteItem: {
        padding: 16,
        marginBottom: 10,
        backgroundColor: '#fff',
        borderRadius: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 2,
        elevation: 5,
    },
    websiteName: {
        fontSize: 16,
        color: '#333',
    },
    credentialsButton: {
        borderRadius: 25,
        overflow: 'hidden',
    },
    gradientButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        paddingHorizontal: 20,
    },
    getCredentials: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
        marginRight: 10,
    },
    drawerContainer: {
        backgroundColor: '#4c669f',
    },
    drawerHeader: {
        padding: 20,
        backgroundColor: '#3b5998',
        alignItems: 'center',
    },
    profileImage: {
        width: 80,
        height: 80,
        borderRadius: 40,
        marginBottom: 10,
    },
    drawerHeaderText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    drawerItemLabel: {
        color: 'white',
        fontSize: 16,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: '80%',
        padding: 20,
        backgroundColor: 'white',
        borderRadius: 10,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    credentialItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    credentialText: {
        fontSize: 16,
        marginRight: 10,
    },
    copyButton: {
        backgroundColor: 'blue',
        padding: 5,
        borderRadius: 5,
    },
    copyButtonText: {
        color: 'white',
        fontSize: 14,
    },
    visitWebsiteButton: {
        backgroundColor: 'green',
        padding: 10,
        borderRadius: 5,
        marginTop: 10,
    },
    visitWebsiteButtonText: {
        color: 'white',
        fontSize: 16,
    },
    closeButton: {
        marginTop: 20,
    },
    closeButtonText: {
        color: 'blue',
        fontSize: 16,
    },
});

export default App;