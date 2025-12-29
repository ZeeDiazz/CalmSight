import {ScrollView, Text, View} from "react-native";
import {useEffect, useState} from "react";
import DropdownCard from "./dropdownCard";

interface StageCopingProps {
    selected: Record<string, string> | null;
    onUpdate: (data: Record<string, string>) => void;
}

const StageCoping = ({ selected, onUpdate }: StageCopingProps) => {

    const [localSelections, setLocalSelections] = useState<Record<string, string>>(selected || {});

    useEffect(() => {
        setLocalSelections(selected || {});
    }, [selected]);

    const copingStrategies = [
        { id: 'avoidedSituations', title: 'Avoided situations' },
        { id: 'avoidingThoughts', title: 'Avoiding thoughts' },
        { id: 'alcoholPills', title: 'Used alcohol/pills' },
        { id: 'soughtReassurance', title: 'Sought reassurance' },
        { id: 'controlledMyEmotions', title: 'Controlled my emotions' },
        { id: 'monitorMySymptoms', title: 'Monitor my symptoms' },
    ];

    const frequencyOptions = ['Never', 'Rarely', 'Moderate', 'Often', 'Always'];

    const handleDropdownSelect = (strategyId: string, value: string) => {
        const updated = { ...localSelections, [strategyId]: value };
        setLocalSelections(updated);
        onUpdate(updated);
    };

    return (
        <View>
            <Text className="text-[18px] font-bold text-secondary-dark mb-[5%] pt-[3%] pl-[5%]">How often have you used these to cope?</Text>
            <ScrollView showsVerticalScrollIndicator={true} className="overflow-hidden h-[70%]">
            {copingStrategies.map((strategy) => (
                <DropdownCard
                    key={strategy.id}
                    title={strategy.title}
                    options={frequencyOptions}
                    selectedValue={localSelections[strategy.id]}
                    onSelect={(value) => handleDropdownSelect(strategy.id, value)}
                />
            ))}
            </ScrollView>
        </View>
    );
};

export default StageCoping;