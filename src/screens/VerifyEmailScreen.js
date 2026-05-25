import React, { useContext, useState } from 'react';

import {
    View,
    Text,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
    ActivityIndicator,
    Image,
    useColorScheme
} from 'react-native';
import { Mail, RefreshCcw, LogOut, Send } from 'lucide-react-native';
import { ThemeContext } from '../theme/ThemeContext';
import { UserContext } from '../context/UserContext';
import auth from '../firebase/auth';
import CustomAlert from "../components/CustomAlert";


const VerifyEmailScreen = () => {
    const { theme } = useContext(ThemeContext);
    const { user, setUser, logout } = useContext(UserContext);
    const colorScheme = useColorScheme();

    const [refreshing, setRefreshing] = useState(false);
    const [sending, setSending] = useState(false);

    const [alertVisible, setAlertVisible] = useState(false);
    const [alertTitle, setAlertTitle] = useState("");
    const [alertMessage, setAlertMessage] = useState("");




    const darkLogo = require("../../assets/images/full logo.png");
    const lightLogo = require("../../assets/images/full logo light.png");

    const showAlert = (title, message) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertVisible(true);
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        try {
            if (auth.currentUser) {
                await auth.currentUser.reload();
                if (auth.currentUser.emailVerified) {
                    // Update context so router navigates to MainTabs
                    setUser({
                        ...user,
                        emailVerified: true
                    });
                } else {
                    showAlert(
                    "Not Verified",
                    "Email not verified yet. Please check your inbox."
                    );
                }
            }
        } catch (error) {
            console.log(error);
            showAlert(
            "Error",
            "Something went wrong while checking status."
            );
        } finally {
            setRefreshing(false);
        }
    };

    const handleResend = async () => {
        setSending(true);
        try {
            const res = await fetch('https://kreashiv-api.onrender.com/api/send-verification-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: user.email })
            });

            const data = await res.json();
            if (data.success) {
                showAlert(
                "Success",
                "Verification email resent. Please check your inbox."
                );
            } else {
              showAlert(
             "Error",
            "Failed to send verification email: " + (data.error || "Unknown error")
            );  
            }
        } catch (error) {
            console.log(error);
            showAlert(
            "Error",
            "Something went wrong while resending email."
            );
        } finally {
            setSending(false);
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
            <StatusBar barStyle="dark-content" />
            <View style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
                
                <View style={{
                    backgroundColor: theme.card,
                    borderRadius: 24,
                    padding: 30,
                    alignItems: 'center',
                }}>
                    
                    {/* Logo */}
                    <View style={{ marginBottom: 30 }}>
                        <Image
                            source={colorScheme === "dark" ? darkLogo : lightLogo}
                            style={{
                                width: 140,
                                height: 45,
                                resizeMode: "contain",
                            }}
                        />
                    </View>

                    <View style={{
                        width: 80,
                        height: 80,
                        borderRadius: 40,
                        backgroundColor: theme.primary + '15', // 15% opacity
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginBottom: 24
                    }}>
                        <Mail size={40} color={theme.primary} />
                    </View>

                    <Text style={{
                        fontSize: 26,
                        fontWeight: 'bold',
                        color: theme.primary,
                        textAlign: 'center',
                        marginBottom: 12
                    }}>
                        Verify Your Email
                    </Text>

                    <Text style={{
                        fontSize: 15,
                        color: theme.subText,
                        textAlign: 'center',
                        lineHeight: 22,
                        marginBottom: 8
                    }}>
                        We've sent a verification link to:
                    </Text>
                    <Text style={{
                        fontSize: 16,
                        color: theme.text,
                        fontWeight: 'bold',
                        textAlign: 'center',
                        marginBottom: 30
                    }}>
                        {user?.email}
                    </Text>

                    {/* Refresh Button */}
                    <TouchableOpacity
                        onPress={handleRefresh}
                        disabled={refreshing}
                        style={{
                            backgroundColor: theme.primary,
                            width: '100%',
                            height: 52,
                            borderRadius: 14,
                            flexDirection: 'row',
                            justifyContent: 'center',
                            alignItems: 'center',
                            marginBottom: 16
                        }}
                    >
                        {refreshing ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <>
                                <RefreshCcw size={20} color="#fff" style={{ marginRight: 8 }} />
                                <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>
                                    I have verified
                                </Text>
                            </>
                        )}
                    </TouchableOpacity>

                    {/* Resend Button */}
                    <TouchableOpacity
                        onPress={handleResend}
                        disabled={sending}
                        style={{
                            backgroundColor: 'transparent',
                            borderWidth: 1,
                            borderColor: theme.border,
                            width: '100%',
                            height: 52,
                            borderRadius: 14,
                            flexDirection: 'row',
                            justifyContent: 'center',
                            alignItems: 'center',
                            marginBottom: 24
                        }}
                    >
                        {sending ? (
                            <ActivityIndicator color={theme.text} />
                        ) : (
                            <>
                                <Send size={20} color={theme.text} style={{ marginRight: 8 }} />
                                <Text style={{ color: theme.text, fontSize: 16, fontWeight: '600' }}>
                                    Resend Email
                                </Text>
                            </>
                        )}
                    </TouchableOpacity>

                    {/* Logout Option */}
                    <TouchableOpacity
                        onPress={logout}
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <LogOut size={16} color={theme.subText} style={{ marginRight: 6 }} />
                        <Text style={{ color: theme.subText, fontSize: 14, fontWeight: '600' }}>
                            Use a different account
                        </Text>
                    </TouchableOpacity>

                    <CustomAlert
                    visible={alertVisible}
                    title={alertTitle}
                    message={alertMessage}
                    onClose={() => setAlertVisible(false)}
                    />


                </View>

            </View>
        </SafeAreaView>
    );
};

export default VerifyEmailScreen;
