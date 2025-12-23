import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import React from "react";
import TextCard from "@/components/log-component/textCard";

const SubjectiveIndicators = () => {
    const router = useRouter();

    //TODO: update desc
    const cognitiveProcesses = [
        { title: "WORRY LOOPS", description: "TEXT" },
        { title: "THREAT FOCUS", description: "TEXT" },
        { title: "MENTAL REPLAY", description: "TEXT" }
    ];

    const handleRoute= ()=> {
        router.push("/(onboarding)/setup");
    };

    return (
        <View className="flex-1 bg-background pt-[12%]">
            <Text className="text-3xl font-black text-secondary-dark pl-[3%] mt-4 mb-5">
                Subjective Indicators
            </Text>

            {/*TODO: replace with an image*/}
            <View className="px-[3%]">
                <View className="bg-background-dark rounded-xl p-8 mb-8">
                    <Text className="text-secondary-dark font-semibold text-center text-base mb-4 italic">
                        We track how much you think,{"\n"}not what you think
                    </Text>
                    <Text className="text-secondary text-sm text-center">
                        We utilize Metacognitive Therapy (MCT), where it focuses on reducing excessive thinking patterns that maintain stress
                    </Text>
                </View>
            </View>

            <Text className="text-secondary-dark font-bold text-[15px] mb-4 px-[3%]">
                Stress escalates through repetitive cognitive processes:
            </Text>

            <View className="flex-1 gap-y-[2%]">
                {cognitiveProcesses.map((process, index) => (
                    <TextCard key={index} title={process.title} subtext={process.description} />
                ))}
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

export default SubjectiveIndicators;