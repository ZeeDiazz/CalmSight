import { View, Text, TouchableOpacity, TextInput } from "react-native";
import { useRouter } from "expo-router";
import React, { useState } from "react";

const Login = () => {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = () => {
        // TODO: Implement login logic
        router.push("/(onboarding)/pickAvatar");
    };

    return (
        <View className="flex-1 bg-background pt-[12%] px-[3%]">
            <Text className="text-3xl font-black text-secondary-dark mt-4 mb-5">
                Login
            </Text>

            {/* Email Input */}
            <View className="mb-4">
                <Text className="text-sm text-secondary-dark mb-2">Email</Text>
                <TextInput
                    className="bg-background-dark rounded-xl p-4 border border-[#D9D9D9] text-secondary-dark"
                    placeholder="Enter your email"
                    placeholderTextColor="#7B9BA8"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />
            </View>

            <View className="mb-4">
                <Text className="text-sm text-secondary-dark mb-2">Password</Text>
                <View className="relative">
                    <TextInput
                        className="bg-background-dark rounded-xl p-4 border border-[#D9D9D9] text-secondary-dark pr-12"
                        placeholder="Enter your password"
                        placeholderTextColor="#7B9BA8"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={!showPassword}
                    />
                    <TouchableOpacity
                        className="absolute right-4 top-4"
                        onPress={() => setShowPassword(!showPassword)}
                    >
                        <Text className="text-primary">{showPassword ? '🙈' : '👁️'}</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <TouchableOpacity
                className="flex-row items-center mb-6"
                onPress={() => setRememberMe(!rememberMe)}
            >
                <View className={`w-5 h-5 rounded border mr-2 items-center justify-center ${
                    rememberMe ? 'bg-primary border-primary' : 'border-[#D9D9D9]'
                }`}>
                    {rememberMe && <Text className="text-white text-xs">✓</Text>}
                </View>
                <Text className="text-sm text-secondary">Remember me</Text>
            </TouchableOpacity>

            {/* TODO: Add forgot password link */}
            <TouchableOpacity className="mb-4">
                <Text className="text-sm text-primary text-center">Forgot password?</Text>
            </TouchableOpacity>

            <View className="absolute bottom-[5%] left-0 right-0 items-center">
                <TouchableOpacity
                    onPress={handleLogin}
                    className="rounded-xl p-5 items-center justify-center border border-[#D9D9D9] w-[48%] bg-primary"
                >
                    <Text className="text-center text-[15px] text-white font-semibold">Login</Text>
                </TouchableOpacity>

                {/* Sign up link */}
                <TouchableOpacity className="mt-4">
                    <Text className="text-sm text-secondary">
                        Don't have an account? <Text className="text-primary font-semibold">Sign up</Text>
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default Login;