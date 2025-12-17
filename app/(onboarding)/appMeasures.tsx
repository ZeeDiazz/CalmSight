import {View, Text, TouchableOpacity} from "react-native";
import {useRouter} from "expo-router";
import TextCard from "@/components/log-component/textCard";
import React from "react";

const AppMeasures = () => {
    const router = useRouter();

    const handleRoute= ()=> {
        router.push("/(onboarding)/subjectiveIndicators");
    };

    const indicators = [
        {title: "SUBJECTIVE INDICATORS", description: "Your self-reported stress, fatigue, and wellbeing"},
        {title: "OBJECTIVE INDICATORS", description: "Heart Rate, HRV, sleep quality, physical activity patterns"},
        {title: "BEHAVIORAL PATTERNS", description: "Work hours, break patterns, recovery behaviors"},
        {title: "COGNITIVE INDICATORS", description: "Worry time, threat monitoring, mental replay"}
    ];

    return (
        <>
            <View className="flex-1 bg-background pt-[12%]">
                <Text className="text-3xl font-black text-secondary-dark pl-[3%] mt-4 mb-5">
                    What the App Measures
                </Text>


                {/*SPACING*/}
                <View className="h-[3%]"/>

                <View className="flex-1 gap-y-[3%] mb-8">
                    {indicators.map((indicator, index) => (
                        <TextCard key={index} title={indicator.title} subtext={indicator.description}/>
                    ))}
                </View>
            </View>


            <View className="absolute bottom-[5%] left-0 right-0 items-center">
                <TouchableOpacity
                    onPress={handleRoute}
                    className="rounded-xl p-5 items-center justify-center border border-[#D9D9D9] w-[48%] bg-primary">
                    <Text className="text-center text-[15px] text-white">Continue</Text>
                </TouchableOpacity>
            </View>
        </>
    );
};

export default AppMeasures;