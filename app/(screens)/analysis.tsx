import {View, Text, ScrollView} from "react-native";
import React, {useEffect, useState} from "react";
import WeeklyStressChart from "@/components/analysis/weeklyStressChart";
import PredictionCard from "@/components/analysis/predictionCard";
import BreakSuggestionCard from "@/components/analysis/breakSuggestionCard";
import {StressComparisonCard, MostStressfulDayCard, SleepImpactCard, StressTriggersCard, WeeklySummaryCard} from "@/components/analysis/trendCards";
import {healthDataService} from "@/utils/mockHealthDataGenerator";
import {StressCalculator} from "@/utils/StressCalculator";
import {HealthData, CheckInData} from "@/interfaces/Types";
import {StressCalculation} from "@/interfaces/StressTypesProps";

interface DailyStressData {
    day: string;
    value: number;
    label: string;
    date: string;
    healthData: HealthData;
    stressResult: StressCalculation;
}

interface ProblemStats {
    avgProblemA: number;
    avgProblemB: number;
    avgMood: number;
    avgJobDemands: number;
    avgSymptoms: number;
    avgWorryTime: number;
    avgThreatMonitoring: number;
    avgHarmfulCoping: number;
    avgWorryEnergy: number;
    dominantProblem: 'A' | 'B' | 'balanced';
}

interface SleepImpactData {
    label: string;
    stressLevel: number;
}

interface StressTrigger {
    trigger: string;
    count: number;
}

