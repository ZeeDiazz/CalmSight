import React from 'react';
import { View, Text } from 'react-native';

interface PatternAlertCardProps {
    type: string;
    message: string;
}

const PatternAlertCard = ({ type, message }: PatternAlertCardProps) => {
    const isPositive = type === 'positive';

    const title = isPositive ? 'Positive Pattern Detected' : 'Negative Pattern Detected';
    const bgColor = isPositive ? 'bg-[#D1F4E0]' : 'bg-[#F5DCC8]';
    const borderColor = isPositive ? 'border-[#A7E8C4]' : 'border-[#E8C4A7]';
    const titleColor = isPositive ? 'text-secondary-dark' : 'text-[#8B5A3C]';

    return (
        <View className={`${bgColor} ${borderColor} border rounded-xl p-4 mb-6`}>
            <Text className={`text-[18px] font-semibold ${titleColor} text-center mb-1.5`}>
                {title}
            </Text>
            <Text className="text-sm text-secondary text-center leading-5">
                {message}
            </Text>
        </View>
    );
}
export default PatternAlertCard;