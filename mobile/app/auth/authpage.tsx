import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Dimensions,
    PixelRatio,
} from 'react-native';
import { Pacifico_400Regular } from '@expo-google-fonts/pacifico'
import { router, Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '@/src/store/authStore';

// Get screen dimensions
const { width, height } = Dimensions.get('window');

// Responsive helper functions
const wp = (percentage: number) => (percentage * width) / 100;
const hp = (percentage: number) => (percentage * height) / 100;
const rf = (size: number) => size * PixelRatio.getFontScale();

export default function AuthPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const { login, isAuthenticated } = useAuthStore();

    // Redirect if already authenticated
    React.useEffect(() => {
        if (isAuthenticated) {
            router.replace('/dashboard/homepage'); // You'll need to create this screen
        }
    }, [isAuthenticated]);

    let [fontsLoaded] = useFonts({
        Pacifico_400Regular
    });

    const handleLogin = async () => {

        if (!email || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        try {
            await login(email.toLowerCase().trim(), password);
            // No need to handle success - auth store and useEffect handles redirect
        } catch (error: any) {
            Alert.alert('Login Failed', error.message || 'Invalid credentials');
        }
    };

    const handleSignUp = () => {
        // Navigate to sign up page (your page 2)
        router.push('/auth/signup');
    };

    const handleForgotPassword = () => {
        Alert.alert('Forgot Password', 'Feature coming soon!');
    };

    if (!fontsLoaded) {
        return null;
    } else {
        return (
            <>
                <Stack.Screen options={{ headerShown: false }} />
                <KeyboardAvoidingView
                    style={styles.keyboardAvoidingView}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                >
                    <ScrollView
                        contentContainerStyle={styles.scrollContainer}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >

                        {/* Hero Section */}
                        <View style={styles.heroSection}>
                            <Text style={styles.heroEmoji}>🏋️‍♂️</Text>
                            <Text style={styles.appName}>Get Fit</Text>
                        </View>

                        {/* Form Section */}
                        <View style={styles.formSection}>
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

                            <TextInput
                                style={styles.input}
                                placeholder="Password"
                                placeholderTextColor="#999"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                                autoCapitalize="none"
                            />

                            <TouchableOpacity
                                onPress={handleLogin}
                            >
                                <LinearGradient
                                    colors={['#03254E', '#8A8A8A']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 0.76, y: 0 }}
                                    style={styles.loginButton}
                                >
                                    {/* {isLoading ? (
                                        <ActivityIndicator color="#fff" />
                                    ) : (
                                        <Text style={styles.loginButtonText}>Login</Text>
                                    )} */}
                                    <Text style={styles.loginButtonText}>Login</Text>
                                </LinearGradient>

                            </TouchableOpacity>

                            <TouchableOpacity onPress={handleForgotPassword}>
                                <Text style={styles.forgotPasswordText}>Forgot your password?</Text>
                            </TouchableOpacity>

                            <View style={styles.signupSection}>
                                <Text style={styles.signupText}>Don&apos;t have an account? </Text>
                                <TouchableOpacity onPress={handleSignUp}>
                                    <Text style={styles.signupLink}>Sign Up</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </>
        );
    }
}

const styles = StyleSheet.create({
    keyboardAvoidingView: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: wp(10), // 10% of screen width
        paddingVertical: hp(3), // 3% of screen height
        minHeight: hp(100), // Ensures full height on smaller screens
    },
    heroSection: {
        alignItems: 'center',
        marginBottom: hp(6), // 6% of screen height
    },
    heroEmoji: {
        fontSize: wp(35), // 20% of screen width (scales perfectly)
        marginBottom: hp(2), // 2% spacing
        // lineHeight: wp(25), // Prevents clipping on some devices
    },
    appName: {
        fontSize: rf(48), // Responsive font size with user settings
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
        fontFamily: 'Pacifico_400Regular'
    },
    formSection: {
        width: '100%',
        maxWidth: wp(85), // Maximum width on tablets
        alignSelf: 'center',
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
    loginButton: {
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
    loginButtonText: {
        color: '#fff',
        fontSize: rf(18), // Responsive font size
    },
    forgotPasswordText: {
        textAlign: 'center',
        color: '#666',
        fontSize: rf(14), // Responsive font size
        marginBottom: hp(5), // More space before signup section
    },
    signupSection: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        flexWrap: 'wrap', // Wraps on very small screens
    },
    signupText: {
        color: '#666',
        fontSize: rf(14), // Responsive font size
        textAlign: 'center',
    },
    signupLink: {
        color: '#4a5568',
        fontSize: rf(14), // Responsive font size
        fontWeight: 'bold',
    },
});