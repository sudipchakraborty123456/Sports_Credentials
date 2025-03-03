// components/Sidebar.js
import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { DrawerItem } from '@react-navigation/drawer';

const Sidebar = ({ navigation }) => {
    return (
        <View style={styles.drawerContainer}>
            <View style={styles.drawerHeader}>
                <Image
                    source={{ uri: 'https://sts-christtube-dev.s3.ap-south-1.amazonaws.com/sn/test999/profile-images/resize_1740654588933_1740654588850.jpeg' }} // Replace with your profile image URL
                    style={styles.profileImage}
                />
                <Text style={styles.drawerHeaderText}>John Doe</Text>
            </View>
            <DrawerItem
                label="Home"
                onPress={() => navigation.navigate('Dashboard')}
                labelStyle={styles.drawerItemLabel}
            />
            <DrawerItem
                label="Edit Profile"
                onPress={() => navigation.navigate('EditProfile')}
                labelStyle={styles.drawerItemLabel}
            />
            <DrawerItem
                label="Logout"
                onPress={() => navigation.navigate('Login')}
                labelStyle={styles.drawerItemLabel}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    drawerContainer: {
        flex: 1,
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
});

export default Sidebar;