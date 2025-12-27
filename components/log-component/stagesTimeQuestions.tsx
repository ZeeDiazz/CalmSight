import {Text, View} from "react-native";
import TextCard from "@/components/log-component/textCard";
import {useEffect, useState} from "react";

interface StageTimeQuestionProps {
    title: string;
    selected: string | null;
    onUpdate: (value: string) => void;
}

const StageTimeQuestion = ({ title, selected, onUpdate }: StageTimeQuestionProps) => {
    const [localSelected, setLocalSelected] = useState(selected);

    //EveryTime the selected is changed the state gets updated
    useEffect(() => {
        setLocalSelected(selected);
    }, [selected]);

    const handleSelect = (value: string) => {
        setLocalSelected(value);
        onUpdate(value);
    };

    const options = [
        {id:'minimal', title: 'Minimal', subtext: 'Less than 1 hour'},
        {id:'moderate', title: 'Moderate', subtext: '1-3 hours'},
        {id:'significant', title: 'Significant', subtext: '3-5 hours'},
        {id:'overwhelming', title: 'Overwhelming', subtext: 'More than 5 hours'},
    ];

    return (
        <View>
            <Text className="text-[18px] font-bold text-secondary-dark mb-[5%] pt-[3%] pl-[5%]">{title}</Text>
            {
                options.map((option) => (
                    <TextCard
                        key={option.id}
                        title={option.title}
                        subtext={option.subtext}
                        isSelected={localSelected === option.id}
                        onPress={() => handleSelect(option.id)}
                    />
                ))
            }
        </View>
    );
};

export default StageTimeQuestion;