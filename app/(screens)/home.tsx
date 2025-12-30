import Card from "@/components/card";
import {ScrollView, Text, TouchableOpacity, View} from "react-native";
import PatternAlertCard from "@/components/patternAlertCard";
import {useFocusEffect, Redirect, useRouter} from "expo-router";
import {HealthData} from '@/interfaces/Types';
import {StressCalculator} from "@/utils/StressCalculator";
import {useHealthService} from "@/hooks/useHealthService";
import React, {useCallback, useState} from "react";
import {StressCalculation} from "@/interfaces/StressTypesProps";
import {getCheckInService} from "@/hooks/useCheckInService";
import {localCheckInService} from "@/utils/localCheckInService";
import { useAuth } from "@/utils/AuthContext";

export default function Home() {
    const router = useRouter();
    const { hasCompletedOnboarding, isLoggedIn} = useAuth();

    // Health service hook
    const { service, status, isRealData } = useHealthService();

    // State for stress calculation and health data
    const [stressResult, setStressResult] = useState<StressCalculation | null>(null);
    const [healthData, setHealthData] = useState<HealthData | null>(null);
    const [lastCheckInDate, setLastCheckInDate] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useFocusEffect(
        useCallback(() => {
            if (status !== 'loading') {
                loadData();
            }
        }, [status, isRealData])
    );

    const loadData = async () => {
        try {
            setIsLoading(true);

            // Get today's health data
            const dailyHealth = await service.getLatestHealthData();
            setHealthData(dailyHealth);

            console.log('Home Page Data Load');
            console.log('Health Data Source:', isRealData ? 'Health Connect' : 'Mock Data');

            // Get the latest check-in (regardless of date)
            const checkInService = getCheckInService();
            const latestCheckIn = await checkInService.getLatestCheckIn();

            if (latestCheckIn) {
                // Get all stored stress scores and find the latest one
                const allScores = await localCheckInService.getAllStressScores();
                const dates = Object.keys(allScores).sort().reverse();

                if (dates.length > 0) {
                    // Use the most recent stress score
                    const latestDate = dates[0];
                    const latestScore = allScores[latestDate];

                    console.log('Using saved stress score from:', latestDate);
                    setStressResult(latestScore);
                    setLastCheckInDate(latestDate);
                } else {
                    // Check-in exists but no saved score
                    console.log('Calculating stress from latest check-in...');
                    const result = StressCalculator.calculate(latestCheckIn, dailyHealth);
                    setStressResult(result);
                    setLastCheckInDate(null);
                }
            } else {
                // No check-ins at all
                console.log('No check-ins found');
                setLastCheckInDate(null);

                // Check if we have any health data to display
                const hasHealthData = dailyHealth.dataCompleteness !== 'minimal' ||
                    dailyHealth.sleep !== null ||
                    dailyHealth.heartRate !== null ||
                    dailyHealth.hrv !== null ||
                    dailyHealth.activity !== null;

                if (hasHealthData) {
                    // Calculate objective-only stress result from health data
                    console.log('Calculating objective stress from health data only...');
                    const objectiveResult = StressCalculator.calculateObjectiveOnly(dailyHealth);
                    setStressResult(objectiveResult);
                } else {
                    setStressResult(null);
                }
            }
        } catch (error) {
            console.error('Error loading health data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (!hasCompletedOnboarding) {
        return <Redirect href="./(onboarding)/understandingStress" />;
    }

    if (!isLoggedIn) {
        return <Redirect href="./(onboarding)/login" />;
    }

    // Get stress level description
    const getStressDescription = (riskLevel: string) => {
        if (riskLevel === 'High') return 'High stress detected - take immediate action';
        if (riskLevel === 'Moderate') return 'Moderate stress - monitor closely';
        return 'Low stress - good management';
    };

    const getStressLevelText = (riskLevel: string) => {
        if (riskLevel === 'High') return 'High Stress';
        if (riskLevel === 'Moderate') return 'Moderate Stress';
        return 'Low Stress';
    };

    const getStressLevelColor = (riskLevel: string) => {
        if (riskLevel === 'High') return '#D4A574';
        if (riskLevel === 'Moderate') return '#7B9BA8';
        return '#5FA8A8';
    };

    const getWorryTimeLabel = (score: number) => {
        if (score >= 25) return 'High';
        if (score >= 15) return 'Mid';
        return 'Low';
    };

    const getThreatLabel = (score: number) => {
        if (score >= 25) return 'High';
        if (score >= 15) return 'Mid';
        return 'Low';
    };

    const formatSleepDuration = (hours: number): string => {
        const h = Math.floor(hours);
        const m = Math.round((hours - h) * 60);
        return m === 0 ? `${h}h` : `${h}h ${m}m`;
    };

    const getSleepDisplay = (): string => {
        if (!healthData?.sleep) return '--';
        if (healthData.sleep.totalDurationHours === 0) return '--';
        return formatSleepDuration(healthData.sleep.totalDurationHours);
    };

    const getSleepQualityColor = (): string => {
        if (!healthData?.sleep) return 'text-[#7B9BA8]';
        if (healthData.sleep.totalDurationHours === 0) return 'text-[#7B9BA8]';
        const efficiency = healthData.sleep.sleepEfficiency;
        if (efficiency >= 85) return 'text-[#5FA8A8]';
        if (efficiency >= 70) return 'text-[#7B9BA8]';
        return 'text-[#D4A574]';
    };

    const getHrvDisplay = (): string => {
        if (!healthData?.hrv || healthData.hrv.interval === 0) return '--';
        return `${healthData.hrv.interval} ms`;
    };

    const getHrvColor = (): string => {
        if (!healthData?.hrv || healthData.hrv.interval === 0) return 'text-[#7B9BA8]';
        const hrv = healthData.hrv.interval;
        if (hrv >= 60) return 'text-[#5FA8A8]';   // Good recovery
        if (hrv >= 40) return 'text-[#7B9BA8]';   // Moderate
        return 'text-[#D4A574]';                   // High stress
    };

    const getStepsDisplay = (): string => {
        if (!healthData?.activity) return '--';
        const steps = healthData.activity.steps;
        if (steps === 0) return '--';
        if (steps >= 1000) return `${(steps / 1000).toFixed(1)}k`;
        return steps.toString();
    };

    const getActivityColor = (): string => {
        if (!healthData?.activity) return 'text-[#7B9BA8]';
        if (healthData.activity.steps === 0) return 'text-[#7B9BA8]';
        const steps = healthData.activity.steps;
        if (steps >= 8000) return 'text-[#5FA8A8]';
        if (steps >= 5000) return 'text-[#7B9BA8]';
        return 'text-[#D4A574]';
    };

    const getRestingHrDisplay = (): string => {
        if (!healthData?.heartRate) return '--';
        if (healthData.heartRate.restingBpm === 0) return '--';
        return healthData.heartRate.restingBpm.toString();
    };

    const getDataSourceDisplay = () => {
        if (status === 'available') {
            return '📱 Health Connect';
        }
        if (status === 'mock') {
            return '📱 Demo Data (iOS)';
        }
        return '📱 Demo Data';
    };

    const patternData = {
        type: stressResult?.problemB.score && stressResult.problemB.score > stressResult.problemA.score + 20
            ? 'warning' as const
            : 'positive' as const,
        message: stressResult?.insights[1] || 'Keep up the good work with stress management',
    };

    const stats = stressResult ? [
        { value: getWorryTimeLabel(stressResult.problemB.components.worryTime), label: 'WORRY TIME', textColor: stressResult.problemB.components.worryTime >= 20 ? 'text-[#D4A574]' : 'text-[#7B9BA8]' },
        { value: getThreatLabel(stressResult.problemB.components.threatMonitoring), label: 'THREAT MONITORING', textColor: stressResult.problemB.components.threatMonitoring >= 20 ? 'text-[#D4A574]' : 'text-[#5FA8A8]' },
        { value: getSleepDisplay(), label: 'SLEEP', textColor: getSleepQualityColor() },
        { value: getHrvDisplay(), label: 'HRV', textColor: getHrvColor() },
        { value: stressResult.riskLevel === 'High' ? 'Chronic' : 'Acute', label: 'STRESS TYPE', textColor: stressResult.riskLevel === 'High' ? 'text-[#D4A574]' : 'text-[#5FA8A8]' },
        { value: stressResult.riskLevel, label: 'BURNOUT RISK', textColor: stressResult.riskLevel === 'High' ? 'text-[#D4A574]' : stressResult.riskLevel === 'Moderate' ? 'text-[#7B9BA8]' : 'text-[#5FA8A8]' },
    ] : [
        { value: '--', label: 'WORRY TIME', textColor: 'text-[#7B9BA8]' },
        { value: '--', label: 'THREAT MONITORING', textColor: 'text-[#7B9BA8]' },
        { value: getSleepDisplay(), label: 'SLEEP', textColor: 'text-[#7B9BA8]' },
        { value: getHrvDisplay(), label: 'HRV', textColor: 'text-[#7B9BA8]' },
        { value: '--', label: 'STRESS TYPE', textColor: 'text-[#7B9BA8]' },
        { value: '--', label: 'BURNOUT RISK', textColor: 'text-[#7B9BA8]' },
    ];

    const handleCheckIn = () => {
        router.push('/(screens)/log');
    };

    return (
        <View className="flex-1 bg-background pt-12">
            <View className="mt-4 mb-5 px-[3%]">
                <Text className="text-sm text-secondary mb-1">
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </Text>
                <Text className="text-3xl font-black text-secondary-dark">
                    Today&#39;s Overview
                </Text>
            </View>

            <ScrollView
                className="flex-1 px-[3%]"
                showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
                {/*Stress score*/}
                {stressResult  && (
                    <View className={`bg-white rounded-xl p-5 mb-4 border-2 border-[${getStressLevelColor(stressResult.riskLevel)}]`}
                          style={{
                              shadowColor: '#000',
                              shadowOffset: { width: 0, height: 2 },
                              shadowOpacity: 0.1,
                              shadowRadius: 8,
                              elevation: 4,
                          }}
                    >
                        <Text className="text-[18px] font-semibold text-secondary-dark mb-4">
                            Stress Score
                        </Text>
                        <View className="flex-row items-center">
                            <View className={`w-28 h-28 rounded-full border-8 border-[${getStressLevelColor(stressResult.riskLevel)}] items-center justify-center`}>
                                <Text className={`text-2xl font-bold text-[${getStressLevelColor(stressResult.riskLevel)}]`}>
                                    {stressResult.stressScore}
                                </Text>
                            </View>

                            <View className="flex-1 ml-5">
                                <Text className={`text-2xl font-semibold mb-1 text-[${getStressLevelColor(stressResult.riskLevel)}]`}>
                                    {getStressLevelText(stressResult.riskLevel)}
                                </Text>
                                <Text className="text-sm text-secondary leading-5">
                                    {getStressDescription(stressResult.riskLevel)}
                                </Text>

                                {/* Confidence*/}
                                <View className="flex-row items-center mt-2">
                                    <View className={`w-2 h-2 rounded-full mr-2 ${
                                        stressResult.dataQuality === 'excellent' ? 'bg-green-500' :
                                            stressResult.dataQuality === 'good' ? 'bg-blue-500' : 'bg-orange-500'
                                    }`} />
                                    <Text className="text-sm text-secondary">
                                        {stressResult.confidence}% Confidence
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>
                )}

                {isLoading && (
                    <View className="bg-white rounded-xl p-5 mb-4 border border-[#D9D9D9] items-center justify-center">
                        <Text className="text-secondary">Loading your data...</Text>
                    </View>
                )}

                {!isLoading && !stressResult && (
                    <View className="bg-white rounded-xl p-5 mb-4 border border-[#D9D9D9]"
                          style={{
                              shadowColor: '#000',
                              shadowOffset: { width: 0, height: 2 },
                              shadowOpacity: 0.05,
                              shadowRadius: 8,
                              elevation: 2,
                          }}
                    >
                        <Text className="text-[18px] font-semibold text-secondary-dark mb-2">
                            No Stress Score Yet
                        </Text>
                        <Text className="text-sm text-secondary">
                            Complete your first check-in or connect to Health Connect to see your personalized stress score and insights.
                        </Text>
                        <TouchableOpacity
                            onPress={handleCheckIn}
                            className="bg-primary rounded-xl p-4"
                            style={{
                                shadowColor: '#2FB5B5',
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 0.3,
                                shadowRadius: 8,
                                elevation: 4,
                            }}
                        >
                            <Text className="text-white font-bold text-center">
                                Start Check-in
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}


                <PatternAlertCard type={patternData.type} message={patternData.message}/>
                {/* Metrics Grid */}
                <View className="gap-3 mb-5">
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

                {healthData && (
                    <View className="bg-white rounded-xl p-4 mb-4 border-2 border-[#D9D9D9]"
                          style={{
                              shadowColor: '#000',
                              shadowOffset: { width: 0, height: 2 },
                              shadowOpacity: 0.05,
                              shadowRadius: 8,
                              elevation: 2,
                          }}
                    >
                        <View className="flex-row justify-between items-center mb-3">
                            <Text className="text-sm font-semibold text-secondary-dark">
                                Health Metrics
                            </Text>
                            <Text className="text-xs text-secondary">
                                {healthData.dataCompleteness === 'complete' ? '✓ All data' :
                                    healthData.dataCompleteness === 'partial' ? 'Partial' : 'Limited'}
                            </Text>
                        </View>

                        <View className="flex-row justify-between">
                            {/* Sleep */}
                            <View className="items-center flex-1">
                                <Text className="text-xs text-secondary-dark mb-1">Sleep</Text>
                                <Text className={`text-lg font-bold ${getSleepQualityColor()}`}>
                                    {getSleepDisplay()}
                                </Text>
                                {healthData.sleep && healthData.sleep.totalDurationHours > 0 && (
                                    <Text className="text-xs text-secondary">{healthData.sleep.sleepEfficiency}%</Text>
                                )}
                            </View>

                            <View className="items-center flex-1">
                                <Text className="text-xs text-secondary-dark mb-1">HRV</Text>
                                <Text className={`text-lg font-bold ${getHrvColor()}`}>
                                    {healthData.hrv?.interval || '--'}
                                </Text>
                                {healthData.hrv && healthData.hrv.interval > 0 && (
                                    <Text className="text-xs text-secondary">ms</Text>
                                )}
                            </View>

                            <View className="items-center flex-1">
                                <Text className="text-xs text-secondary-dark mb-1">Resting HR</Text>
                                <Text className="text-lg font-bold text-secondary-dark">
                                    {getRestingHrDisplay()}
                                </Text>
                                {healthData.heartRate && healthData.heartRate.restingBpm > 0 && (
                                    <Text className="text-xs text-secondary">bpm</Text>
                                )}
                            </View>

                            <View className="items-center flex-1">
                                <Text className="text-xs text-secondary-dark mb-1">Steps</Text>
                                <Text className={`text-lg font-bold ${getActivityColor()}`}>
                                    {getStepsDisplay()}
                                </Text>
                                {healthData.activity && healthData.activity.steps > 0 && (
                                    <Text className="text-xs text-secondary">today</Text>
                                )}
                            </View>
                        </View>

                        <View className="mt-3 pt-2 border-t border-[#D9D9D9]">
                            <Text className="text-xs text-secondary text-center">
                                {getDataSourceDisplay()}
                            </Text>
                            {status === 'available' && healthData.dataCompleteness === 'minimal' && (
                                <Text className="text-xs text-secondary text-center mt-1">
                                    No health data recorded yet
                                </Text>
                            )}
                        </View>
                    </View>
                )}

                {stressResult && stressResult.insights.length > 0 && (
                    <View className="bg-white rounded-xl p-5 mb-6 border border-[#D9D9D9]">
                        <Text className="text-base font-bold text-secondary-dark mb-3">
                            Today&#39;s Insights
                        </Text>
                        {stressResult.insights.slice(0, 3).map((insight, index) => (
                            <View key={index} className="flex-row mb-3">
                                <View
                                    className="w-2 h-2 rounded-full mt-1.5 mr-3 bg-primary"
                                />
                                <Text className="text-sm text-secondary-dark flex-1 leading-relaxed">
                                    {insight}
                                </Text>
                            </View>
                        ))}
                    </View>
                )}

                <View className="h-6" />
            </ScrollView>
        </View>
  );
}
