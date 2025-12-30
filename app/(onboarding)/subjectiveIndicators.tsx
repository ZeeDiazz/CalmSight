import {View, Text, TouchableOpacity, ScrollView, Dimensions} from "react-native";
import { useRouter } from "expo-router";
import React, {useState} from "react";
import TextCard from "@/components/log-component/textCard";

const SubjectiveIndicators = () => {
    const router = useRouter();
    const [expandedCard, setExpandedCard] = useState<number | null>(null);

    //TODO: update desc
    const cognitiveProcesses = [
        {
            title: "Worry Loops",
            description: "Repetitive anxious thoughts",
            icon: "🔄",
            color: "#F59E0B",
            bgColor: "#FEF3C7",
            example: "What if I mess up this presentation? What if my boss thinks I'm incompetent? What if I lose my job?"
        },
        {
            title: "Threat Focus",
            description: "Scanning for problems",
            icon: "🔍",
            color: "#3B82F6",
            bgColor: "#DBEAFE",
            example: "Constantly checking emails for bad news, interpreting neutral messages as criticism, or anticipating worst-case scenarios."
        },
        {
            title: "Mental Replay",
            description: "Reliving past events",
            icon: "⏮️",
            color: "#A855F7",
            bgColor: "#F3E8FF",
            example: "Replaying an awkward conversation from yesterday, analyzing what you should have said differently, or dwelling on past mistakes."
        }
    ];

    const toggleCard = (index: number) => {
        setExpandedCard(expandedCard === index ? null : index);
    };

    const handleRoute= ()=> {
        router.push("/(onboarding)/setup");
    };

    const handleSkip = () => {
        router.push("/(onboarding)/setup");
    };

    return (
        <View className="flex-1 bg-background">
            <View className="flex-row justify-between items-center px-[3%] pt-[10%] mt-4 mb-4">
                <Text className="justify-center text-sm font-medium text-background opacity-80">
                    Skip
                </Text>
                <View className="flex-row justify-center gap-2">
                    <View className="w-2 h-2 rounded-full bg-secondary opacity-20"/>
                    <View className="w-2 h-2 rounded-full bg-secondary opacity-20"/>
                    <View className="rounded-full bg-primary" style={{ width: 24, height: 8}}/>
                    <View className="w-2 h-2 rounded-full bg-secondary opacity-20"/>
                </View>
                <TouchableOpacity onPress={handleSkip} className=" py-2 rounded-lg">
                    <Text className="text-sm font-medium text-secondary opacity-80">Skip</Text>
                </TouchableOpacity>
            </View>

            <View className="px-[3%]">
                <Text className="text-4xl font-black text-secondary-dark mb-1">
                    Cognitive Tracking
                </Text>
            </View>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
                <Text className="px-[3%] text-[15px] text-secondary leading-relaxed mb-6">
                    Understanding your thinking patterns
                </Text>

                <View className="px-[3%] mb-4">
                    <View className="rounded-2xl p-5" style={{backgroundColor: '#FEF3C7', borderLeftWidth: 4, borderLeftColor: '#F59E0B',}}>
                        <View>
                            <Text className="text-base font-bold text-secondary-dark italic mb-2">
                                We track how much you think, not what you think
                            </Text>
                            <Text className="text-[13px] text-secondary leading-relaxed">
                                Based on Metacognitive Therapy (MCT), we focus on reducing excessive thinking patterns that maintain stress
                            </Text>
                        </View>
                    </View>
                </View>

                <Text className="text-secondary-dark font-bold text-[15px] mb-4 px-[3%]">
                    Stress escalates through repetitive cognitive processes:
                </Text>

                <View className="px-[3%] gap-3 mb-6">
                    {cognitiveProcesses.map((process, index) => {
                        const isExpanded = expandedCard === index;

                        return (
                            <TouchableOpacity
                                key={index}
                                onPress={() => toggleCard(index)}
                                activeOpacity={0.7}
                            >
                                <View
                                    className="rounded-2xl p-5 border-2"
                                    style={{
                                        backgroundColor: isExpanded ? process.bgColor : 'white',
                                        borderColor: isExpanded ? process.color : '#F5F5F5',
                                        shadowColor: '#000',
                                        shadowOffset: { width: 0, height: 2 },
                                        shadowOpacity: isExpanded ? 0.1 : 0.05,
                                        shadowRadius: 8,
                                        elevation: isExpanded ? 4 : 2,
                                    }}
                                >

                                    <View className="flex-row items-start">
                                        <View className="rounded-xl items-center justify-center mr-3"
                                            style={{
                                                width: 40,
                                                height: 40,
                                                backgroundColor: process.bgColor,
                                            }}
                                        >
                                            <Text className="text-xl">{process.icon}</Text>
                                        </View>

                                        <View className="flex-1">
                                            <Text className="text-base font-bold text-secondary-dark mb-1">
                                                {process.title}
                                            </Text>
                                            <Text className="text-[13px] text-secondary leading-relaxed">
                                                {process.description}
                                            </Text>
                                        </View>

                                        <View className="w-6 h-6 rounded-full items-center justify-center ml-2"
                                              style = {{
                                                  borderRadius: 6 + 6,
                                                  width: 24,
                                                  height: 24,
                                                  justifyContent: 'center',
                                                  alignItems: 'center',
                                                  backgroundColor: isExpanded ? process.color : '#F5F5F5',
                                                  transform: [{ rotate: isExpanded ? '180deg' : '0deg' }]
                                              }}
                                        >
                                            <Text className="text-sm" style={{ color: isExpanded ? 'white' : '#737373' }}>
                                                ↓
                                            </Text>
                                        </View>
                                    </View>

                                    {isExpanded && (
                                        <View className="mt-4 rounded-xl p-3" style={{ backgroundColor: 'white' }}>
                                            <Text className="text-[13px] text-secondary leading-relaxed italic">
                                                <Text className="font-semibold not-italic">Example: </Text>
                                                {process.example}
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </View>

            </ScrollView>


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

export default SubjectiveIndicators;