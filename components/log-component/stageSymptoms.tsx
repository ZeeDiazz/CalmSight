import {View, Text, TextInput, ScrollView, TouchableWithoutFeedback, Keyboard} from "react-native";

import {useEffect, useState} from "react";
import TextCard from "@/components/log-component/textCard";

interface StageSymptomsProps {
    selected: {
        symptoms: string[];
        notes: string;
    } | null;
    onUpdate: (data: { symptoms: string[]; notes: string }) => void;
}

const StageSymptoms = ({selected, onUpdate}: StageSymptomsProps) => {
    const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>(selected?.symptoms || []);
    const [notes, setNotes] = useState<string>(selected?.notes || '');

    useEffect(() => {
        setSelectedSymptoms(selected?.symptoms || []);
        setNotes(selected?.notes || '');
    }, [selected]);

    const symptoms = [
        {id: 'exhaustion', title: 'Exhaustion', subtext: 'Text'},
        {id: 'irritability', title: 'Irritability', subtext: 'Text'},
        {id: 'focusIssues', title: 'Focus Issues', subtext: 'Text'},
        {id: 'headaches', title: 'Headaches', subtext: 'Text'},
        {id: 'sleepProblems', title: 'Sleep Problems', subtext: 'Text'},
        {id: 'muscleTension', title: 'Muscle Tension', subtext: 'Text'},
    ];

    const handleSelect = (symptomId: string) => {
        const updated = selectedSymptoms.includes(symptomId)
            ? selectedSymptoms.filter(s => s !== symptomId)
            : [...selectedSymptoms, symptomId];

        setSelectedSymptoms(updated);
        onUpdate({symptoms: updated, notes});
    };

    const handleNotesChange = (text: string) => {
        setNotes(text);
        onUpdate({symptoms: selectedSymptoms, notes: text});
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <ScrollView>
                <Text className="text-[18px] font-bold text-secondary-dark mb-[5%] pt-[10%] pl-[5%]">Symptoms</Text>
                <View className="flex-row flex-wrap justify-center gap-y-3">
                    {symptoms.map((symptom) => (
                        <View key={symptom.id} className="w-[48%]">
                            <TextCard
                                title={symptom.title}
                                subtext={symptom.subtext}
                                isSelected={selectedSymptoms.includes(symptom.id)}
                                onPress={() => handleSelect(symptom.id)}
                            />
                        </View>
                    ))}
                </View>

                <View className="px-[5%] mt-[2%]">
                    <Text className="text-[16px] font-semibold text-secondary-dark mb-[3%]">
                        Anything you want to note?
                    </Text>
                    <TextInput
                        value={notes}
                        onChangeText={handleNotesChange}
                        placeholder="I have been..."
                        placeholderTextColor="#9CA3AF"
                        multiline
                        className="bg-background-dark rounded-xl border border-[#D9D9D9] p-4 min-h-[100px] text-secondary-dark text-[14px]"
                        textAlignVertical="top"
                    />
                </View>
            </ScrollView>
        </TouchableWithoutFeedback>
    );
};

export default StageSymptoms;