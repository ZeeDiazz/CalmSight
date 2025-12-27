import {View, Text, ScrollView} from "react-native";
import React, {useCallback, useState} from "react";
import WeeklyStressChart from "@/components/analysis/weeklyStressChart";
import PredictionCard from "@/components/analysis/predictionCard";
import BreakSuggestionCard from "@/components/analysis/breakSuggestionCard";
import {StressComparisonCard, MostStressfulDayCard, SleepImpactCard, StressTriggersCard, WeeklySummaryCard} from "@/components/analysis/trendCards";
import {useHealthService} from "@/hooks/useHealthService";
import {getCheckInService} from "@/hooks/useCheckInService"
import {StressCalculator} from "@/utils/StressCalculator";
import {HealthData} from "@/interfaces/Types";
import {StressCalculation} from "@/interfaces/StressTypesProps";
import {localCheckInService} from "@/utils/localCheckInService";
import {useFocusEffect} from "expo-router";

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
    // Use health service hook
    const { service, isRealData, status } = useHealthService();

    const [weeklyData, setWeeklyData] = useState<DailyStressData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [daysWithCheckIn, setDaysWithCheckIn] = useState(0);

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

    useFocusEffect(
        useCallback(() => {
            if (status !== 'loading') {
                loadWeeklyData();
            }
        }, [status, isRealData])
    );

    const loadWeeklyData = async () => {
        try {
            setIsLoading(true);

            const dates = getLastSevenDays();
            const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            const dayShort = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

            const weekData: DailyStressData[] = [];
            const checkInService = getCheckInService();
            let checkInCount = 0;

            for (const date of dates) {
                // Get health data from service (real or mock)
                const healthData = await service.getHealthDataForDate(date);

                let stressResult = await localCheckInService.getStressScoreForDate(date);

                if (!stressResult) {
                    const checkInData = await checkInService.getCheckInForDate(date);

                    if (checkInData) {
                        // Calculate and save stress score
                        stressResult = StressCalculator.calculate(checkInData, healthData);
                        await localCheckInService.saveStressScore(date, stressResult);
                        checkInCount++;
                    } else {
                        // No check-in for this date
                        stressResult = StressCalculator.calculateObjectiveOnly(healthData);
                    }
                } else {
                    checkInCount++;
                }

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

            setDaysWithCheckIn(checkInCount);
            setWeeklyData(weekData);
            calculateWeeklyStats(weekData);
            calculateSleepImpact(weekData);
            calculateStressTriggers(weekData);

            console.log('Weekly Analysis Data');
            console.log('Health Data Source:', isRealData ? 'Health Connect' : 'Mock Data');
            console.log('Days with check-ins:', checkInCount, '/ 7');
            weekData.forEach(d => {
                console.log(`${d.label} (${d.date}): Stress=${d.value}, Sleep=${d.healthData.sleep?.totalDurationHours}h`);
            });

        } catch (error) {
            console.error('Error loading weekly data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getLastSevenDays = (): string[] => {
        const dates: string[] = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            dates.push(date.toISOString().split('T')[0]);
        }
        return dates;
    };

    const calculateWeeklyStats = (data: DailyStressData[]) => {
        if (data.length === 0) return;


        const stressValues = data.map(d => d.value);
        const avgStress = Math.round(stressValues.reduce((a, b) => a + b, 0) / stressValues.length);

        const maxStress = Math.max(...stressValues);
        const minStress = Math.min(...stressValues);

        const daysWithStress = data.filter(d => d.value !== null && d.value > 0);

        const highestDayData = data.find(d => d.value === maxStress);
        let highestDay = highestDayData?.label || '';
        let highestDayStress = highestDayData?.value || 0;
        let lowestDay = data.find(d => d.value === minStress)?.label || '';

        if(daysWithStress.length === 0){
            highestDay =  '';
            highestDayStress = 0;
            lowestDay = '';
        }

        const highStressDays = data.filter(d => d.value >= 60).length;

        const firstHalf = stressValues.slice(0, 3).reduce((a, b) => a + b, 0) / 3;
        const secondHalf = stressValues.slice(4).reduce((a, b) => a + b, 0) / 3;

        let trend: 'improving' | 'worsening' | 'stable' = 'stable';
        if (secondHalf < firstHalf - 10) trend = 'improving';
        else if (secondHalf > firstHalf + 10) trend = 'worsening';

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

        calculateProblemStats(data);
    };

    const calculateProblemStats = (data: DailyStressData[]) => {
        if (data.length === 0) return;

        const n = data.length;

        const avgProblemA = Math.round(data.reduce((sum, d) => sum + d.stressResult.problemA.score, 0) / n);
        const avgMood = Math.round(data.reduce((sum, d) => sum + d.stressResult.problemA.components.mood, 0) / n);
        const avgJobDemands = Math.round(data.reduce((sum, d) => sum + d.stressResult.problemA.components.jobDemands, 0) / n);
        const avgSymptoms = Math.round(data.reduce((sum, d) => sum + d.stressResult.problemA.components.symptoms, 0) / n);

        const avgProblemB = Math.round(data.reduce((sum, d) => sum + d.stressResult.problemB.score, 0) / n);
        const avgWorryTime = Math.round(data.reduce((sum, d) => sum + d.stressResult.problemB.components.worryTime, 0) / n);
        const avgThreatMonitoring = Math.round(data.reduce((sum, d) => sum + d.stressResult.problemB.components.threatMonitoring, 0) / n);
        const avgHarmfulCoping = Math.round(data.reduce((sum, d) => sum + d.stressResult.problemB.components.harmfulCoping, 0) / n);
        const avgWorryEnergy = Math.round(data.reduce((sum, d) => sum + d.stressResult.problemB.components.worryEnergy, 0) / n);

        let dominantProblem: 'A' | 'B' | 'balanced' = 'balanced';
        if (avgProblemB > avgProblemA + 15) {
            dominantProblem = 'B';
        } else if (avgProblemA > avgProblemB + 15) {
            dominantProblem = 'A';
        }

        setProblemStats({
            avgProblemA, avgProblemB, avgMood, avgJobDemands, avgSymptoms,
            avgWorryTime, avgThreatMonitoring, avgHarmfulCoping, avgWorryEnergy,
            dominantProblem,
        });
    };

    const calculateSleepImpact = (data: DailyStressData[]) => {
        const daysWithSleepAndStress = data.filter(d =>
            d.value !== null &&
            d.healthData.sleep &&
            d.healthData.sleep.totalDurationHours > 0
        );

        if (daysWithSleepAndStress.length === 0) {
            setSleepImpactData([]);
            return;
        }

        const shortSleep = daysWithSleepAndStress.filter(d =>
            d.healthData.sleep!.totalDurationHours < 6
        );
        const mediumSleep = daysWithSleepAndStress.filter(d => {
            const hours = d.healthData.sleep!.totalDurationHours;
            return hours >= 6 && hours < 8;
        });
        const longSleep = daysWithSleepAndStress.filter(d =>
            d.healthData.sleep!.totalDurationHours >= 8
        );

        const avgStress = (arr: DailyStressData[]) =>
            arr.length > 0 ? Math.round(arr.reduce((sum, d) => sum + d.value!, 0) / arr.length) : null;

        // Build array with only categories that have data
        const impactData: SleepImpactData[] = [];

        const shortStress = avgStress(shortSleep);
        const mediumStress = avgStress(mediumSleep);
        const longStress = avgStress(longSleep);

        if (shortStress !== null) {
            impactData.push({
                label: `<6h sleep (${shortSleep.length} ${shortSleep.length === 1 ? 'day' : 'days'})`,
                stressLevel: shortStress
            });
        }
        if (mediumStress !== null) {
            impactData.push({
                label: `6-8h sleep (${mediumSleep.length} ${mediumSleep.length === 1 ? 'day' : 'days'})`,
                stressLevel: mediumStress
            });
        }
        if (longStress !== null) {
            impactData.push({
                label: `8+h sleep (${longSleep.length} ${longSleep.length === 1 ? 'day' : 'days'})`,
                stressLevel: longStress
            });
        }

        // Sort by stress level descending (highest stress first)
        impactData.sort((a, b) => b.stressLevel - a.stressLevel);

        setSleepImpactData(impactData);

        // Log sleep impact analysis
        console.log('Sleep Impact Analysis');
        console.log('Days with sleep data:', daysWithSleepAndStress.length);
        daysWithSleepAndStress.forEach(d => {
            console.log(`  ${d.label}: ${d.healthData.sleep!.totalDurationHours}h sleep → ${d.value} stress`);
        });
    };

    const calculateStressTriggers = (data: DailyStressData[]) => {
        const triggers: Record<string, number> = {
            'Work deadlines': 0,
            'Poor sleep': 0,
            'Excessive worry': 0,
            'Low mood': 0,
            'Physical symptoms': 0,
        };

        data.forEach(d => {
            if (d.healthData.sleep === null) return;
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

        const pattern = weeklyStats.highestDay ? `Highest stress on ${weeklyStats.highestDay}` : 'Not enough data for patterns';

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
            if (daysWithCheckIn === 0) {
                actions.push('Complete daily check-ins for personalized recommendations');
            } else {
                actions.push('Keep up the good work!');
            }
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
        }

        return { title: 'Add One Break Tomorrow', times: ['12:00 pm'] };
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
                    <Text className="text-xs text-secondary">
                        {isRealData ? '📱 Using Health Connect data' : '📱 Using demo data'}
                    </Text>
                </View>

                <View className="mb-6">
                    <WeeklyStressChart data={chartData} />
                </View>

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

                        {problemStats.dominantProblem === 'B' && (
                            <View className="mt-3 pt-3 border-t border-[#D9D9D9]">
                                <Text className="text-xs text-[#D4A574]">
                                    💡 Your reaction to stress is higher than the stressors themselves. Focus on metacognitive techniques.
                                </Text>
                            </View>
                        )}
                    </View>

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
                        checkInsCompleted={daysWithCheckIn}
                        checkInsTotal={7}
                        averageStress={weeklyStats.averageStress}
                        highStressDays={weeklyStats.highStressDays}
                        totalDays={7}
                        breaksTaken={0}  // TODO: Track actual breaks taken
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