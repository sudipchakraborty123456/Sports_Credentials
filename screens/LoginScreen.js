import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';

const LoginScreen = ({ navigation }) => {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [otp, setOtp] = useState('');
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [requestId, setRequestId] = useState(''); // To store the requestId from the OTP sending API

    const handleSendOtp = async () => {
        if (!phoneNumber) {
            Alert.alert('Error', 'Please enter your phone number.');
            return;
        }
        setIsLoading(true);

        try {
            const response = await fetch('https://auth.otpless.app/auth/v1/initiate/otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'clientId': '6XC9OVUVX4D6M9BZXPZKYSHCBSN2TMG1',
                    'clientSecret': 'f3ayo1fvemqxun1yoyy27mdk8ksbtlik',
                },
                body: JSON.stringify({
                    phoneNumber: `+91${phoneNumber}`,
                    channels: ['SMS'],
                    otpLength: '4',
                }),
            });

            const data = await response.json();
            console.log(phoneNumber, data);

            if (response.ok) {
                setRequestId(data.requestId); // Store the requestId for OTP verification
                Alert.alert('OTP Sent', `OTP has been sent to ${phoneNumber}`);
                setIsOtpSent(true);
            } else {
                Alert.alert('Error', data.message || 'Failed to send OTP.');
            }
        } catch (error) {
            Alert.alert('Error', 'An error occurred while sending OTP.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (!otp) {
            Alert.alert('Error', 'Please enter the OTP.');
            return;
        }
        setIsLoading(true);

        try {
            const response = await fetch('https://auth.otpless.app/auth/v1/verify/otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'clientId': '6XC9OVUVX4D6M9BZXPZKYSHCBSN2TMG1',
                    'clientSecret': 'f3ayo1fvemqxun1yoyy27mdk8ksbtlik',
                },
                body: JSON.stringify({
                    requestId: requestId,
                    otp: otp,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                Alert.alert('Success', 'OTP verified successfully!');
                navigation.navigate('Dashboard');
            } else {
                Alert.alert('Error', data.message || 'Invalid OTP. Please try again.');
            }
        } catch (error) {
            Alert.alert('Error', 'An error occurred while verifying OTP.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <LinearGradient colors={['#4c669f', '#3b5998', '#192f6a']} style={styles.container}>
            <View style={styles.innerContainer}>
                <Text style={styles.title}>Welcome Back!</Text>
                <Text style={styles.subtitle}>Login to continue</Text>

                {/* Phone Number Input */}
                <View style={styles.inputContainer}>
                    <MaterialIcons name="phone" size={24} color="#999" style={styles.icon} />
                    <TextInput
                        style={styles.input}
                        placeholder="Enter Phone Number"
                        placeholderTextColor="#999"
                        value={phoneNumber}
                        onChangeText={setPhoneNumber}
                        keyboardType="phone-pad"
                    />
                </View>

                {/* Send OTP Button */}
                {!isOtpSent && (
                    <TouchableOpacity style={styles.button} onPress={handleSendOtp} disabled={isLoading}>
                        {isLoading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.buttonText}>Send OTP</Text>
                        )}
                    </TouchableOpacity>
                )}

                {/* OTP Input (shown after OTP is sent) */}
                {isOtpSent && (
                    <>
                        <View style={styles.inputContainer}>
                            <MaterialIcons name="lock" size={24} color="#999" style={styles.icon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Enter OTP"
                                placeholderTextColor="#999"
                                value={otp}
                                onChangeText={setOtp}
                                keyboardType="number-pad"
                            />
                        </View>
                        <TouchableOpacity style={styles.button} onPress={handleVerifyOtp} disabled={isLoading}>
                            {isLoading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.buttonText}>Verify OTP</Text>
                            )}
                        </TouchableOpacity>
                    </>
                )}

                {/* Sign Up Link */}
                <TouchableOpacity onPress={() => navigation.navigate('Dashboard')}>
                    <Text style={styles.link}>Don't have an account? <Text style={styles.linkBold}>Sign Up</Text></Text>
                </TouchableOpacity>
            </View>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    innerContainer: {
        width: '90%',
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 2,
        elevation: 5,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 20,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        marginBottom: 20,
    },
    icon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        height: 40,
        color: '#333',
    },
    button: {
        backgroundColor: '#4c669f',
        padding: 15,
        borderRadius: 5,
        alignItems: 'center',
        marginBottom: 20,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    link: {
        color: '#666',
        textAlign: 'center',
    },
    linkBold: {
        fontWeight: 'bold',
        color: '#4c669f',
    },
});

export default LoginScreen;