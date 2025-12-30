import {Text, TouchableOpacity, View} from "react-native";

interface TextCardProps {
    title: string;
    subtext?: string;
    isSelected?: boolean;
    onPress?: () => void;
}

const TextCard = ({ title, subtext, isSelected = false, onPress }:TextCardProps) => {
    return(
    <View className="flex-col px-[3%] mb-[3%]">
        <TouchableOpacity
            onPress={onPress}
            className={`flex-auto justify-center bg-white rounded-xl border border-[#D9D9D9] p-[3%] min-h-[100px] 
                ${isSelected? 'bg-primary/10 border-primary'
                : 'bg-white border-[#D9D9D9]'}`}
        >
            <Text className={`text-[16px] font-semibold mb-[2%] 
                ${ isSelected ? 'text-primary' : 'text-secondary-dark'}`}
            >
                {title}
            </Text>
            {subtext && (
                <Text className="text-secondary text-[13px]">
                    {subtext}
                </Text>
            )}
        </TouchableOpacity>
    </View>
    );
}

export default TextCard;