import React, { useState, useContext } from 'react';
import { Image, useColorScheme } from "react-native";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
    ScrollView,
} from 'react-native';

import {
    Mail,
    Lock,
    Eye,
    EyeOff,
} from 'lucide-react-native';

import { ThemeContext } from '../theme/ThemeContext';
import login from "../firebase/login";
import CustomAlert from "../components/CustomAlert";

const LoginScreen = ({ navigation }) => {
    const { theme } = useContext(ThemeContext);
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

const darkLogo = require("../../assets/images/full logo.png");
const lightLogo = require("../../assets/images/full logo light.png");

const colorScheme = useColorScheme();

const [alertVisible, setAlertVisible] = useState(false);
const [alertTitle, setAlertTitle] = useState("");
const [alertMessage, setAlertMessage] = useState("");


  const handleLogin = async () => {

    if (!email || !password) {
        showAlert("Error", "Please fill all fields");
        return;
    }

    try {
        setLoading(true);

        const result = await login(email, password);

        if (result.success) {
   return;
}
        else {
            if (result.error === "auth/invalid-credential") {
                showAlert("Login Failed", "Incorrect email or password");
            }
            else if (result.error === "auth/user-not-found") {
                showAlert("Login Failed", "No account found with this email");
            }
            else if (result.error === "auth/wrong-password") {
               showAlert("Login Failed", "Incorrect password");
            }
            else if (result.error === "auth/invalid-email") {
                showAlert("Login Failed", "Invalid email address");
            }
            else if (result.error === "Please verify your email first.") {
                showAlert("Verification Required", "Please verify your email first");
            }
            else {
               showAlert("Login Failed", "Please try again");
            }
        }

    } catch (error) {
        console.log(error);
        showAlert("Error", "Something went wrong");

    } finally {
        setLoading(false);
    }
};

const showAlert = (title, message) => {
  setAlertTitle(title);
  setAlertMessage(message);
  setAlertVisible(true);
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
                            fontSize: 34,
                            fontWeight: 'bold',
                            color: theme.primary,
                            textAlign: 'center',
                        }}
                    >
                        Welcome Back
                    </Text>

                    <Text
                        style={{
                            textAlign: 'center',
                            marginTop: 8,
                            fontSize: 15,
                            color: theme.subText,
                        }}
                    >
                        Continue your creative journey.
                    </Text>

                    {/* Email */}
                    <View style={{ marginTop: 35 }}>

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


                                placeholder="hello@kreashiv.com"
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
                    <View style={{ marginTop: 20 }}>

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

                    {/* Forgot Password */}
                    <TouchableOpacity
                        onPress={() =>
                            navigation.navigate('ForgotPassword')
                        }
                        style={{
                            marginTop: 12,
                            alignSelf: 'flex-end',
                        }}
                    >
                        <Text
                            style={{
                                color: theme.primary,
                                fontWeight: '600',
                                fontSize: 13,
                            }}
                        >
                            Forgot Password?
                        </Text>
                    </TouchableOpacity>

                    {/* Login Button */}
                    <TouchableOpacity
                    onPress={handleLogin}
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
                                    ? "Logging In..."
                                    : "Log In"
                            }
                        </Text>


                    </TouchableOpacity>

                    {/* Sign Up Option */}
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
                            Don’t have an account?
                        </Text>

                        <TouchableOpacity
                            onPress={() => navigation.navigate('Signup')}
                        >

                            <Text
                                style={{
                                    color: theme.primary,
                                    fontSize: 14,
                                    fontWeight: 'bold',
                                    marginLeft: 5,
                                }}
                            >
                                Sign Up
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

export default LoginScreen;