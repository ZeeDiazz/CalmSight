import Card from "@/app/components/card";
import {ScrollView, Text, View} from "react-native";

export default function Index() {
    const stressData = {
        score: 64,
        level: 'Low Stress',
        description: 'Acute stress level, short term stress',
    };
    const stats = [
        { value: 'Mid', label: 'WORRY TIME', textColor: 'text-[#7B9BA8]'},
        { value: 'Low', label: 'THREAT MONITORING', textColor: 'text-[#D4A574]'},
        { value: '7.5 h', label: 'SLEEP', textColor: 'text-[#5FA8A8]'},
        { value: '4.5 h', label: 'SCREEN TIME', textColor: 'text-[#7B9BA8]'},
        { value: 'Acute', label: 'STRESS TYPE', textColor: 'text-[#5FA8A8]'},
        { value: 'Low', label: 'BURNOUT RISK', textColor: 'text-[#7B9BA8]'},
    ];


    return (
        <View className="flex-1 bg-background pt-12">
            <View className="mt-4 mb-5 px-4">
                <Text className="text-sm text-secondary mb-1">
                    Wednesday, November 27
                </Text>
                <Text className="text-3xl font-bold text-secondary-dark">
                    Today&#39;s Overview
                </Text>
            </View>

            <ScrollView
                className="flex-1 px-4"
                showsVerticalScrollIndicator={false}
            >
                {/*Stress score*/}
                <View className="bg-background-dark rounded-xl p-5 mb-4 border border-[#D9D9D9]">
                    <Text className="text-[18px] font-semibold text-secondary-dark mb-4">
                        Stress score
                    </Text>
                    <View className="flex-row items-center">

                        <View className="flex-1 ml-5">
                            <Text className="text-lg font-semibold text-primary-light mb-1">
                                {stressData.score + '  ' + stressData.level}
                            </Text>
                            <Text className="text-sm text-secondary leading-5">
                                {stressData.description}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Metrics Grid */}
                <View className="gap-3 mb-6">
                    <View className="flex-row gap-3">
                        <Card {...stats[0]} />
                        <Card {...stats[1]} />
                    </View>
                    <View className="flex-row gap-3">
                        <Card {...stats[2]} />
                        <Card {...stats[3]} />
                    </View>
                    <View className="flex-row gap-3">
                        <Card {...stats[4]} />
                        <Card {...stats[5]} />
                    </View>
                </View>
            </ScrollView>
        </View>
  );
}
