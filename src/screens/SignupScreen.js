import React, { useState, useContext } from 'react';
import { Image, useColorScheme } from "react-native";
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

import CustomAlert from "../components/CustomAlert";

import CountryPicker from "react-native-country-picker-modal";

import { ThemeContext } from '../theme/ThemeContext';

import signup from "../firebase/signup";

const SignupScreen = ({ navigation }) => {
    const { theme } = useContext(ThemeContext);
   
    const darkLogo = require("../../assets/images/full logo.png");
    const lightLogo = require("../../assets/images/full logo light.png");

    const colorScheme = useColorScheme();
   
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertTitle, setAlertTitle] = useState("");
    const [alertMessage, setAlertMessage] = useState("");
   
   
   
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

   const showAlert = (title, message) => {
  setAlertTitle(title);
  setAlertMessage(message);
  setAlertVisible(true);
};
   
   
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

            showAlert(
  "Invalid Email",
  "Please use Gmail, Yahoo, iCloud, Outlook or Hotmail email."
);

            return;
        }

        if (!name || !phone || !email || !password) {

            showAlert("Error", "Please fill all fields");

            return;
        }

        if (phone.replace(/\s/g, "").length < 10) {

            showAlert("Invalid Number", "Please enter valid phone number");

            return;
        }

        if (password.length < 6) {

            showAlert("Weak Password", "Password must be at least 6 characters");

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

        showAlert(
        "Verify Email",
         "Verification email sent. Please check your inbox."
        );

    } else {

        showAlert("Signup Failed", result.error);
    }

} catch (error) {

    console.log(error);

    showAlert("Error", "Something went wrong");

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
                        disabled={loading}
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

                    <CustomAlert
                    visible={alertVisible}
                    title={alertTitle}
                    message={alertMessage}
                    onClose={() => setAlertVisible(false)}
                    />
              
              
              
                </View>

            </ScrollView>
        </SafeAreaView>
    );
};

export default SignupScreen;