import Card from "@/components/card";
import {ScrollView, Text, View} from "react-native";
import PatternAlertCard from "@/components/patternAlertCard";
import {Redirect} from "expo-router";
import {HealthData, CheckInData} from '@/interfaces/Types'
import {StressCalculator} from "@/utils/StressCalculator";
import {healthDataService} from "@/utils/mockHealthDataGenerator";
import React, {useEffect, useState} from "react";
import {StressCalculation} from "@/interfaces/StressTypesProps";

export default function Index() {
    // TODO: Check if user is logged in and has completed onboarding
    const hasCompletedOnboarding = true;
    const isLoggedIn = true;

    // State for stress calculation and health data
    const [stressResult, setStressResult] = useState<StressCalculation | null>(null);
    const [healthData, setHealthData] = useState<HealthData | null>(null);

    useEffect(() => {
        loadHealthData();
    }, []);

    const loadHealthData = async () => {
        try {
            // Get health data from service
            const dailyHealth = await healthDataService.getLatestHealthData();
            setHealthData(dailyHealth);

            // TODO: Load latest check-in from AsyncStorage/backend
            // For now, use mock data
            const mockCheckIn: CheckInData = {
                type: 'daily',
                mood: 'neutral',
                worryTime: 'moderate',
                threatMonitoring: 'minimal',
                jobDemand: {
                    workloadToday: 'Moderate',
                    controlOverTasks: 'High',
                    socialSupport: 'High',
                },
                coping: {
                    avoidedSituations: 'Rarely',
                    avoidingThoughts: 'Moderate',
                    alcoholPills: 'Never',
                    soughtReassurance: 'Rarely',
                    controlledMyEmotions: 'Often',
                    monitorMySymptoms: 'Rarely',
                },
                symptoms: {
                    symptoms: ['focusIssues'],
                    notes: 'Feeling okay',
                },
            };

            // Calculate stress with MCT Problem A/B
            const result = StressCalculator.calculate(mockCheckIn, dailyHealth);
            setStressResult(result);

            console.log('=== Home Page Stress Calculation ===');
            console.log('Final Score:', result.stressScore);
            console.log('Problem A:', result.problemA.score);
            console.log('Problem B:', result.problemB.score);
            console.log('Risk Level:', result.riskLevel);
            console.log('');
            console.log('=== Health Data ===');
            console.log('Sleep:', dailyHealth.sleep?.totalDurationHours, 'h');
            console.log('Sleep Efficiency:', dailyHealth.sleep?.sleepEfficiency, '%');
            console.log('Deep Sleep:', dailyHealth.sleep?.deepSleepMinutes, 'min');
            console.log('REM Sleep:', dailyHealth.sleep?.remSleepMinutes, 'min');
            console.log('HRV:', dailyHealth.hrv?.interval, 'ms');
            console.log('Resting HR:', dailyHealth.heartRate?.restingBpm, 'bpm');
            console.log('Steps:', dailyHealth.activity?.steps);
        } catch (error) {
            console.error('Error loading health data:', error);
        }
    };

    if (!hasCompletedOnboarding) {
        return <Redirect href="./(onboarding)/understandingStress" />;
    }

    if (!isLoggedIn) {
        return <Redirect href="./(onboarding)/login" />;
    }

    // Get stress level description
    const getStressDescription = (score: number, riskLevel: string) => {
        if (riskLevel === 'High') {
            return 'High stress detected - take immediate action';
        } else if (riskLevel === 'Moderate') {
            return 'Moderate stress - monitor closely';
        } else {
            return 'Low stress - good management';
        }
    };

    // Get stress level text
    const getStressLevelText = (riskLevel: string) => {
        if (riskLevel === 'High') return 'High Stress';
        if (riskLevel === 'Moderate') return 'Moderate Stress';
        return 'Low Stress';
    };

    // Get worry time label
    const getWorryTimeLabel = (score: number) => {
        if (score >= 25) return 'High';
        if (score >= 15) return 'Mid';
        return 'Low';
    };

    // Get threat monitoring label
    const getThreatLabel = (score: number) => {
        if (score >= 25) return 'High';
        if (score >= 15) return 'Mid';
        return 'Low';
    };

    // Format sleep duration from health data
    const getSleepDisplay = (): string => {
        if (healthData?.sleep) {
            const h = Math.floor(healthData.sleep.totalDurationHours);
            const m = Math.round((healthData.sleep.totalDurationHours - h) * 60);

            if (m === 0) {
                return `${h}h`;
            }
            return `${h}h ${m}m`;
        }
        return '--';
    };

    // Get sleep quality indicator
    const getSleepQualityColor = (): string => {
        if (!healthData?.sleep) return 'text-[#7B9BA8]';
        const efficiency = healthData.sleep.sleepEfficiency;
        if (efficiency >= 85) return 'text-[#5FA8A8]';  // Good
        if (efficiency >= 70) return 'text-[#7B9BA8]';  // Moderate
        return 'text-[#D4A574]';  // Poor
    };

    // Get HRV display
    const getHrvDisplay = (): string => {
        if (healthData?.hrv) {
            return `${healthData.hrv.interval} ms`;
        }
        return '--';
    };

    // Get HRV color indicator
    const getHrvColor = (): string => {
        if (!healthData?.hrv) return 'text-[#7B9BA8]';
        const hrv = healthData.hrv.interval;
        if (hrv >= 60) return 'text-[#5FA8A8]';   // Good recovery
        if (hrv >= 40) return 'text-[#7B9BA8]';   // Moderate
        return 'text-[#D4A574]';                   // High stress
    };

    // Get steps display
    const getStepsDisplay = (): string => {
        if (healthData?.activity) {
            const steps = healthData.activity.steps;
            if (steps >= 1000) {
                return `${(steps / 1000).toFixed(1)}k`;
            }
            return steps.toString();
        }
        return '--';
    };

    // Get activity color
    const getActivityColor = (): string => {
        if (!healthData?.activity) return 'text-[#7B9BA8]';
        const steps = healthData.activity.steps;
        if (steps >= 8000) return 'text-[#5FA8A8]';   // Great
        if (steps >= 5000) return 'text-[#7B9BA8]';   // Moderate
        return 'text-[#D4A574]';                       // Low
    };

    // Pattern data - could be generated from insights
    const patternData = {
        type: stressResult?.problemB.score && stressResult.problemB.score > stressResult.problemA.score + 20
            ? 'warning' as const
            : 'positive' as const,
        message: stressResult?.insights[1] || 'Keep up the good work with stress management',
    };

    // Stats from calculation + health data
    const stats = stressResult ? [
        {
            value: getWorryTimeLabel(stressResult.problemB.components.worryTime),
            label: 'WORRY TIME',
            textColor: stressResult.problemB.components.worryTime >= 20 ? 'text-[#D4A574]' : 'text-[#7B9BA8]'
        },
        {
            value: getThreatLabel(stressResult.problemB.components.threatMonitoring),
            label: 'THREAT MONITORING',
            textColor: stressResult.problemB.components.threatMonitoring >= 20 ? 'text-[#D4A574]' : 'text-[#5FA8A8]'
        },
        {
            value: getSleepDisplay(),
            label: 'SLEEP',
            textColor: getSleepQualityColor()
        },
        {
            value: getHrvDisplay(),
            label: 'HRV',
            textColor: getHrvColor()
        },
        {
            value: stressResult.riskLevel === 'High' ? 'Chronic' : 'Acute',
            label: 'STRESS TYPE',
            textColor: stressResult.riskLevel === 'High' ? 'text-[#D4A574]' : 'text-[#5FA8A8]'
        },
        {
            value: stressResult.riskLevel,
            label: 'BURNOUT RISK',
            textColor: stressResult.riskLevel === 'High' ? 'text-[#D4A574]' :
                stressResult.riskLevel === 'Moderate' ? 'text-[#7B9BA8]' : 'text-[#5FA8A8]'
        },
    ] : [
        { value: '--', label: 'WORRY TIME', textColor: 'text-[#7B9BA8]'},
        { value: '--', label: 'THREAT MONITORING', textColor: 'text-[#7B9BA8]'},
        { value: getSleepDisplay(), label: 'SLEEP', textColor: getSleepQualityColor()},
        { value: getHrvDisplay(), label: 'HRV', textColor: getHrvColor()},
        { value: '--', label: 'STRESS TYPE', textColor: 'text-[#7B9BA8]'},
        { value: '--', label: 'BURNOUT RISK', textColor: 'text-[#7B9BA8]'},
    ];

    return (
        <View className="flex-1 bg-background pt-12">
            <View className="mt-4 mb-5 px-4">
                <Text className="text-sm text-secondary mb-1">
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </Text>
                <Text className="text-3xl font-black text-secondary-dark">
                    Today&#39;s Overview
                </Text>
            </View>

            <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
                {/*Stress score*/}
                {stressResult && (
                    <View className="bg-background-dark rounded-xl p-5 mb-4 border border-[#D9D9D9]">
                        <Text className="text-[18px] font-semibold text-secondary-dark mb-4">
                            Stress Score
                        </Text>
                        <View className="flex-row items-center">
                            <View className="w-24 h-24 rounded-full border-8 border-primary items-center justify-center">
                                <Text className="text-2xl font-bold text-primary">
                                    {stressResult.stressScore}
                                </Text>
                            </View>

                            <View className="flex-1 ml-5">
                                <Text className="text-2xl font-semibold text-primary mb-1">
                                    {stressResult.stressScore}  {getStressLevelText(stressResult.riskLevel)}
                                </Text>
                                <Text className="text-sm text-secondary leading-5">
                                    {getStressDescription(stressResult.stressScore, stressResult.riskLevel)}
                                </Text>

                                {/* Confidence*/}
                                <View className="flex-row items-center mt-2">
                                    <View className={`w-2 h-2 rounded-full mr-2 ${
                                        stressResult.dataQuality === 'excellent' ? 'bg-green-500' :
                                            stressResult.dataQuality === 'good' ? 'bg-blue-500' :
                                                'bg-orange-500'
                                    }`} />
                                    <Text className="text-sm text-secondary">
                                        {stressResult.confidence}% Confidence • {stressResult.dataQuality}
                                    </Text>
                                </View>
                            </View>
                        </View>
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
                    <View className="bg-background-dark rounded-xl p-4 mb-4 border border-[#D9D9D9]">
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
                                {healthData.sleep && (
                                    <Text className="text-xs text-secondary">
                                        {healthData.sleep.sleepEfficiency}%
                                    </Text>
                                )}
                            </View>

                            <View className="items-center flex-1">
                                <Text className="text-xs text-secondary-dark mb-1">HRV</Text>
                                <Text className={`text-lg font-bold ${getHrvColor()}`}>
                                    {healthData.hrv?.interval || '--'}
                                </Text>
                                <Text className="text-xs text-secondary">ms</Text>
                            </View>

                            <View className="items-center flex-1">
                                <Text className="text-xs text-secondary-dark mb-1">Resting HR</Text>
                                <Text className="text-lg font-bold text-secondary-dark">
                                    {healthData.heartRate?.restingBpm || '--'}
                                </Text>
                                <Text className="text-xs text-secondary">bpm</Text>
                            </View>

                            <View className="items-center flex-1">
                                <Text className="text-xs text-secondary-dark mb-1">Steps</Text>
                                <Text className={`text-lg font-bold ${getActivityColor()}`}>
                                    {getStepsDisplay()}
                                </Text>
                                <Text className="text-xs text-secondary">today</Text>
                            </View>
                        </View>

                        <View className="mt-3 pt-2 border-t border-[#D9D9D9]">
                            <Text className="text-xs text-secondary text-center">
                                📱 {healthData.sources[0]?.name || 'Unknown source'}
                            </Text>
                        </View>
                    </View>
                )}

                {stressResult && stressResult.insights.length > 0 && (
                    <View className="bg-white rounded-xl p-5 mb-6 border border-[#D9D9D9]">
                        <Text className="text-base font-bold text-secondary-dark mb-3">
                            Today&#39;s Insights
                        </Text>
                        {stressResult.insights.slice(0, 3).map((insight, index) => (
                            <View key={index} className="flex-row mb-2">
                                <Text className="text-primary mr-2">-</Text>
                                <Text className="text-sm text-secondary-dark flex-1">
                                    {insight}
                                </Text>
                            </View>
                        ))}
                    </View>
                )}
            </ScrollView>
        </View>
  );
}
