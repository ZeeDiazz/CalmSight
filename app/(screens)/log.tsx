import {View, Text, TouchableOpacity} from 'react-native';
import React, {useState} from 'react';
import StageMood from "@/components/log-component/stageMood";
import StageCoping from "@/components/log-component/stageCoping";
import StageSymptoms from "@/components/log-component/stageSymptoms";
import StageJobDemand from "@/components/log-component/stageJobDemand";
import {useRouter} from "expo-router";
import StageTimeQuestion from "@/components/log-component/stagesTimeQuestions";

export interface CheckInData {
    type: 'daily' | 'weekly';
    mood: string | null;
    worryTime: string | null;
    threatMonitoring: string | null;
}

const Log = () => {
    const router = useRouter();

    const totalStages = 6;
    const [currentStage, setCurrentStage] = useState(1);

    const [checkInType, setCheckInType] = useState<'daily' | 'weekly'>('daily');

    const [checkInData, setCheckInData] = useState<CheckInData>({
        type: 'daily',
        mood: null,
        worryTime: null,
        threatMonitoring: null
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
                return(<StageJobDemand/>);
            case 5:
                return(<StageCoping/>);
            case 6:
                return(<StageSymptoms/>);
            default:
                return (
                    <StageMood checkInType={checkInData.type} selected={checkInData.mood}
                               onUpdate={(mood) => updateStageData({mood})}/>);
        }
    };

    const handleSave = () => {
        try {
            //TODO: send to backend
            console.log(checkInData);
            setCurrentStage(1);
            router.push('/(screens)');
        }
        catch (error) {
            console.error('Error saving user-log:', error);
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
    }

    return (
        <View className="flex-1 bg-background pt-12">
            <View className="mt-4 mb-5 px-4">
                <Text className="text-3xl font-black text-secondary-dark">
                    Check-In
                </Text>
            </View>
            {/* Top toggle between daily and weekly */}
            {currentStage ===1 ?
                <View className="absolute top-[12%] left-0 right-0  flex-row justify-center gap-3">
                    <TouchableOpacity
                        onPress={() => {
                            setCheckInType('daily');
                            updateStageData({ type: 'daily' });
                        }}
                        className={`${checkInType === 'daily' ? 'bg-primary' : 'bg-background-dark'} rounded-xl p-5 items-center justify-center border border-[#D9D9D9] min-h-[5%] min-w-[45%]`}>
                        <Text className={`${checkInType === 'daily' ? 'text-white': 'text-secondary-dark' }  text-center text-secondary-dark text-[15px]`}>Daily</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => {
                            setCheckInType('weekly');
                            updateStageData({ type: 'weekly' });
                        }}
                        className={`${checkInType === 'weekly' ? 'bg-primary' : 'bg-background-dark'} rounded-xl p-5 items-center justify-center border border-[#D9D9D9] min-h-[5%] min-w-[45%]`}>
                        <Text className={`${checkInType === 'weekly' ? 'text-white': 'text-secondary-dark' } text-center  text-[15px]`}>Weekly</Text>
                    </TouchableOpacity>
                </View>
                :
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
                    <View key={index} className={`w-3 h-3 rounded-full ${ index + 1 < currentStage ? 'bg-primary-dark'
                            : (index + 1 === currentStage
                                ? 'bg-primary'
                                : 'bg-background-dark')
                    }`}></View>
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
}
export default Log;