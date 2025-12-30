import {View, Text, TouchableOpacity, Modal, ScrollView, Image} from "react-native";
import React, {useState} from "react";
import StageMood from "@/components/log-component/stageMood";
import StageCoping from "@/components/log-component/stageCoping";
import StageSymptoms from "@/components/log-component/stageSymptoms";
import StageJobDemand from "@/components/log-component/stageJobDemand";
import StageTimeQuestion from "@/components/log-component/stagesTimeQuestions";
import {CheckInData} from "@/interfaces/Types";
import {StressCalculator} from "@/utils/StressCalculator";
import {useHealthService} from "@/hooks/useHealthService";
import {getCheckInService} from "@/hooks/useCheckInService";
import {localCheckInService} from "@/utils/localCheckInService";
import { StressCalculation } from "@/interfaces/StressTypesProps";

interface CheckInHistoryItem {
    date: string;
    checkIn: CheckInData;
    stressScore: StressCalculation | null;
}

const Log = () => {
    const totalStages = 7;
    const [currentStage, setCurrentStage] = useState(1);
    const [isSaving, setIsSaving] = useState(false);

    // History modal state
    const [historyModalVisible, setHistoryModalVisible] = useState(false);
    const [history, setHistory] = useState<CheckInHistoryItem[]>([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);
    const [selectedItem, setSelectedItem] = useState<CheckInHistoryItem | null>(null);

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

    // Load history when modal opens
    const loadHistory = async () => {
        try {
            setIsLoadingHistory(true);
            const allCheckIns = await localCheckInService.getAllCheckIns();
            const allStressScores = await localCheckInService.getAllStressScores();

            const historyItems: CheckInHistoryItem[] = Object.entries(allCheckIns)
                .map(([date, checkIn]) => ({
                    date,
                    checkIn,
                    stressScore: allStressScores[date] || null,
                }))
                .sort((a, b) => b.date.localeCompare(a.date));

            setHistory(historyItems);
        } catch (error) {
            console.error('Error loading check-in history:', error);
        } finally {
            setIsLoadingHistory(false);
        }
    };

    const openHistoryModal = () => {
        setHistoryModalVisible(true);
        loadHistory();
    };

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
        setIsSaving(true);
        try{
            // Get health data from service (real or mock)
            const healthData = await service.getLatestHealthData();

            // Calculate stress
            const stressResult = StressCalculator.calculate(checkInData, healthData);

            const today = new Date().toISOString().split('T')[0];

            // Save check-in data
            const checkInService = getCheckInService();
            await checkInService.saveCheckIn(checkInData);

            // Save calculated stress score
            await localCheckInService.saveStressScore(today, stressResult);

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
        } catch (error) {
            console.error('Error saving check-in:', error);
        } finally {
            setIsSaving(false);
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

    const handleDelete = async (date: string) => {
        try {
            const checkInService = getCheckInService();
            await checkInService.deleteCheckIn(date);
            await loadHistory();
            setSelectedItem(null);
        } catch (error) {
            console.error('Error deleting check-in:', error);
        }
    };

    // Helper functions for history modal
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const dateStr = date.toISOString().split('T')[0];
        const todayStr = today.toISOString().split('T')[0];
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        if (dateStr === todayStr) return 'Today';
        if (dateStr === yesterdayStr) return 'Yesterday';
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });
    };

    const getStressColor = (score: number) => {
        if (score >= 60) return '#D4A574';
        if (score >= 40) return '#7B9BA8';
        return '#5FA8A8';
    };

    const getStressLabel = (score: number) => {
        if (score >= 60) return 'High';
        if (score >= 40) return 'Moderate';
        return 'Low';
    };

    const getMoodEmoji = (mood: string | null) => {
        const moodMap: { [key: string]: string } = {
            'overwhelmed': '😰',
            'drained': '😔',
            'neutral': '😐',
            'energized': '🤩',
            'terrible': '😢',
        };
        return mood ? moodMap[mood] || '❓' : '❓';
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
                        setCheckInData({
                            type: 'daily',
                            mood: null,
                            worryTime: null,
                            threatMonitoring: null,
                            jobDemand: null,
                            coping: null,
                            symptoms: null,
                        });
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
            <View className="flex-row justify-between items-center mt-4 mb-5 px-4">
                <View>
                    <Text className="text-3xl font-black text-secondary-dark">
                        Check-in
                    </Text>
                    {currentStage !== totalStages && (
                        <Text className="text-sm text-secondary mt-1">Step {currentStage} of {totalStages-1}</Text>
                    )}
                </View>

                {currentStage === 1 && (
                    <TouchableOpacity
                        onPress={openHistoryModal}
                        className="flex-row items-center gap-2 bg-white rounded-xl px-4 py-2 border-2 border-gray-200"
                        style={{
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.05,
                            shadowRadius: 4,
                            elevation: 2,
                        }}
                    >
                        <Image
                            className="w-6 h-6"
                            source={require('@/assets/icons/history.png')}
                            resizeMode="contain"
                        />
                    </TouchableOpacity>
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

            {/* History Modal */}
            <Modal visible={historyModalVisible}  animationType="slide"
                presentationStyle="pageSheet" onRequestClose={() => setHistoryModalVisible(false)}
            >
                <View className="flex-1 bg-background pt-12">
                    {/* Modal Header */}
                    <View className="flex-row justify-between items-center px-4 pb-4 border-b border-gray-200">
                        <View>
                            <Text className="text-2xl font-black text-secondary-dark">
                                Check-in History
                            </Text>
                            <Text className="text-sm text-secondary mt-1">
                                {history.length} {history.length === 1 ? 'entry' : 'entries'}
                            </Text>
                        </View>
                        <TouchableOpacity
                            onPress={() => setHistoryModalVisible(false)}
                            className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
                        >
                            <Text className="text-xl text-secondary-dark">✕</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Modal Content */}
                    <ScrollView
                        className="flex-1 px-4"
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingTop: 16, paddingBottom: 20 }}
                    >
                        {isLoadingHistory ? (
                            <View className="items-center justify-center py-20">
                                <Text className="text-secondary">Loading history...</Text>
                            </View>
                        ) : history.length === 0 ? (
                            <View className="items-center justify-center py-20">
                                <Text className="text-6xl mb-4">📋</Text>
                                <Text className="text-lg font-bold text-secondary-dark mb-2">
                                    No Check-ins Yet
                                </Text>
                                <Text className="text-sm text-secondary text-center">
                                    Complete your first check-in to see it here
                                </Text>
                            </View>
                        ) : (
                            <View className="gap-3">
                                {history.map((item) => (
                                    <TouchableOpacity
                                        key={item.date}
                                        onPress={() => setSelectedItem(selectedItem?.date === item.date ? null : item)}
                                        activeOpacity={0.7}
                                    >
                                        <View
                                            className={`bg-white rounded-2xl p-5 border-2 ${
                                                selectedItem?.date === item.date
                                                    ? 'border-primary'
                                                    : 'border-gray-200'
                                            }`}
                                            style={{
                                                shadowColor: '#000',
                                                shadowOffset: { width: 0, height: 2 },
                                                shadowOpacity: selectedItem?.date === item.date ? 0.1 : 0.05,
                                                shadowRadius: 8,
                                                elevation: selectedItem?.date === item.date ? 4 : 2,
                                            }}
                                        >
                                            {/* Header Row */}
                                            <View className="flex-row justify-between items-center mb-3">
                                                <View>
                                                    <Text className="text-lg font-bold text-secondary-dark">
                                                        {formatDate(item.date)}
                                                    </Text>
                                                    <Text className="text-xs text-secondary">
                                                        {item.date}
                                                    </Text>
                                                </View>

                                                {item.stressScore && (
                                                    <View className="items-end">
                                                        <Text
                                                            className="text-2xl font-black"
                                                            style={{ color: getStressColor(item.stressScore.stressScore) }}
                                                        >
                                                            {item.stressScore.stressScore}
                                                        </Text>
                                                        <Text
                                                            className="text-xs font-semibold"
                                                            style={{ color: getStressColor(item.stressScore.stressScore) }}
                                                        >
                                                            {getStressLabel(item.stressScore.stressScore)}
                                                        </Text>
                                                    </View>
                                                )}
                                            </View>

                                            {/* Summary Row */}
                                            <View className="flex-row justify-between items-center py-3 border-t border-gray-200">
                                                <View className="items-center flex-1">
                                                    <Text className="text-xl mb-1">
                                                        {getMoodEmoji(item.checkIn.mood)}
                                                    </Text>
                                                    <Text className="text-xs text-secondary">Mood</Text>
                                                </View>

                                                <View className="items-center flex-1">
                                                    <Text className="text-xs font-bold text-secondary-dark mb-1">
                                                        {item.checkIn.worryTime || '--'}
                                                    </Text>
                                                    <Text className="text-xs text-secondary">Worry</Text>
                                                </View>

                                                <View className="items-center flex-1">
                                                    <Text className="text-xs font-bold text-secondary-dark mb-1">
                                                        {item.checkIn.threatMonitoring || '--'}
                                                    </Text>
                                                    <Text className="text-xs text-secondary">Threat</Text>
                                                </View>

                                                <View className="items-center flex-1">
                                                    <Text className="text-xs font-bold text-secondary-dark mb-1">
                                                        {typeof item.checkIn.jobDemand === 'object' && item.checkIn.jobDemand
                                                            ? Object.keys(item.checkIn.jobDemand).length
                                                            : '--'}
                                                    </Text>
                                                    <Text className="text-xs text-secondary">Job</Text>
                                                </View>
                                            </View>

                                            {/* Expanded Details */}
                                            {selectedItem?.date === item.date && (
                                                <View className="mt-3 pt-3 border-t border-gray-200">
                                                    <Text className="text-sm font-bold text-secondary-dark mb-3">
                                                        Full Details
                                                    </Text>

                                                    {item.stressScore && (
                                                        <View className="mb-3">
                                                            <View className="flex-row justify-between mb-2">
                                                                <Text className="text-xs text-secondary">Problem A (Stressor)</Text>
                                                                <Text className="text-sm font-bold text-secondary-dark">
                                                                    {item.stressScore.problemA.score}
                                                                </Text>
                                                            </View>
                                                            <View className="flex-row justify-between">
                                                                <Text className="text-xs text-secondary">Problem B (Response)</Text>
                                                                <Text className="text-sm font-bold text-secondary-dark">
                                                                    {item.stressScore.problemB.score}
                                                                </Text>
                                                            </View>
                                                        </View>
                                                    )}

                                                    <TouchableOpacity
                                                        onPress={() => handleDelete(item.date)}
                                                        className="bg-red-50 rounded-xl p-3 mt-2"
                                                    >
                                                        <Text className="text-center text-red-600 font-semibold text-sm">
                                                            Delete Check-in
                                                        </Text>
                                                    </TouchableOpacity>
                                                </View>
                                            )}

                                            <View className="items-center mt-2">
                                                <Text className="text-xs text-secondary">
                                                    {selectedItem?.date === item.date ? '↑ Tap to collapse' : '↓ Tap for details'}
                                                </Text>
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                    </ScrollView>
                </View>
            </Modal>
        </View>
    );
};

export default Log;