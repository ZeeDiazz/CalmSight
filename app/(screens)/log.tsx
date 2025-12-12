import {View, Text, TouchableOpacity} from 'react-native';
import React, {useState} from 'react';

export interface CheckInData {
    type: 'daily' | 'weekly';
}

const Log = () => {

    const [checkInType, setCheckInType] = useState<'daily' | 'weekly'>('daily');

    const [checkInData, setCheckInData] = useState<CheckInData>({
        type: 'daily',
    });

    const updateStageData = (stageData: Partial<CheckInData>) => {
        setCheckInData(prev => ({ ...prev, ...stageData }));
    };

    return (
        <View className="flex-1 bg-background pt-12">
            <View className="mt-4 mb-5 px-4">
                <Text className="text-3xl font-black text-secondary-dark">
                    Check-In
                </Text>
            </View>
            {/* Top toggle between daily and weekly */}
            <View className="flex-row justify-center gap-3">
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

            {/* Check-in stages*/}
            <View></View>

            {/*Stage navigation buttons*/}
            <View className="flex-row justify-center gap-3">
                <TouchableOpacity className="bg-background-dark rounded-xl p-5 items-center justify-center border border-[#D9D9D9] min-h-[5%] min-w-[45%]">
                    <Text className="text-center text-secondary text-[15px]">Back</Text>
                </TouchableOpacity>
                <TouchableOpacity className="bg-primary rounded-xl p-5 items-center justify-center border border-[#D9D9D9] min-h-[5%] min-w-[45%]">
                    <Text className="text-center text-white text-[15px]">Next</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
export default Log;