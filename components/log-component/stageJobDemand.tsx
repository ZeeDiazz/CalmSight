import {ScrollView, Text, View} from "react-native";
import {useEffect, useState} from "react";
import DropdownCard from "./dropdownCard";

interface StageJobDemandProps {
    selected: Record<string, string> | null;
    onUpdate: (data: Record<string, string>) => void;
}

const StageJobDemand = ({ selected, onUpdate }: StageJobDemandProps) => {

    const [localSelections, setLocalSelections] = useState<Record<string, string>>(selected || {});

    useEffect(() => {
        setLocalSelections(selected || {});
    }, [selected]);

    const copingStrategies = [
        { id: 'workloadToday', title: 'Workload today' },
        { id: 'controlOverTasks', title: 'Control over tasks' },
        { id: 'socialSupport', title: 'Social support' }
    ];

    const frequencyOptions = ['Lowest', 'Low', 'Moderate', 'High', 'Highest'];

    const handleDropdownSelect = (strategyId: string, value: string) => {
        const updated = { ...localSelections, [strategyId]: value };
        setLocalSelections(updated);
        onUpdate(updated);
    };

    return (
        <View>
            <Text className="text-[18px] font-bold text-secondary-dark mb-[5%] pt-[10%] pl-[5%]">Job demands & Control</Text>
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

export default StageJobDemand;