const Analysis = () => {
    const [weeklyData, setWeeklyData] = useState<DailyStressData[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [weeklyStats, setWeeklyStats] = useState({
        averageStress: 0,
        highestDay: '',
        highestDayStress: 0,
        lowestDay: '',
        trend: 'stable' as 'improving' | 'worsening' | 'stable',
        averageSleep: 0,
        averageHrv: 0,
        highStressDays: 0,
        lastWeekAverage: 0, // Simulated last week for comparison
    });

    const [problemStats, setProblemStats] = useState<ProblemStats>({
        avgProblemA: 0,
        avgProblemB: 0,
        avgMood: 0,
        avgJobDemands: 0,
        avgSymptoms: 0,
        avgWorryTime: 0,
        avgThreatMonitoring: 0,
        avgHarmfulCoping: 0,
        avgWorryEnergy: 0,
        dominantProblem: 'balanced',
    });

    const [sleepImpactData, setSleepImpactData] = useState<SleepImpactData[]>([]);
    const [stressTriggers, setStressTriggers] = useState<StressTrigger[]>([]);

    useEffect(() => {
        loadWeeklyData();
    }, []);

    const loadWeeklyData = async () => {
        try {
            setIsLoading(true);

            // Get dates for the past 7 days
            const dates = getLastSevenDays();
            const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            const dayShort = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

            // Generate health data and calculate stress for each day
            const weekData: DailyStressData[] = [];

            for (const date of dates) {
                const healthData = await healthDataService.getHealthDataForDate(date);

                // Generate mock check-in that varies by day
                const mockCheckIn = generateMockCheckInForDate(date);

                // Calculate stress
                const stressResult = StressCalculator.calculate(mockCheckIn, healthData);

                const dayOfWeek = new Date(date).getDay();

                weekData.push({
                    day: dayShort[dayOfWeek],
                    value: stressResult.stressScore,
                    label: dayLabels[dayOfWeek],
                    date: date,
                    healthData: healthData,
                    stressResult: stressResult,
                });
            }

            setWeeklyData(weekData);

            // Calculate all statistics
            calculateWeeklyStats(weekData);
            calculateSleepImpact(weekData);
            calculateStressTriggers(weekData);

            console.log('=== Weekly Analysis Data ===');
            weekData.forEach(d => {
                console.log(`${d.label}: Stress=${d.value}, Sleep=${d.healthData.sleep?.totalDurationHours}h, HRV=${d.healthData.hrv?.interval}ms`);
            });

        } catch (error) {
            console.error('Error loading weekly data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getLastSevenDays = (): string[] => {
        const dates: string[] = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            dates.push(date.toISOString().split('T')[0]);
        }
        return dates;
    };

    // Generate varied check-in data based on day of week
    const generateMockCheckInForDate = (date: string): CheckInData => {
        const dayOfWeek = new Date(date).getDay();
        
        const stressPatterns: Record<number, Partial<CheckInData>> = {
            0: { mood: 'neutral', worryTime: 'moderate', threatMonitoring: 'minimal' },      // Sunday
            1: { mood: 'overwhelmed', worryTime: 'significant', threatMonitoring: 'significant' }, // Monday
            2: { mood: 'drained', worryTime: 'moderate', threatMonitoring: 'moderate' },    // Tuesday
            3: { mood: 'neutral', worryTime: 'moderate', threatMonitoring: 'minimal' },      // Wednesday
            4: { mood: 'neutral', worryTime: 'minimal', threatMonitoring: 'minimal' },       // Thursday
            5: { mood: 'energized', worryTime: 'minimal', threatMonitoring: 'minimal' },     // Friday
            6: { mood: 'energized', worryTime: 'minimal', threatMonitoring: 'minimal' },     // Saturday
        };

        const pattern = stressPatterns[dayOfWeek] || stressPatterns[0];

        return {
            type: 'daily',
            mood: pattern.mood || 'neutral',
            worryTime: pattern.worryTime || 'moderate',
            threatMonitoring: pattern.threatMonitoring || 'minimal',
            jobDemand: {
                workloadToday: dayOfWeek === 1 ? 'High' : 'Moderate',
                controlOverTasks: dayOfWeek === 1 ? 'Low' : 'High',
                socialSupport: 'Moderate',
            },
            coping: {
                avoidedSituations: 'Rarely',
                avoidingThoughts: dayOfWeek === 1 ? 'Often' : 'Rarely',
                alcoholPills: 'Never',
                soughtReassurance: 'Rarely',
                controlledMyEmotions: 'Moderate',
                monitorMySymptoms: 'Rarely',
            },
            symptoms: {
                symptoms: dayOfWeek === 1 ? ['fatigue', 'tension'] : [],
                notes: '',
            },
        };
    };

    const calculateWeeklyStats = (data: DailyStressData[]) => {
        if (data.length === 0) return;

        const stressValues = data.map(d => d.value);
        const avgStress = Math.round(stressValues.reduce((a, b) => a + b, 0) / stressValues.length);

        const maxStress = Math.max(...stressValues);
        const minStress = Math.min(...stressValues);

        const highestDayData = data.find(d => d.value === maxStress);
        const highestDay = highestDayData?.label || '';
        const highestDayStress = highestDayData?.value || 0;
        const lowestDay = data.find(d => d.value === minStress)?.label || '';

        // Count high stress days (>= 60)
        const highStressDays = data.filter(d => d.value >= 60).length;

        // Calculate trend (compare first half to second half of week)
        const firstHalf = stressValues.slice(0, 3).reduce((a, b) => a + b, 0) / 3;
        const secondHalf = stressValues.slice(4).reduce((a, b) => a + b, 0) / 3;

        let trend: 'improving' | 'worsening' | 'stable' = 'stable';
        if (secondHalf < firstHalf - 10) trend = 'improving';
        else if (secondHalf > firstHalf + 10) trend = 'worsening';

        // Calculate average sleep and HRV
        const sleepValues = data
            .map(d => d.healthData.sleep?.totalDurationHours || 0)
            .filter(v => v > 0);
        const avgSleep = sleepValues.length > 0
            ? sleepValues.reduce((a, b) => a + b, 0) / sleepValues.length
            : 0;

        const hrvValues = data
            .map(d => d.healthData.hrv?.interval || 0)
            .filter(v => v > 0);
        const avgHrv = hrvValues.length > 0
            ? Math.round(hrvValues.reduce((a, b) => a + b, 0) / hrvValues.length)
            : 0;

        // Simulate last week average (slightly higher for demo)
        const lastWeekAverage = Math.min(100, avgStress + Math.round(Math.random() * 15) + 5);

        setWeeklyStats({
            averageStress: avgStress,
            highestDay,
            highestDayStress,
            lowestDay,
            trend,
            averageSleep: Math.round(avgSleep * 10) / 10,
            averageHrv: avgHrv,
            highStressDays,
            lastWeekAverage,
        });

        // Calculate Problem A/B statistics
        calculateProblemStats(data);
    };

    const calculateProblemStats = (data: DailyStressData[]) => {
        if (data.length === 0) return;

        const n = data.length;

        // Problem A components
        const avgProblemA = Math.round(data.reduce((sum, d) => sum + d.stressResult.problemA.score, 0) / n);
        const avgMood = Math.round(data.reduce((sum, d) => sum + d.stressResult.problemA.components.mood, 0) / n);
        const avgJobDemands = Math.round(data.reduce((sum, d) => sum + d.stressResult.problemA.components.jobDemands, 0) / n);
        const avgSymptoms = Math.round(data.reduce((sum, d) => sum + d.stressResult.problemA.components.symptoms, 0) / n);

        // Problem B components
        const avgProblemB = Math.round(data.reduce((sum, d) => sum + d.stressResult.problemB.score, 0) / n);
        const avgWorryTime = Math.round(data.reduce((sum, d) => sum + d.stressResult.problemB.components.worryTime, 0) / n);
        const avgThreatMonitoring = Math.round(data.reduce((sum, d) => sum + d.stressResult.problemB.components.threatMonitoring, 0) / n);
        const avgHarmfulCoping = Math.round(data.reduce((sum, d) => sum + d.stressResult.problemB.components.harmfulCoping, 0) / n);
        const avgWorryEnergy = Math.round(data.reduce((sum, d) => sum + d.stressResult.problemB.components.worryEnergy, 0) / n);

        // Determine dominant problem
        let dominantProblem: 'A' | 'B' | 'balanced' = 'balanced';
        if (avgProblemB > avgProblemA + 15) {
            dominantProblem = 'B';
        } else if (avgProblemA > avgProblemB + 15) {
            dominantProblem = 'A';
        }

        setProblemStats({avgProblemA, avgProblemB, avgMood, avgJobDemands, avgSymptoms, avgWorryTime, avgThreatMonitoring, avgHarmfulCoping, avgWorryEnergy, dominantProblem,});

        console.log('Problem A/B Stats:');
        console.log('Problem A:', avgProblemA, '(Mood:', avgMood, 'Jobs:', avgJobDemands, 'Symptoms:', avgSymptoms, ')');
        console.log('Problem B:', avgProblemB, '(Worry:', avgWorryTime, 'Threat:', avgThreatMonitoring, 'Coping:', avgHarmfulCoping, ')');
        console.log('Dominant:', dominantProblem);
    };

    const calculateSleepImpact = (data: DailyStressData[]) => {
        // Group by sleep duration and calculate average stress
        const shortSleep = data.filter(d => (d.healthData.sleep?.totalDurationHours || 0) < 6);
        const mediumSleep = data.filter(d => {
            const hours = d.healthData.sleep?.totalDurationHours || 0;
            return hours >= 6 && hours < 8;
        });
        const longSleep = data.filter(d => (d.healthData.sleep?.totalDurationHours || 0) >= 8);

        const avgStress = (arr: DailyStressData[]) =>
            arr.length > 0 ? Math.round(arr.reduce((sum, d) => sum + d.value, 0) / arr.length) : 0;

        setSleepImpactData([
            { label: '<6 hours sleep', stressLevel: avgStress(shortSleep) || 75 },
            { label: '6-8 hours sleep', stressLevel: avgStress(mediumSleep) || 50 },
            { label: '8+ hours sleep', stressLevel: avgStress(longSleep) || 35 },
        ]);
    };

    const calculateStressTriggers = (data: DailyStressData[]) => {
        // Count triggers based on high scores in different components
        const triggers: Record<string, number> = {
            'Work deadlines': 0,
            'Poor sleep': 0,
            'Excessive worry': 0,
            'Low mood': 0,
            'Physical symptoms': 0,
        };

        data.forEach(d => {
            if (d.stressResult.problemA.components.jobDemands > 20) {
                triggers['Work deadlines']++;
            }
            if ((d.healthData.sleep?.totalDurationHours || 0) < 6) {
                triggers['Poor sleep']++;
            }
            if (d.stressResult.problemB.components.worryTime > 15) {
                triggers['Excessive worry']++;
            }
            if (d.stressResult.problemA.components.mood > 20) {
                triggers['Low mood']++;
            }
            if (d.stressResult.problemA.components.symptoms > 10) {
                triggers['Physical symptoms']++;
            }
        });

        // Convert to array and sort by count
        const sortedTriggers = Object.entries(triggers)
            .map(([trigger, count]) => ({ trigger, count }))
            .filter(t => t.count > 0)
            .sort((a, b) => b.count - a.count)
            .slice(0, 3);

        setStressTriggers(sortedTriggers);
    };


    const getPredictionData = () => {
        const avgStress = weeklyStats.averageStress;

        let riskLevel: 'Low Risk' | 'Medium Risk' | 'High Risk' = 'Low Risk';
        if (avgStress >= 60) riskLevel = 'High Risk';
        else if (avgStress >= 40) riskLevel = 'Medium Risk';

        const pattern = `Highest stress on ${weeklyStats.highestDay}`;

        const actions: string[] = [];
        if (weeklyStats.averageSleep < 7) {
            actions.push('Prioritize 8 hours of sleep tonight');
        }
        if (problemStats.avgWorryTime > 15) {
            actions.push('Schedule worry time for 15 minutes');
        }
        if (weeklyStats.averageHrv < 50) {
            actions.push('Try a breathing exercise');
        }
        if (problemStats.dominantProblem === 'B') {
            actions.push('Practice detached mindfulness');
        }
        if (actions.length === 0) {
            actions.push('Keep up the good work!');
        }

        return { riskLevel, pattern, actions };
    };
    //Basic Break Suggestion TODO: Future works - improve suggestion
    const getBreakSuggestion = () => {
        const avgStress = weeklyStats.averageStress;

        if (avgStress >= 60) {
            return {
                title: 'Add Three Breaks Tomorrow',
                times: ['10:00 am', '13:00 pm', '16:00 pm'],
            };
        } else if (avgStress >= 40) {
            return {
                title: 'Add Two Breaks Tomorrow',
                times: ['11:00 am', '14:00 pm'],
            };
        } else {
            return {
                title: 'Add One Break Tomorrow',
                times: ['12:00 pm'],
            };
        }
    };

    const handleAcceptBreak = () => {
        // TODO: Save break to calendar/schedule
        console.log('Break accepted');
    };

    const handleDeclineBreak = () => {
        // TODO: Dismiss suggestion
        console.log('Break declined');
    };

    const predictionData = getPredictionData();
    const breakSuggestion = getBreakSuggestion();

    const chartData = weeklyData.map(d => ({
        day: d.day,
        value: d.value,
        label: d.label,
    }));

    if (isLoading) {
        return (
            <View className="flex-1 bg-background pt-[12%] px-[3%] items-center justify-center">
                <Text className="text-secondary">Loading analysis...</Text>
            </View>
        );
    }

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
                    <WeeklyStressChart data={chartData} />
                </View>

                {/* Weekly Stats Summary */}
                <View className="bg-background-dark rounded-xl p-4 mb-4 border border-[#D9D9D9]">
                    <View className="flex-row justify-between">
                        <View className="items-center flex-1">
                            <Text className="text-xs text-secondary mb-1">Avg Stress</Text>
                            <Text className={`text-xl font-bold ${
                                weeklyStats.averageStress >= 60 ? 'text-[#D4A574]' :
                                    weeklyStats.averageStress >= 40 ? 'text-[#7B9BA8]' : 'text-[#5FA8A8]'
                            }`}>
                                {weeklyStats.averageStress}
                            </Text>
                        </View>
                        <View className="items-center flex-1">
                            <Text className="text-xs text-secondary mb-1">Avg Sleep</Text>
                            <Text className={`text-xl font-bold ${
                                weeklyStats.averageSleep >= 7 ? 'text-[#5FA8A8]' : 'text-[#D4A574]'
                            }`}>
                                {weeklyStats.averageSleep}h
                            </Text>
                        </View>
                        <View className="items-center flex-1">
                            <Text className="text-xs text-secondary mb-1">Avg HRV</Text>
                            <Text className={`text-xl font-bold ${
                                weeklyStats.averageHrv >= 50 ? 'text-[#5FA8A8]' : 'text-[#D4A574]'
                            }`}>
                                {weeklyStats.averageHrv}ms
                            </Text>
                        </View>
                        <View className="items-center flex-1">
                            <Text className="text-xs text-secondary mb-1">Trend</Text>
                            <Text className={`text-xl font-bold ${
                                weeklyStats.trend === 'improving' ? 'text-[#5FA8A8]' :
                                    weeklyStats.trend === 'worsening' ? 'text-[#D4A574]' : 'text-[#7B9BA8]'
                            }`}>
                                {weeklyStats.trend === 'improving' ? '↓' :
                                    weeklyStats.trend === 'worsening' ? '↑' : '→'}
                            </Text>
                        </View>
                    </View>
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
                        MCT Analysis
                    </Text>
                    <View className="bg-background-dark rounded-xl p-4 mb-3 border border-[#D9D9D9]">
                        <View className="flex-row justify-between items-center mb-3">
                            <Text className="text-base font-semibold text-secondary-dark">
                                Problem A vs B (Weekly Avg)
                            </Text>
                            <View className={`px-2 py-1 rounded-full ${
                                problemStats.dominantProblem === 'B' ? 'bg-[#D4A574]/20' :
                                    problemStats.dominantProblem === 'A' ? 'bg-[#7B9BA8]/20' : 'bg-[#5FA8A8]/20'
                            }`}>
                                <Text className={`text-xs font-medium ${
                                    problemStats.dominantProblem === 'B' ? 'text-[#D4A574]' :
                                        problemStats.dominantProblem === 'A' ? 'text-[#7B9BA8]' : 'text-[#5FA8A8]'
                                }`}>
                                    {problemStats.dominantProblem === 'B' ? 'Response > Stressor' :
                                        problemStats.dominantProblem === 'A' ? 'Stressor > Response' : 'Balanced'}
                                </Text>
                            </View>
                        </View>

                        {/* Visual comparison bar */}
                        <View className="flex-row items-center mb-3">
                            <View className="flex-1">
                                <View className="flex-row items-center justify-between mb-1">
                                    <Text className="text-sm text-secondary">Problem A</Text>
                                    <Text className="text-sm font-bold text-secondary-dark">{problemStats.avgProblemA}</Text>
                                </View>
                                <View className="h-2 bg-gray-200 rounded-full">
                                    <View
                                        className="h-2 bg-[#7B9BA8] rounded-full"
                                        style={{ width: `${problemStats.avgProblemA}%` }}
                                    />
                                </View>
                            </View>
                        </View>

                        <View className="flex-row items-center">
                            <View className="flex-1">
                                <View className="flex-row items-center justify-between mb-1">
                                    <Text className="text-sm text-secondary">Problem B</Text>
                                    <Text className="text-sm font-bold text-secondary-dark">{problemStats.avgProblemB}</Text>
                                </View>
                                <View className="h-2 bg-gray-200 rounded-full">
                                    <View
                                        className="h-2 bg-[#D4A574] rounded-full"
                                        style={{ width: `${problemStats.avgProblemB}%` }}
                                    />
                                </View>
                            </View>
                        </View>

                        {/* MCT Insight */}
                        {problemStats.dominantProblem === 'B' && (
                            <View className="mt-3 pt-3 border-t border-[#D9D9D9]">
                                <Text className="text-xs text-[#D4A574]">
                                    💡 Your reaction to stress is higher than the stressors themselves. Focus on metacognitive techniques.
                                </Text>
                            </View>
                        )}
                    </View>

                    {/* Problem A Card - The Stressor */}
                    <View className="bg-white rounded-xl p-4 mb-3 border border-[#D9D9D9]">
                        <View className="flex-row items-center mb-3">
                            <View className="w-8 h-8 rounded-full bg-[#7B9BA8]/20 items-center justify-center mr-2">
                                <Text className="text-sm"></Text>
                            </View>
                            <View className="flex-1">
                                <Text className="text-base font-semibold text-secondary-dark">Problem A: The Stressor</Text>
                                <Text className="text-sm text-secondary">External pressures & symptoms</Text>
                            </View>
                            <Text className="text-xl font-bold text-[#7B9BA8]">{problemStats.avgProblemA}</Text>
                        </View>

                        <View className="flex-row justify-between">
                            <View className="items-center flex-1">
                                <Text className="text-xs text-secondary mb-1">Mood</Text>
                                <Text className={`text-lg font-bold ${
                                    problemStats.avgMood >= 25 ? 'text-[#D4A574]' : 'text-[#5FA8A8]'
                                }`}>
                                    {problemStats.avgMood}
                                </Text>
                            </View>
                            <View className="items-center flex-1">
                                <Text className="text-xs text-secondary mb-1">Job Demands</Text>
                                <Text className={`text-lg font-bold ${
                                    problemStats.avgJobDemands >= 25 ? 'text-[#D4A574]' : 'text-[#5FA8A8]'
                                }`}>
                                    {problemStats.avgJobDemands}
                                </Text>
                            </View>
                            <View className="items-center flex-1">
                                <Text className="text-xs text-secondary mb-1">Symptoms</Text>
                                <Text className={`text-lg font-bold ${
                                    problemStats.avgSymptoms >= 15 ? 'text-[#D4A574]' : 'text-[#5FA8A8]'
                                }`}>
                                    {problemStats.avgSymptoms}
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Problem B Card - The Response */}
                    <View className="bg-white rounded-xl p-4 mb-3 border border-[#D9D9D9]">
                        <View className="flex-row items-center mb-3">
                            <View className="w-8 h-8 rounded-full bg-[#D4A574]/20 items-center justify-center mr-2">
                                <Text className="text-sm"></Text>
                            </View>
                            <View className="flex-1">
                                <Text className="text-base font-semibold text-secondary-dark">Problem B: The Response</Text>
                                <Text className="text-sm text-secondary">Metacognitive reactions (70% weight)</Text>
                            </View>
                            <Text className="text-xl font-bold text-[#D4A574]">{problemStats.avgProblemB}</Text>
                        </View>

                        <View className="flex-row justify-between">
                            <View className="items-center flex-1">
                                <Text className="text-xs text-secondary mb-1">Worry</Text>
                                <Text className={`text-lg font-bold ${
                                    problemStats.avgWorryTime >= 20 ? 'text-[#D4A574]' : 'text-[#5FA8A8]'
                                }`}>
                                    {problemStats.avgWorryTime}
                                </Text>
                            </View>
                            <View className="items-center flex-1">
                                <Text className="text-xs text-secondary mb-1">Threat Mon.</Text>
                                <Text className={`text-lg font-bold ${
                                    problemStats.avgThreatMonitoring >= 20 ? 'text-[#D4A574]' : 'text-[#5FA8A8]'
                                }`}>
                                    {problemStats.avgThreatMonitoring}
                                </Text>
                            </View>
                            <View className="items-center flex-1">
                                <Text className="text-xs text-secondary mb-1">Coping</Text>
                                <Text className={`text-lg font-bold ${
                                    problemStats.avgHarmfulCoping >= 15 ? 'text-[#D4A574]' : 'text-[#5FA8A8]'
                                }`}>
                                    {problemStats.avgHarmfulCoping}
                                </Text>
                            </View>
                            <View className="items-center flex-1">
                                <Text className="text-xs text-secondary mb-1">Energy</Text>
                                <Text className={`text-lg font-bold ${
                                    problemStats.avgWorryEnergy >= 7 ? 'text-[#D4A574]' : 'text-[#5FA8A8]'
                                }`}>
                                    {problemStats.avgWorryEnergy}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                <View className="mb-6">
                    <Text className="text-xl font-bold text-secondary-dark mb-4">
                        Trends
                    </Text>

                    <WeeklySummaryCard
                        checkInsCompleted={weeklyData.length}
                        checkInsTotal={7}
                        averageStress={weeklyStats.averageStress}
                        highStressDays={weeklyStats.highStressDays}
                        totalDays={7}
                        breaksTaken={Math.max(0, 7 - weeklyStats.highStressDays) * 2}
                    />

                    <StressComparisonCard
                        thisWeek={weeklyStats.averageStress}
                        lastWeek={weeklyStats.lastWeekAverage}
                    />

                    <MostStressfulDayCard
                        day={weeklyStats.highestDay}
                        averageStress={weeklyStats.highestDayStress}
                        description="Based on this week's data"
                    />

                    <SleepImpactCard data={sleepImpactData} />

                    <StressTriggersCard
                        triggers={stressTriggers}
                        period="this week"
                    />
                </View>
            </ScrollView>
        </View>
    );
};

export default Analysis;