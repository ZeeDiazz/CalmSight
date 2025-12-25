import {View, Text, TouchableOpacity} from "react-native";
import {useState} from "react";

interface MoodProp {
    checkInType: "daily" | "weekly";
    selected: string | null; //null, because it is unselected in the beginning
    onUpdate: (mood: string) => void;
}

const StageMood = ({checkInType, selected, onUpdate}:MoodProp) => {
    const [localSelected, setLocalSelected] = useState(selected);

    const handleSelect = (moodId: string) => {
        setLocalSelected(moodId);
        onUpdate(moodId);
    };

    const moodOptions = [
        { id: 'overwhelmed', label: 'Overwhelmed', emoji: '😰' },
        { id: 'drained', label: 'Drained', emoji: '😔' },
        { id: 'neutral', label: 'Neutral', emoji: '😐' },
        { id: 'energized', label: 'Energized', emoji: '🤩' },
    ];

    return (
        <View>
            <Text className="text-[18px] font-bold text-secondary-dark mb-[5%] pt-[7%] pl-[5%]">
                {checkInType === 'daily'?
                    'How are you feeling today?' : 'How did you feel this week?'}
            </Text>

            <View className="gap-3 pl-[5%] pr-[5%]">
                <View className="flex-row gap-3 flex-wrap">
                    {moodOptions.map(mood => (
                        <TouchableOpacity
                            key={mood.id}
                            onPress={() => handleSelect(mood.id)}
                            className="w-[48%]">
                            <View
                                className={`rounded-2xl items-center justify-center min-h-[150px] border ${localSelected === mood.id ?
                                        'bg-primary/10 border-primary' : 'bg-background-dark border-[#D9D9D9]'}`}>
                                <Text className="text-[60px] mb-4">{mood.emoji}</Text>
                                <Text
                                    className={`text-[14px] font-semibold ${localSelected === mood.id ?
                                        'text-primary' : 'text-secondary'}`}>
                                    {mood.label}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        </View>
    );
};

export default StageMood;