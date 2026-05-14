import React, { useState, useContext } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    SafeAreaView,
    ScrollView,
    StatusBar,
} from 'react-native';

import {
    User,
    Mail,
    Lock,
    Eye,
    EyeOff,
    Phone,
} from 'lucide-react-native';


import CountryPicker from "react-native-country-picker-modal";

import { ThemeContext } from '../theme/ThemeContext';

import signup from "../firebase/signup";

const SignupScreen = ({ navigation }) => {
    const { theme } = useContext(ThemeContext);
    const [passwordVisible, setPasswordVisible] = useState(false);

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [countryCode, setCountryCode] =
        useState("IN");
    const [callingCode, setCallingCode] =
        useState("91");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSignup = async () => {

        const allowedDomains = [
            "gmail.com",
            "yahoo.com",
            "icloud.com",
            "outlook.com",
            "hotmail.com",
        ];

        const emailDomain = email
            .split("@")[1]
            ?.toLowerCase();

        if (!allowedDomains.includes(emailDomain)) {

            alert(
                "Please use Gmail, Yahoo, iCloud, Outlook or Hotmail email."
            );

            return;
        }

        if (!name || !phone || !email || !password) {

            alert("Please fill all fields");

            return;
        }

        if (phone.replace(/\s/g, "").length < 10) {

            alert("Please enter valid phone number");

            return;
        }

        if (password.length < 6) {

            alert("Password must be at least 6 characters");

            return;
        }

        try {

            setLoading(true);

            const result = await signup(
                name,
                phone,
                email,
                password
            );

            if (result.success) {

                await fetch(
                    "http://192.168.29.140:5000/send-verification-email",
                    {

                        method: "POST",

                        headers: {
                            "Content-Type": "application/json",
                        },

                        body: JSON.stringify({
                            email,
                        }),
                    }
                );

                alert(
                    "Verification email sent. Please check your inbox."
                );

            } else {

                alert(result.error);
            }

        } catch (error) {

            console.log(error);

            alert("Something went wrong");

        } finally {

            setLoading(false);
        }
    };




    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
            <StatusBar barStyle="dark-content" />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                    flexGrow: 1,
                    justifyContent: 'center',
                    padding: 20,
                }}
            >

                <View
                    style={{
                        backgroundColor: theme.card,
                        borderRadius: 24,
                        padding: 20,
                    }}
                >

                    {/* Heading */}
                    <Text
                        style={{
                            fontSize: 32,
                            fontWeight: 'bold',
                            color: theme.primary,
                            textAlign: 'center',
                        }}
                    >
                        Create Account
                    </Text>

                    <Text
                        style={{
                            textAlign: 'center',
                            marginTop: 8,
                            fontSize: 15,
                            color: theme.subText,
                        }}
                    >
                        Start your creative journey.
                    </Text>

                    {/* Name */}
                    <View style={{ marginTop: 30 }}>

                        <Text
                            style={{
                                fontWeight: '700',
                                marginBottom: 8,
                                fontSize: 12,
                                letterSpacing: 1,
                                color: theme.text,
                            }}
                        >
                            FULL NAME
                        </Text>

                        <View
                            style={{
                                borderWidth: 1,
                                borderColor: theme.border,
                                borderRadius: 14,
                                height: 52,
                                flexDirection: 'row',
                                alignItems: 'center',
                                paddingHorizontal: 14,
                            }}
                        >

                            <User size={20} color={theme.subText} />

                            <TextInput
                                value={name}
                                onChangeText={setName}
                                placeholder="John Doe"
                                placeholderTextColor={theme.subText}
                                style={{
                                    marginLeft: 10,
                                    flex: 1,
                                    fontSize: 15,
                                    color: theme.text,
                                }}
                            />

                        </View>
                    </View>

                    {/* Phone */}
                    <View style={{ marginTop: 18 }}>

                        <Text
                            style={{
                                fontWeight: '700',
                                marginBottom: 8,
                                fontSize: 12,
                                letterSpacing: 1,
                                color: theme.text,
                            }}
                        >
                            PHONE NUMBER
                        </Text>

                        <View
                            style={{
                                borderWidth: 1,
                                borderColor: theme.border,
                                borderRadius: 14,
                                height: 52,
                                flexDirection: 'row',
                                alignItems: 'center',
                                paddingHorizontal: 14,
                            }}
                        >

                            {/* Country Picker */}
                            <View
                                style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    paddingRight: 10,
                                    borderRightWidth: 1,
                                    borderRightColor: theme.border,
                                }}
                            >

                                <CountryPicker
                                    withFilter
                                    withFlag
                                    withCallingCode
                                    withEmoji
                                    countryCode={countryCode}
                                    onSelect={(country) => {

                                        setCountryCode(country.cca2);

                                        setCallingCode(
                                            country.callingCode[0]
                                        );
                                    }}
                                />

                                <Text
                                    style={{
                                        color: theme.text,
                                        fontWeight: "700",
                                        marginLeft: 4,
                                    }}
                                >
                                    +{callingCode}
                                </Text>

                            </View>

                            <TextInput
                                value={phone}
                                onChangeText={(text) => {

                                    const cleaned =
                                        text.replace(/[^0-9]/g, "");

                                    const limited =
                                        cleaned.slice(0, 10);

                                    const formatted =
                                        limited.replace(
                                            /(\d{5})(\d+)/,
                                            "$1 $2"
                                        );

                                    setPhone(formatted);
                                }}
                                keyboardType="number-pad"
                                maxLength={11}
                                placeholder="12345 67890"
                                placeholderTextColor={theme.subText}
                                style={{
                                    marginLeft: 10,
                                    flex: 1,
                                    fontSize: 15,
                                    color: theme.text,
                                }}
                            />

                        </View>
                    </View>







                    {/* Email */}
                    <View style={{ marginTop: 18 }}>

                        <Text
                            style={{
                                fontWeight: '700',
                                marginBottom: 8,
                                fontSize: 12,
                                letterSpacing: 1,
                                color: theme.text,
                            }}
                        >
                            EMAIL ADDRESS
                        </Text>

                        <View
                            style={{
                                borderWidth: 1,
                                borderColor: theme.border,
                                borderRadius: 14,
                                height: 52,
                                flexDirection: 'row',
                                alignItems: 'center',
                                paddingHorizontal: 14,
                            }}
                        >

                            <Mail size={20} color={theme.subText} />

                            <TextInput
                                value={email}
                                onChangeText={setEmail}
                                autoCapitalize="none"
                                keyboardType="email-address"
                                placeholder="hello@email.com"
                                placeholderTextColor={theme.subText}
                                style={{
                                    marginLeft: 10,
                                    flex: 1,
                                    fontSize: 15,
                                    color: theme.text,
                                }}
                            />

                        </View>
                    </View>

                    {/* Password */}
                    <View style={{ marginTop: 18 }}>

                        <Text
                            style={{
                                fontWeight: '700',
                                marginBottom: 8,
                                fontSize: 12,
                                letterSpacing: 1,
                                color: theme.text,
                            }}
                        >
                            PASSWORD
                        </Text>

                        <View
                            style={{
                                borderWidth: 1,
                                borderColor: theme.border,
                                borderRadius: 14,
                                height: 52,
                                flexDirection: 'row',
                                alignItems: 'center',
                                paddingHorizontal: 14,
                            }}
                        >

                            <Lock size={20} color={theme.subText} />

                            <TextInput
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!passwordVisible}
                                placeholder="••••••••"
                                placeholderTextColor={theme.subText}
                                style={{
                                    marginLeft: 10,
                                    flex: 1,
                                    fontSize: 15,
                                    color: theme.text,
                                }}
                            />

                            <TouchableOpacity
                                onPress={() =>
                                    setPasswordVisible(!passwordVisible)
                                }
                            >
                                {
                                    passwordVisible
                                        ? <Eye size={20} color={theme.subText} />
                                        : <EyeOff size={20} color={theme.subText} />
                                }
                            </TouchableOpacity>

                        </View>
                    </View>

                    {/* Create Account Button */}
                    <TouchableOpacity
                        onPress={handleSignup}
                        style={{
                            backgroundColor: theme.primary,
                            height: 52,
                            borderRadius: 14,
                            justifyContent: 'center',
                            alignItems: 'center',
                            marginTop: 28,
                        }}
                    >

                        <Text
                            style={{
                                color: '#fff',
                                fontSize: 18,
                                fontWeight: 'bold',
                            }}
                        >
                            {
                                loading
                                    ? "Creating..."
                                    : "Create Account"
                            }
                        </Text>

                    </TouchableOpacity>

                    {/* Login Option */}
                    <View
                        style={{
                            flexDirection: 'row',
                            justifyContent: 'center',
                            marginTop: 22,
                        }}
                    >

                        <Text
                            style={{
                                color: theme.subText,
                                fontSize: 14,
                            }}
                        >
                            Already have an account?
                        </Text>

                        <TouchableOpacity
                            onPress={() => navigation.navigate('Login')}
                        >

                            <Text
                                style={{
                                    color: theme.primary,
                                    fontSize: 14,
                                    fontWeight: 'bold',
                                    marginLeft: 5,
                                }}
                            >
                                Log In
                            </Text>

                        </TouchableOpacity>

                    </View>

                </View>

            </ScrollView>
        </SafeAreaView>
    );
};

export default SignupScreen;