import {Text, TouchableOpacity, View} from "react-native";
import React from "react";

interface HorizontalSelectorProps {
    options: number[];
    selectedValue: number;
    onSelect: (value: number) => void;
}

const HorizontalSelector = ({options, selectedValue, onSelect}: HorizontalSelectorProps) => {
    return (
        <View className="flex-row mt-3 gap-2 justify-center">
            {options.map((option, index) => (
                <TouchableOpacity key={index}
                                  onPress={() => onSelect(option)}
                                  className={`px-4 py-3 rounded-lg border ${selectedValue === option ? "bg-primary border-primary" : "bg-white border-[#D9D9D9]"}`}
                >
                    <Text className={`text-[12px] ${selectedValue === option ? "text-white font-semibold" : "text-secondary-dark"}`}>
                        {option}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    );
};

export default HorizontalSelector;