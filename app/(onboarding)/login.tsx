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
            {/*TODO: implement this with backend*/}

            {/*TODO: disable login when not logged in*/}
            <View className="absolute bottom-[5%] left-0 right-0 items-center">
                <TouchableOpacity
                    onPress={handleLogin}
                    className="rounded-xl p-5 items-center justify-center border border-[#D9D9D9] w-[48%] bg-primary">
                    <Text className="text-center text-[15px] text-white">Continue</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default Login;