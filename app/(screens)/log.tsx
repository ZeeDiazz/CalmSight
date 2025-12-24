import {View, Text, TouchableOpacity} from 'react-native';
import React, {useState} from 'react';
import StageMood from "@/components/log-component/stageMood";
import StageCoping from "@/components/log-component/stageCoping";
import StageSymptoms from "@/components/log-component/stageSymptoms";
import StageJobDemand from "@/components/log-component/stageJobDemand";
import {useRouter} from "expo-router";
import StageTimeQuestion from "@/components/log-component/stagesTimeQuestions";
import {CheckInData} from "@/interfaces/Types";
import {StressCalculator} from "@/utils/StressCalculator";
import {mockHealthDataService} from "@/utils/mockHealthDataGenerator";

const Log = () => {
    const router = useRouter();

    const totalStages = 6;
    const [currentStage, setCurrentStage] = useState(1);

    const [checkInType, setCheckInType] = useState<'daily' | 'weekly'>('daily');

    const [checkInData, setCheckInData] = useState<CheckInData>({
        type: 'daily',
        mood: null,
        worryTime: null,
        threatMonitoring: null,
        jobDemand: null,
        coping: null,
        symptoms: null,
    });

    const updateStageData = (stageData: Partial<CheckInData>) => {
        setCheckInData(prev => ({ ...prev, ...stageData }));
    };

    const renderStage = () => {
        switch (currentStage) {
            case 1:
                return (
                    <StageMood checkInType={checkInData.type}
                        selected={checkInData.mood}
                        onUpdate={(mood) => updateStageData({mood})}
                    />
                );
            case 2:
                return(
                    <StageTimeQuestion title="Time Spent Worrying"
                    selected={checkInData.worryTime}
                    onUpdate={(value) => updateStageData({ worryTime: value })}
                />);
            case 3:
                return(
                    <StageTimeQuestion title="Time Spent in Threat Monitoring"
                    selected={checkInData.threatMonitoring}
                    onUpdate={(value) => updateStageData({ threatMonitoring: value })}
                    />
                );
            case 4:
                return(
                    <StageJobDemand
                        selected={checkInData.jobDemand}
                        onUpdate={(data) => updateStageData({ jobDemand: data })}
                    />
                );
            case 5:
                return(
                    <StageCoping
                        selected={checkInData.coping}
                        onUpdate={(data) => updateStageData({ coping: data })}
                    />
                );
            case 6:
                return(
                    <StageSymptoms
                        selected={checkInData.symptoms}
                        onUpdate={(data) => updateStageData({ symptoms: data })}
                    />
                );
            default:
                return (
                    <StageMood checkInType={checkInData.type} selected={checkInData.mood}
                               onUpdate={(mood) => updateStageData({mood})}/>);
        }
    };

    const handleSave = async () => {
        try {
            const mood = checkInData.mood as 'overwhelmed' | 'drained' | 'neutral' | 'energized' | null;
            const worryLevel = checkInData.worryTime as 'minimal' | 'moderate' | 'significant' | 'overwhelming' | null;

            // Generate health data that correlates with the check-in responses
            const healthData = mockHealthDataService.generateCorrelatedHealthData(
                mood || 'neutral',
                worryLevel || 'minimal'
            );

            // Calculate stress with BOTH subjective + objective data
            const stressResult = StressCalculator.calculate(checkInData, healthData);

            console.log('\n=== STRESS CALCULATION ===');
            console.log('Final Score:', stressResult.stressScore, '/ 100');
            console.log('Risk Level:', stressResult.riskLevel);
            console.log('');
            console.log('MCT Breakdown:');
            console.log('  Problem A (Stressor):', stressResult.problemA.score);
            console.log('    - Mood:', stressResult.problemA.components.mood);
            console.log('    - Job Demands:', stressResult.problemA.components.jobDemands);
            console.log('    - Symptoms:', stressResult.problemA.components.symptoms);
            console.log('  Problem B (Response):', stressResult.problemB.score, '(70% weight)');
            console.log('    - Worry Time:', stressResult.problemB.components.worryTime);
            console.log('    - Threat Monitoring:', stressResult.problemB.components.threatMonitoring);
            console.log('    - Harmful Coping:', stressResult.problemB.components.harmfulCoping);
            console.log('    - Worry Energy:', stressResult.problemB.components.worryEnergy);
            console.log('');
            console.log('Weighted Scores:');
            console.log('  Subjective (Check-in):', stressResult.subjectiveScore);
            console.log('  Objective (Health):', stressResult.objectiveScore);
            console.log('');
            console.log('Confidence:', stressResult.confidence + '%');
            console.log('Data Quality:', stressResult.dataQuality);
            console.log('');
            console.log('Health Metrics:');
            console.log('  HRV:', healthData.hrv?.interval, 'ms');
            console.log('  Sleep:', healthData.sleep?.totalDurationHours + 'h', '(' + healthData.sleep?.sleepEfficiency + '% efficiency)');
            console.log('  Resting HR:', healthData.heartRate?.restingBpm, 'bpm');
            console.log('  Steps:', healthData.activity?.steps);
            console.log('');
            console.log('Insights:');
            stressResult.insights.forEach((insight, i) => {
                console.log(`  ${i + 1}. ${insight}`);
            });

            // Create complete check-in with all data
            const completeCheckIn = {
                ...checkInData,
                stressScore: stressResult.stressScore,
                subjectiveScore: stressResult.subjectiveScore,
                objectiveScore: stressResult.objectiveScore,
                riskLevel: stressResult.riskLevel,

                problemA: stressResult.problemA,
                problemB: stressResult.problemB,

                confidence: stressResult.confidence,
                dataQuality: stressResult.dataQuality,

                objectiveBreakdown: stressResult.objectiveBreakdown,
                insights: stressResult.insights,
                healthData: healthData,

                timestamp: new Date().toISOString(),
            };

            console.log('Complete Check-In Object:', JSON.stringify(completeCheckIn, null, 2));

            // TODO: Save to backend/AsyncStorage
            // await saveCheckInToBackend(completeCheckIn);

            // Reset form
            setCurrentStage(1);
            setCheckInData({
                type: 'daily',
                mood: null,
                worryTime: null,
                threatMonitoring: null,
                jobDemand: null,
                coping: null,
                symptoms: null,
            });

            // Navigate back
            router.push('/(screens)');
        }
        catch (error) {
            console.error('Error saving check-in:', error);
        }
    };

    const handleNextStage= ()=> {
        if (currentStage < totalStages){
            setCurrentStage(prev=> prev + 1);
        }
    };

    const handlePrevStage = ()=> {
        if (currentStage > 1){
            setCurrentStage(prev=> prev - 1);
        }
    };

    return (
        <View className="flex-1 bg-background pt-12">
            <View className="mt-4 mb-5 px-4">
                <Text className="text-3xl font-black text-secondary-dark">
                    Check-In
                </Text>
            </View>
            {/* Top toggle between daily and weekly */}
            {currentStage === 1 ? (
                <View className="absolute top-[12%] left-0 right-0 flex-row justify-center gap-3">
                    <TouchableOpacity
                        onPress={() => {
                            setCheckInType('daily');
                            updateStageData({ type: 'daily' });
                        }}
                        className={`${checkInType === 'daily' ? 'bg-primary' : 'bg-background-dark'} rounded-xl p-5 items-center justify-center border border-[#D9D9D9] min-h-[5%] min-w-[45%]`}>
                        <Text className={`${checkInType === 'daily' ? 'text-white': 'text-secondary-dark'} text-center text-[15px]`}>Daily</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => {
                            setCheckInType('weekly');
                            updateStageData({ type: 'weekly' });
                        }}
                        className={`${checkInType === 'weekly' ? 'bg-primary' : 'bg-background-dark'} rounded-xl p-5 items-center justify-center border border-[#D9D9D9] min-h-[5%] min-w-[45%]`}>
                        <Text className={`${checkInType === 'weekly' ? 'text-white': 'text-secondary-dark'} text-center text-[15px]`}>Weekly</Text>
                    </TouchableOpacity>
                </View>
            ) :
                <></>
            }

            {/* Check-in stages*/}
            <View className="h-[3%]" />
            <View >
                {renderStage()}
            </View>

            {/*Used to map the totalStages https://stackoverflow.com/questions/77705494/using-map-with-numbers-not-an-array-or-ignoring-the-first-parameter-in-a-map-a*/}
            <View className="absolute bottom-[20%] flex-row left-0 right-0 justify-center gap-3">
                {[...Array(totalStages)].map((_, index) => (
                    <View key={index} className={`w-3 h-3 rounded-full ${index + 1 < currentStage ? 'bg-primary-dark'
                                : (index + 1 === currentStage
                                    ? 'bg-primary'
                                    : 'bg-background-dark')
                        }`}/>
                ))}
            </View>

            {/*Stage navigation buttons*/}
            <View className="absolute bottom-[11%] left-0 right-0 flex-row justify-center gap-3">
                <TouchableOpacity
                    onPress={handlePrevStage}
                    disabled={currentStage === 1}
                    className={`rounded-xl p-5 items-center justify-center border border-[#D9D9D9] min-h-[5%] min-w-[45%]
                        ${currentStage === 1 ? 'bg-background-dark/20' : 'bg-background-dark'}
                    `}>
                    <Text className={`text-center text-[15px] ${currentStage === 1 ? 'text-secondary' : 'text-secondary-dark'}`}>Back</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={currentStage === totalStages ? handleSave : handleNextStage}
                    className="bg-primary rounded-xl p-5 items-center justify-center border border-[#D9D9D9] min-h-[5%] min-w-[45%]">
                    <Text className="text-center text-white text-[15px]">{currentStage === totalStages ? 'Save' : 'Next'}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};
export default Log;