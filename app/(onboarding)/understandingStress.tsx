import {View, Text, TouchableOpacity} from "react-native";
import { useRouter } from "expo-router";
import React from "react";

const UnderstandingStress = () => {
    const router = useRouter();

    const handleRoute= ()=> {
        router.push("/(onboarding)/appMeasures");
    };

    return (
        <View className="flex-1 bg-background pt-[12%]">
            <Text className="text-3xl font-black text-secondary-dark pl-[3%] mt-4 mb-5">
                Understanding Stress
            </Text>

            {/*SPACING*/}
            <View className="h-[3%]" />

            {/*TODO: replace with an image*/}
            <View className="px-[3%]">
                <View className="bg-background-dark rounded-2xl p-8 mb-8 items-center justify-center min-h-[200px]">
                    <View className="flex-row items-center justify-center gap-4">
                        <View className="w-16 h-16 rounded-full bg-gray-300" />
                        <Text className="text-secondary text-2xl">→</Text>
                        <View className="w-16 h-16 rounded-full bg-gray-300" />
                        <Text className="text-secondary text-2xl">→</Text>
                        <View className="w-16 h-16 rounded-full bg-gray-300" />
                    </View>
                </View>
            </View>

            <View className="px-[3%]">
                <Text className="text-secondary text-[16px] text-center leading-6 mb-[6%]">
                    Stress depends on interpretation and coping resources, not events alone.
                </Text>
                <Text className="text-secondary text-[16px] text-center leading-6">
                    Two people in the same situation experience different stress levels based on how they appraise the situation and their available resources.
                </Text>
            </View>

            <View className="absolute bottom-[5%] left-0 right-0 items-center">
                <TouchableOpacity
                    onPress={handleRoute}
                    className="rounded-xl p-5 items-center justify-center border border-[#D9D9D9] w-[48%] bg-primary">
                    <Text className="text-center text-[15px] text-white">Continue</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default UnderstandingStress;