import React, { useState } from 'react'
import { View, Text, KeyboardAvoidingView, Platform, StyleSheet, ScrollView, TextInput, Dimensions, PixelRatio, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { OpenSans_400Regular } from '@expo-google-fonts/open-sans'
import { useFonts } from 'expo-font';
import { LinearGradient } from 'expo-linear-gradient';
import { router, Stack } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import DateTimePicker from '@react-native-community/datetimepicker';

// Get screen dimensions
const { width, height } = Dimensions.get('window');

// Responsive helper functions
const wp = (percentage: number) => (percentage * width) / 100;
const hp = (percentage: number) => (percentage * height) / 100;
const rf = (size: number) => size * PixelRatio.getFontScale();

const SignUpPage = () => {
    let [fontsLoaded] = useFonts({
        OpenSans_400Regular
    })

    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [dob, setDob] = useState(new Date());
    const [dobString, setDobString] = useState(' ')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [passwordNotMatch, setPasswordNotMatch] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const onChangeDob = (event: any, selectedDate: any) => {
        if (selectedDate) {
            setDob(selectedDate)
            setDobString(dob.toLocaleDateString('en-CA'))
        }
    };

    const onChangeConfirmPassword = (value: any) => {
        setConfirmPassword(value)
        if (value !== password) {
            setPasswordNotMatch(true);
        } else {
            setPasswordNotMatch(false);
        }
    }

    const handleSignUp = () => {
        if (!username || !email || !password) {
            Alert.alert('Incomplete', 'Please fill in all fields');
            return;
        }

        const requestBody = {
            name: username,
            email: email.toLowerCase().trim(),
            password: password,
            dateOfBirth: dobString
        };
    }

    if (!fontsLoaded) {
        return null
    }
    else {
        return (
            <>
                <Stack.Screen options={{
                    headerShown: false,
                }} />
                <KeyboardAvoidingView
                    style={styles.keyboardAvoidingView}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                >
                    <View>
                        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                            <Ionicons name="chevron-back-outline" size={24} color="#333" />
                        </TouchableOpacity>
                    </View>
                    <ScrollView
                        contentContainerStyle={styles.scrollContainer}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        <View
                            style={styles.pageTitleContainer}
                        >
                            <Text
                                style={styles.pageTitle}
                            >Create an Account</Text>
                        </View>
                        {/* Form Section */}
                        <View style={styles.formSection}>
                            <TextInput
                                style={styles.input}
                                placeholder="Username"
                                placeholderTextColor="#999"
                                value={username}
                                onChangeText={setUsername}
                                autoCapitalize="none"
                                autoCorrect={false}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Email"
                                placeholderTextColor="#999"
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoCorrect={false}
                            />
                            <View
                                style={styles.dobBox}
                            >
                                <Text
                                    style={styles.dobText}
                                >Date of Birth: </Text>
                                <DateTimePicker
                                    maximumDate={new Date()}
                                    value={dob}
                                    mode='date'
                                    onChange={onChangeDob}
                                />
                            </View>

                            <TextInput
                                style={styles.input}
                                placeholder="Password"
                                placeholderTextColor="#999"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                                autoCapitalize="none"
                                autoCorrect={false}
                                textContentType='oneTimeCode'
                                autoComplete="off"
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Confirm Password"
                                placeholderTextColor="#999"
                                value={confirmPassword}
                                onChangeText={onChangeConfirmPassword}
                                secureTextEntry
                                autoCapitalize="none"
                                autoCorrect={false}
                                textContentType='oneTimeCode'
                                autoComplete="off"
                            />
                            {passwordNotMatch &&
                                <Text
                                    style={{ color: '#A91B0D', fontSize: rf(12), paddingLeft: wp(5), paddingBottom: hp(5) }}
                                >
                                    Password do not match
                                </Text>
                            }
                        </View>

                        {/* Sign Up Button */}
                        <View>
                            <TouchableOpacity
                                onPress={handleSignUp}
                            >
                                <LinearGradient
                                    colors={['#03254E', '#8A8A8A']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 0.76, y: 0 }}
                                    style={styles.signUpButton}
                                >
                                    {isLoading ? (
                                        <ActivityIndicator color="#fff" />
                                    ) : (
                                        <Text style={styles.signUpButtonText}>Sign Up</Text>
                                    )}
                                </LinearGradient>

                            </TouchableOpacity>
                        </View>

                        {/* Back to Sign In */}
                        <View style={styles.signInSection}>
                            <Text style={styles.signInText}>Already have an Account? </Text>
                            <TouchableOpacity
                                onPress={() => router.back()}
                            >
                                <Text style={styles.signInLink}>Sign In</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>

                </KeyboardAvoidingView>
            </>
        )
    }
}

const styles = StyleSheet.create({
    keyboardAvoidingView: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    backButton: {
        position: 'absolute',
        top: hp(6),
        left: wp(4),
        zIndex: 1000,
        padding: wp(3),
        borderRadius: wp(6),
        backgroundColor: 'rgba(255, 255, 255, 0)',
    },
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'flex-start',
        paddingHorizontal: wp(5),
        paddingVertical: hp(15),
        minHeight: hp(100),
    },
    pageTitleContainer: {
        alignItems: 'center',
        marginBottom: 32,
    },
    pageTitle: {
        fontSize: rf(32),
        fontFamily: 'OpenSans_400Regular'
    },
    formSection: {
        width: '100%',
        maxWidth: wp(100),
    },
    dobBox: {
        flex: 1,
        flexDirection: 'row',
        alignContent: 'center',
        backgroundColor: '#e8e8e8',
        borderRadius: wp(6), // 6% of screen width
        paddingHorizontal: wp(5), // 5% horizontal padding
        paddingVertical: hp(1), // 2% vertical padding
        marginBottom: hp(2), // 2% spacing between inputs
        color: '#333',
        minHeight: hp(6), // Minimum touch target size
    },
    dobText: {
        alignSelf: 'center',
        fontSize: rf(16),
        color: '#999'
    },
    input: {
        backgroundColor: '#e8e8e8',
        borderRadius: wp(6), // 6% of screen width
        paddingHorizontal: wp(5), // 5% horizontal padding
        paddingVertical: hp(2), // 2% vertical padding
        fontSize: rf(16), // Responsive font size
        marginBottom: hp(2), // 2% spacing between inputs
        color: '#333',
        minHeight: hp(6), // Minimum touch target size
    },
    signUpButton: {
        borderRadius: wp(6), // Same as inputs for consistency
        paddingVertical: hp(2.5), // Slightly larger for better touch target
        alignItems: 'center',
        marginTop: hp(1),
        marginBottom: hp(3),
        minHeight: hp(6), // Minimum touch target size
        justifyContent: 'center',
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    signUpButtonText: {
        color: '#fff',
        fontSize: rf(18),
    },
    signInSection: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        flexWrap: 'wrap'
    },
    signInText: {
        color: '#666',
        fontSize: rf(14),
        textAlign: 'center',
    },
    signInLink: {
        color: '#4a5568',
        fontSize: rf(14),
        fontWeight: 'bold',
    }
});

export default SignUpPage;