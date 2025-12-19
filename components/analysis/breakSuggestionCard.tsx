import {View, Text, TouchableOpacity} from "react-native";

interface BreakSuggestionCardProps {
    title: string;
    times: string[];
    onAccept: () => void;
    onDecline: () => void;
}

const BreakSuggestionCard = ({title, times, onAccept, onDecline}: BreakSuggestionCardProps) => {
    return (
        <View className="bg-white rounded-xl p-5 border border-[#D9D9D9]">
            <Text className="text-base font-bold text-secondary-dark mb-4">
                ADD A BREAK TOMORROW
            </Text>

            <Text className="text-sm text-secondary-dark mb-2 text-center">
                {title}
            </Text>

            <Text className="text-sm text-secondary text-center mb-5">
                {times.join(' & ')}
            </Text>

            <View className="flex-row gap-3">
                <TouchableOpacity
                    onPress={onDecline}
                    className="flex-1 bg-background-dark border-2 border-[#D9D9D9] rounded-full py-3 items-center"
                >
                    <Text className="text-sm font-bold text-secondary-dark">
                        DECLINE
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={onAccept}
                    className="flex-1 bg-primary rounded-full py-3 items-center"
                >
                    <Text className="text-sm font-bold text-white">
                        ACCEPT
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default BreakSuggestionCard;