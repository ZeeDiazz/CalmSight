import {Text, TouchableOpacity, View} from "react-native";

interface DropdownCardProps {
    title: string;
    options: string[];
    selectedValue: string | null;
    onSelect: (value: string) => void;
}

const DropdownCard = ({title, options, selectedValue, onSelect}: DropdownCardProps) => {

    const handleSelect = (option: string) => {
        onSelect(option);
    };

    return (
        <View className="flex-col px-[3%] mb-[3%]">
            <View
                className="flex-auto justify-center rounded-xl border border-[#D9D9D9] bg-white p-[3%] min-h-[100px]"
            >
                <View className="flex-row justify-between items-center">
                    <Text className="text-[16px] font-semibold text-secondary-dark">
                        {title}
                    </Text>
                </View>

                <View className="flex-row mt-3">
                    {options.map((option, index) => (
                        <TouchableOpacity
                            key={index}
                            onPress={() => handleSelect(option)}
                            className={`px-4 py-3 rounded-lg border
                            ${selectedValue === option ? 'bg-primary border-primary' : 'bg-background-dark border-[#D9D9D9]'}`}
                        >
                            <Text className={`text-[12px] 
                                ${selectedValue === option ? 'text-white font-semibold' : 'text-secondary-dark'}`}
                            >
                                {option}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        </View>
    );
}
export default DropdownCard;