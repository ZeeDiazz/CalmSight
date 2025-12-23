import {View, Text, TouchableOpacity} from 'react-native';
import React from 'react';

interface CardProps {
    value: string;
    label: string;
    textColor: string;
    onPress?: () => void;
}

const Card = ({ value, label, textColor}: CardProps) => {
    return (
        <View className="flex-1">
            <TouchableOpacity className="bg-background-dark rounded-xl p-5 items-center justify-center min-h-[100px] border border-[#D9D9D9]">
                <Text className={`text-[24px] font-semibold ${textColor} mb-2`}>
                    {value}
                </Text>
                <Text className="text-[11px] text-secondary text-center">
                    {label}
                </Text>
            </TouchableOpacity>
        </View>);
}

export default Card;