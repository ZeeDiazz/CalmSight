import {View, Text, TouchableOpacity, ScrollView} from "react-native";
import {useRouter} from "expo-router";
import TextCard from "@/components/log-component/textCard";
import React from "react";

const AppMeasures = () => {
    const router = useRouter();

    const handleRoute= ()=> {
        router.push("/(onboarding)/subjectiveIndicators");
    };

    const handleSkip = () => {
        router.push("/(onboarding)/setup");
    };

    const indicators = [
        {
            title: "Cognitive Indicators",
            description: "Worry time, threat monitoring, and mental replay patterns",
            icon: "🧠",
            color: "#2FB5B5",
            bgColor: "#E0F5F5",
            featured: true,
            badge: "Our Focus"
        },
        {
            title: "Subjective Indicators",
            description: "Your self-reported stress, fatigue, and wellbeing",
            icon: "💭",
            color: "#F59E0B",
            bgColor: "#FEF3C7",
            featured: false
        },
        {
            title: "Objective Indicators",
            description: "Heart rate, HRV, sleep quality, and activity patterns",
            icon: "❤️",
            color: "#3B82F6",
            bgColor: "#DBEAFE",
            featured: false
        },
        {
            title: "Behavioral Patterns",
            description: "Work hours, break patterns, and recovery behaviors",
            icon: "📊",
            color: "#A855F7",
            bgColor: "#F3E8FF",
            featured: false
        }
    ];

    return (
        <View className="flex-1">
            <View className="flex-1 bg-background">
                <View className="flex-row justify-between items-center px-[3%] pt-[10%] mt-4 mb-4">
                    <Text className="justify-center text-sm font-medium text-background opacity-80">
                        Skip
                    </Text>
                    <View className="flex-row justify-center gap-2">
                        <View className="w-2 h-2 rounded-full bg-secondary opacity-20"/>
                        <View className="rounded-full bg-primary" style={{ width: 24, height: 8 }}/>
                        <View className="w-2 h-2 rounded-full bg-secondary opacity-20"/>
                        <View className="w-2 h-2 rounded-full bg-secondary opacity-20"/>
                    </View>
                    <TouchableOpacity onPress={handleSkip} className=" py-2 rounded-lg">
                        <Text className="text-sm font-medium text-secondary opacity-80">Skip</Text>
                    </TouchableOpacity>
                </View>
                <View className="px-[3%]">
                    <Text className="text-4xl font-black text-secondary-dark mb-1">
                        What We Track
                    </Text>
                </View>

                <ScrollView
                    className="flex-1"
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 120 }}
                >
                    <Text className="px-[3%] text-[15px] text-secondary leading-relaxed mb-6 ">
                        CalmSight monitors multiple dimensions of your wellbeing
                    </Text>

                    <View className="px-[3%] gap-4">
                        {indicators.map((indicator, index) => (
                            <View
                                key={index}
                                className={`rounded-2xl ${indicator.featured ? 'p-6' : 'p-5'}`}
                                style={{
                                    backgroundColor: indicator.featured ? indicator.bgColor : 'white',
                                    borderWidth: indicator.featured ? 2 : 2,
                                    borderColor: indicator.featured ? indicator.color : '#F5F5F5',
                                    overflow: 'hidden',
                                    shadowColor: '#000',
                                    shadowOffset: { width: 0, height: 2 },
                                    shadowOpacity: indicator.featured ? 0.1 : 0.05,
                                    shadowRadius: 8,
                                    elevation: indicator.featured ? 4 : 2,
                                }}
                            >
                                {/* Badge for featured card */}
                                {indicator.featured && (
                                    <View className="mb-3">
                                        <View
                                            className="self-start rounded-full px-3 py-1"
                                            style={{ backgroundColor: indicator.color }}
                                        >
                                            <Text className="text-xs font-bold text-white uppercase tracking-wider">
                                                {indicator.badge}
                                            </Text>
                                        </View>
                                    </View>
                                )}

                                {/* Card Header */}
                                <View className="flex-row items-center gap-3 mb-2">
                                    <View
                                        className="rounded-xl items-center justify-center"
                                        style={{
                                            width: indicator.featured ? 56 : 48,
                                            height: indicator.featured ? 56 : 48,
                                            backgroundColor: indicator.bgColor,
                                        }}
                                    >
                                        <Text className={indicator.featured ? "text-3xl" : "text-2xl"}>
                                            {indicator.icon}
                                        </Text>
                                    </View>

                                    <View className="flex-1">
                                        <Text
                                            className={`font-bold text-secondary-dark ${indicator.featured ? 'text-lg' : 'text-base'}`}
                                        >
                                            {indicator.title}
                                        </Text>
                                    </View>
                                </View>

                                {/* Card Description */}
                                <Text className="text-[13px] text-secondary leading-relaxed">
                                    {indicator.description}
                                </Text>

                                {/* Left border accent */}
                                <View
                                    className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl"
                                    style={{
                                        backgroundColor: indicator.color,
                                        opacity: 0.5,
                                    }}
                                />
                            </View>
                        ))}
                    </View>
                </ScrollView>
            </View>


            <View className="absolute bottom-12 left-0 right-0 px-[3%]">
                <TouchableOpacity
                    onPress={handleRoute}
                    className="rounded-2xl p-5 items-center justify-center bg-primary shadow-lg"
                    style={{
                        shadowColor: '#2FB5B5',
                        shadowOffset: {width: 0, height: 4},
                        shadowOpacity: 0.3,
                        shadowRadius: 12,
                        elevation: 8,
                    }}
                >
                    <Text className="text-center text-[15px] text-white">Continue</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default AppMeasures;