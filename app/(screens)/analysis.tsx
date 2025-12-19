import {View, Text, ScrollView} from "react-native";
import React from "react";
import WeeklyStressChart from "@/components/analysis/weeklyStressChart";
import PredictionCard from "@/components/analysis/predictionCard";
import BreakSuggestionCard from "@/components/analysis/breakSuggestionCard";

const Analysis = () => {

    const weeklyData = [
        {day: 'M', value: 75, label: 'Mon'},
        {day: 'T', value: 45, label: 'Tue'},
        {day: 'W', value: 35, label: 'Wed'},
        {day: 'T', value: 55, label: 'Thu'},
        {day: 'F', value: 25, label: 'Fri'},
        {day: 'S', value: 30, label: 'Sat'},
        {day: 'S', value: 40, label: 'Sun'}
    ];

    const predictionData = {
        riskLevel: 'Medium Risk' as 'Low Risk' | 'Medium Risk' | 'High Risk',
        pattern: 'Highest stress on Monday',
        actions: ['Prioritize 8 hours of sleep tonight', 'Break Recommended'],
    };

    const breakSuggestion = {
        title: 'Add Two Break Tomorrow',
        times: ['11:00 am', '14:00 pm'],
    };

    const handleAcceptBreak = () => {
        // TODO: Save break to calendar/schedule
        console.log('Break accepted');
    };

    const handleDeclineBreak = () => {
        // TODO: Dismiss suggestion
        console.log('Break declined');
    };

    return (
        <View className="flex-1 bg-background pt-[12%] px-[3%]">
            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 45}}
            >
                <Text className="text-3xl font-black text-secondary-dark mt-4 mb-5">
                    Analysis
                </Text>

                <View className="mb-6">
                    <WeeklyStressChart data={weeklyData} />
                </View>

                <View className="mb-6">
                    <PredictionCard
                        riskLevel={predictionData.riskLevel}
                        pattern={predictionData.pattern}
                        actions={predictionData.actions}
                    />
                </View>

                <View className="mb-6">
                    <BreakSuggestionCard
                        title={breakSuggestion.title}
                        times={breakSuggestion.times}
                        onAccept={handleAcceptBreak}
                        onDecline={handleDeclineBreak}
                    />
                </View>

                <View className="mb-6">
                    <Text className="text-xl font-bold text-secondary-dark mb-4">
                        Trends
                    </Text>

                </View>
            </ScrollView>
        </View>
    );
};

export default Analysis;