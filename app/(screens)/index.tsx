import Card from "@/app/components/card";
import {ScrollView, Text, View} from "react-native";

export default function Index() {

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
