import {View, Text, TouchableOpacity} from "react-native";
import React, {useState} from "react";
import StageMood from "@/components/log-component/stageMood";
import StageCoping from "@/components/log-component/stageCoping";
import StageSymptoms from "@/components/log-component/stageSymptoms";
import StageJobDemand from "@/components/log-component/stageJobDemand";
import StageTimeQuestion from "@/components/log-component/stagesTimeQuestions";
import {CheckInData} from "@/interfaces/Types";
import {StressCalculator} from "@/utils/StressCalculator";
import {useHealthService} from "@/hooks/useHealthService";

const Log = () => {
    const totalStages = 7;
    const [currentStage, setCurrentStage] = useState(1);

    const [checkInData, setCheckInData] = useState<CheckInData>({
        type: 'daily',
        mood: null,
        worryTime: null,
        threatMonitoring: null,
        jobDemand: null,
        coping: null,
        symptoms: null,
    });
    // Use health service hook
    const { service, isRealData } = useHealthService();

    const updateStageData = (stageData: Partial<CheckInData>) => {
        setCheckInData(prev => ({ ...prev, ...stageData }));
    };

    // Progress indicator
    const progress = currentStage === 7 ? 100 : ((currentStage + 1) / totalStages) * 100;

    const renderStage = () => {
        switch (currentStage) {
            case 1: return <StageMood checkInType={checkInData.type} selected={checkInData.mood} onUpdate={(mood) => updateStageData({mood})}/>;
            case 2: return <StageTimeQuestion title="Time Spent Worrying" selected={checkInData.worryTime} onUpdate={(value) => updateStageData({ worryTime: value })}/>;
            case 3: return <StageTimeQuestion title="Time Spent in Threat Monitoring" selected={checkInData.threatMonitoring} onUpdate={(value) => updateStageData({ threatMonitoring: value })}/>;
            case 4: return <StageJobDemand selected={checkInData.jobDemand} onUpdate={(data) => updateStageData({ jobDemand: data })}/>;
            case 5: return <StageCoping selected={checkInData.coping} onUpdate={(data) => updateStageData({ coping: data })}/>;
            case 6: return <StageSymptoms selected={checkInData.symptoms} onUpdate={(data) => updateStageData({ symptoms: data })}/>;
            case 7: return <CompleteStage />;
            default: return <StageMood checkInType={checkInData.type} selected={checkInData.mood} onUpdate={(mood) => updateStageData({mood})}/>;
        }
    };

    const handleSave = async () => {
        // Get health data from service (real or mock)
        const healthData = await service.getLatestHealthData();

        // Calculate stress
        const stressResult = StressCalculator.calculate(checkInData, healthData);

        // TODO: Save to backend/AsyncStorage
        console.log('Check-in Complete');
        console.log('Data Source:', isRealData ? 'Health Connect' : 'Mock Data');
        console.log('Check-in Data:', JSON.stringify(checkInData, null, 2));
        console.log('Health Data:', JSON.stringify({
            sleep: healthData.sleep?.totalDurationHours,
            hrv: healthData.hrv?.interval,
            heartRate: healthData.heartRate?.restingBpm,
            steps: healthData.activity?.steps,
        }, null, 2));
        console.log('Stress Score:', stressResult.stressScore);
        console.log('Problem A:', stressResult.problemA.score);
        console.log('Problem B:', stressResult.problemB.score);
        console.log('Risk Level:', stressResult.riskLevel);
        console.log('Insights:', stressResult.insights);

        setCurrentStage(totalStages);
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

    const isCurrentStageValid = () => {
        switch (currentStage) {
            case 1:
                return checkInData.mood !== null;
            case 2:
                return checkInData.worryTime !== null;
            case 3:
                return checkInData.threatMonitoring !== null;
            case 4:
                return checkInData.jobDemand !== null;
            case 5:
                return checkInData.coping !== null;
            case 6:
                return checkInData.symptoms !== null;
            default:
                return true;
        }
    };

    const isDisabled = !isCurrentStageValid();

    const CompleteStage = () => {
        return (
            <View className="items-center justify-center py-12">
                <View className="w-20 h-20 rounded-full bg-primary/20 items-center justify-center mb-6">
                    <Text className="text-4xl">✓</Text>
                </View>
                <Text className="text-2xl font-bold text-secondary-dark mb-2">
                    Check-in Complete!
                </Text>
                <Text className="text-sm text-secondary text-center mb-6">
                    Your stress data has been recorded and analyzed.
                </Text>

                <TouchableOpacity
                    onPress={() => {
                        setCheckInData({ ...checkInData, type: 'daily' });
                        setCurrentStage(1);
                    }}
                    className="bg-primary px-8 py-3 rounded-full"
                >
                    <Text className="text-white font-bold">New Check-in</Text>
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <View className="flex-1 bg-background pt-12">
            {/* Header */}
            <View className="mt-4 mb-5 px-4">
                <Text className="text-3xl font-black text-secondary-dark">
                    Check-in
                </Text>
                {currentStage !== totalStages && (
                    <Text className="text-sm text-secondary mt-1">Step {currentStage} of {totalStages-1}</Text>
                )}
            </View>

            {/* Progress bar */}
            {currentStage !== totalStages && (
                <View className="h-2 bg-gray-200 rounded-full mb-5 mx-[3%]">
                    <View
                        className="h-2 bg-primary rounded-full"
                        style={{ width: `${progress}%` }}
                    />
                </View>
            )}

            {/* Back button */}
            {currentStage > 1 && currentStage !== totalStages && (
                <TouchableOpacity
                    onPress={handlePrevStage}
                    className=" mx-[3%]"
                >
                    <Text className="text-primary text-[15px]">← Back</Text>
                </TouchableOpacity>
            )}

            <View>
                {renderStage()}
            </View>

            {currentStage !== totalStages && (
                <View className="absolute bottom-[11%] left-0 right-0 flex-row justify-center gap-3">
                    <TouchableOpacity
                        onPress={currentStage === totalStages-1 ? handleSave : handleNextStage}
                        disabled={isDisabled}
                        className={`${isDisabled ? 'bg-background-dark text-secondary': 'bg-primary'} rounded-xl p-5 items-center justify-center border border-[#D9D9D9] min-h-[5%] min-w-[45%]`}>
                        <Text className={`${isDisabled ? 'text-secondary': 'text-white'} text-center  text-[15px]`}>{currentStage === totalStages ? 'Save' : 'Next'}</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};

export default Log;