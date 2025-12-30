import {View, Text, TouchableOpacity, TextInput, Image, KeyboardAvoidingView, Platform, ScrollView} from "react-native";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { useAuth } from "@/utils/AuthContext";

const Login = () => {
    const router = useRouter();
    const { setLoggedIn } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [emailError, setEmailError] = useState("");
    const [passwordError, setPasswordError] = useState("");

    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleLogin = async () => {
        // Reset errors
        setEmailError("");
        setPasswordError("");

        // Validate
        let hasError = false;

        if (!email) {
            setEmailError("Email is required");
            hasError = true;
        } else if (!validateEmail(email)) {
            setEmailError("Please enter a valid email");
            hasError = true;
        }

        if (!password) {
            setPasswordError("Password is required");
            hasError = true;
        } else if (password.length < 6) {
            setPasswordError("Password must be at least 6 characters");
            hasError = true;
        }

        if (hasError) return;

        // Mock login - just set logged in state
        await setLoggedIn(true);
        router.push("/(onboarding)/pickAvatar");
    };

    const handleSignUp = () => {
        // Navigate to sign up page
    };

    const isFormValid = email !== "" && password !== "" && validateEmail(email);

    const icons = {
        eye: require('@/assets/icons/eye.png'),
        eyeHidden: require('@/assets/icons/eyeHidden.png'),
        apple: require('@/assets/icons/appleLogo.png'),
        google: require('@/assets/icons/googleLogo.png'),
    };

    return (
        <KeyboardAvoidingView
            className="flex-1 bg-background"
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <View className="flex-row justify-between items-center px-[3%] pt-[10%] mt-4 mb-4">
                <Text className="justify-center text-sm font-medium text-background opacity-80">
                    Skip
                </Text>
                <Text className="justify-center text-sm font-medium text-background opacity-80">
                    Skip
                </Text>
            </View>
            <View className="px-[3%]">
                <Text className="text-4xl font-black text-secondary-dark mb-1">
                    Login
                </Text>
            </View>
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                <Text className="text-[15px] text-secondary leading-relaxed mb-6 px-[3%]">
                    Sign in to continue your stress management journey
                </Text>
            {/* Email Input */}
            <View className="mb-4 px-[3%]">
                <Text className="text-sm font-semibold  text-secondary-dark mb-2">Email</Text>
                <TextInput
                    className={`bg-white rounded-2xl p-4 border text-secondary-dark ${
                        emailError ? 'border-red-500' : 'border-[#D9D9D9] '
                    }`}
                    placeholder="Enter your email"
                    placeholderTextColor="#7B9BA8"
                    value={email}
                    onChangeText={(text) => {
                        setEmail(text);
                        setEmailError("");
                    }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                />
                {emailError ? (
                    <Text className="text-xs text-red-500 mt-1 ml-1">
                        {emailError}
                    </Text>
                ) : null}
            </View>

            <View className="mb-4 px-[3%]">
                <Text className="text-sm font-semibold  text-secondary-dark mb-2">Password</Text>
                <View className="relative">
                    <TextInput
                        className={`bg-white rounded-2xl p-4 pr-12 border text-secondary-dark ${
                            passwordError ? 'border-red-500' : 'border-[#D9D9D9]'
                        }`}
                        placeholder="Enter your password"
                        placeholderTextColor="#7B9BA8"
                        value={password}
                        onChangeText={(text) => {
                            setPassword(text);
                            setPasswordError("");
                        }}
                        secureTextEntry={!showPassword}
                        autoCorrect={false}
                    />
                    <TouchableOpacity
                        className="absolute right-4 top-4"
                        onPress={() => setShowPassword(!showPassword)}
                    >
                        <Image
                            className="w-6 h-6"
                            source={showPassword ? icons.eye : icons.eyeHidden}
                            resizeMode="contain"
                        />
                    </TouchableOpacity>
                </View>
                {passwordError ? (
                    <Text className="text-xs text-red-500 mt-1 ml-1">
                        {passwordError}
                    </Text>
                ) : null}
            </View>

            <TouchableOpacity
                className="flex-row items-center mb-6 px-[3%]"
                onPress={() => setRememberMe(!rememberMe)}
            >
                <View className={`w-5 h-5 rounded border mr-2 items-center justify-center ${
                    rememberMe ? 'bg-primary border-primary' : 'border-[#D9D9D9]'
                }`}>
                    {rememberMe && <Text className="text-white text-xs">✓</Text>}
                </View>
                <Text className="text-sm text-secondary">Remember me</Text>
            </TouchableOpacity>

                <TouchableOpacity className="mb-4">
                    <Text className="text-sm text-primary text-center">Forgot password?</Text>
                </TouchableOpacity>

                <View className="flex-row items-center mb-6 px-[3%]">
                    <View className="flex-1 h-[1px] bg-secondary" />
                    <Text className="px-4 text-[13px] text-secondary">
                        or continue with
                    </Text>
                    <View className="flex-1 h-[1px] bg-secondary" />
                </View>
                <View className="px-[3%]">
                <TouchableOpacity
                    onPress={handleLogin}
                    className="rounded-2xl p-5 px-[3%] items-center justify-center bg-white border-2 mb-4"
                    style={{
                        borderColor: '#F5F5F5',
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: 0.05,
                        shadowRadius: 3,
                        elevation: 2
                    }}
                >
                    <View className="flex-row">
                        <Image
                            source={icons.google}
                            className="w-6 h-6 mr-3"
                            resizeMode="contain"
                        />
                        <Text className="text-center text-[15px] text-secondary-dark">Continue with Google</Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={handleLogin}
                    className="rounded-2xl p-5 px-[3%] items-center justify-center bg-white border-2"
                    style={{
                        borderColor: '#F5F5F5',
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: 0.05,
                        shadowRadius: 3,
                        elevation: 2
                    }}
                >
                    <View className="flex-row">
                        <Image
                            source={icons.apple}
                            className="w-6 h-6 mr-3"
                            resizeMode="contain"
                        />
                        <Text className="text-center text-[15px] text-secondary-dark">Continue with Apple</Text>
                    </View>
                </TouchableOpacity>
                </View>

            </ScrollView>


            <View className="absolute bottom-[5%] left-0 right-0 items-center">
                <View className="absolute bottom-12 left-0 right-0 px-[3%]">
                    <TouchableOpacity
                        onPress={handleLogin}
                        disabled={!isFormValid}
                        className="rounded-2xl p-5 items-center justify-center bg-primary shadow-lg"
                        style={{
                            shadowColor: '#2FB5B5',
                            shadowOffset: {width: 0, height: 4},
                            shadowOpacity: 0.3,
                            shadowRadius: 12,
                            elevation: 8,
                        }}
                    >
                        <Text className="text-center text-[15px] text-white">Login</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity onPress={handleSignUp} className="mt-4">
                    <Text className="text-sm text-secondary">
                        Don&#39;t have an account? <Text className="text-primary font-semibold">Sign up</Text>
                    </Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
};

export default Login;