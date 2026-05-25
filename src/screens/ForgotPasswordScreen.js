import React, { useContext, useState } from 'react';
import { Image, useColorScheme } from "react-native";

import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    SafeAreaView,
    
} from 'react-native';

import { ArrowLeft } from 'lucide-react-native';

import CustomAlert from "../components/CustomAlert";

import { ThemeContext } from '../theme/ThemeContext';
import auth from '../firebase/auth';
// Removed: import { sendPasswordResetEmail } from 'firebase/auth';







const ForgotPasswordScreen = ({ navigation }) => {

    const { theme } = useContext(ThemeContext);

    const darkLogo = require("../../assets/images/full logo.png");
    const lightLogo = require("../../assets/images/full logo light.png");

    const colorScheme = useColorScheme();


    const [alertVisible, setAlertVisible] = useState(false);
    const [alertTitle, setAlertTitle] = useState("");
    const [alertMessage, setAlertMessage] = useState("");
   
   
   
    const [email, setEmail] = useState("");

    const [loading, setLoading] = useState(false);

    const showAlert = (title, message) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertVisible(true);
    };
    

    const handleForgotPassword = async () => {

        if (!email) {

         showAlert("Error", "Please enter email");   

            return;
        }

        try {

            setLoading(true);

            // Call our custom backend API instead of Firebase default
            const response = await fetch('https://kreashiv-api.onrender.com/api/send-reset-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error || "Failed to send reset email via Resend");
            }

            showAlert(
            "Success",
            "Reset email sent. Please check inbox."
            );

        } catch (error) {

            console.log(error);

            let errorMessage = "Unable to send reset email";
            if (error.message) {
                errorMessage = error.message;
            }

            showAlert("Error", errorMessage);

        } finally {

            setLoading(false);
        }
    };




    return (

        <SafeAreaView
            style={{
                flex: 1,
                justifyContent: 'center',
                padding: 20,
                backgroundColor: theme.background,
            }}
        >

            <View
                style={{
                    backgroundColor: theme.card,
                    borderRadius: 24,
                    padding: 20,
                }}
            >

                {/* Back Button */}
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={{
                        marginBottom: 20,
                    }}
                >

                    <ArrowLeft
                        size={26}
                        color={theme.primary}
                    />

                </TouchableOpacity>

               
               
                    {/* Logo */}
                    <View
                    style={{
                        alignItems: "center",
                        marginBottom: 10,
                    }}
                    >
                    <Image
                        source={colorScheme === "dark" ? darkLogo : lightLogo}
                        style={{
                        width: 140,
                        height: 45,
                        resizeMode: "contain",
                        }}
                    />
                    </View>





                <Text
                    style={{
                        fontSize: 30,
                        fontWeight: 'bold',
                        color: theme.primary,
                        textAlign: 'center',
                    }}
                >
                    Forgot Password
                </Text>

                <Text
                    style={{
                        textAlign: 'center',
                        marginTop: 10,
                        color: theme.subText,
                    }}
                >
                    Enter your email address to reset password.
                </Text>

                {/* Email */}
                <View style={{ marginTop: 30 }}>

                    <Text
                        style={{
                            fontWeight: '700',
                            marginBottom: 8,
                            color: theme.text,
                        }}
                    >
                        EMAIL ADDRESS
                    </Text>

                    <TextInput
                        placeholder="hello@email.com"
                        placeholderTextColor={theme.subText}
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        style={{
                            borderWidth: 1,
                            borderColor: theme.border,
                            borderRadius: 14,
                            height: 52,
                            paddingHorizontal: 15,
                            color: theme.text,
                        }}
                    />

                </View>

                {/* Button */}
                <TouchableOpacity
                    onPress={handleForgotPassword}
                    disabled={loading}
                    style={{
                        backgroundColor: theme.primary,
                        height: 52,
                        borderRadius: 14,
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginTop: 28,
                        opacity: loading ? 0.7 : 1,
                    }}
                >

                    <Text
                        style={{
                            color: '#fff',
                            fontSize: 18,
                            fontWeight: 'bold',
                        }}
                    >
                        {loading
                            ? "Sending..."
                            : "Send Reset Link"}
                    </Text>

                </TouchableOpacity>

           <CustomAlert
            visible={alertVisible}
            title={alertTitle}
            message={alertMessage}
            onClose={() => setAlertVisible(false)}
            />
           
           
           
            </View>

        </SafeAreaView>
    );
};

export default ForgotPasswordScreen;