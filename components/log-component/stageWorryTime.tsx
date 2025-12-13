import {Text, View} from "react-native";
import TextCard from "@/components/log-component/textCard";


const StageWorryTime = () => {

    const options = [
        { title: 'Minimal', subtext: 'Less than 1 hour'},
        { title: 'Moderate', subtext: '1-3 hours'},
        { title: 'Significant', subtext: '3-5 hours'},
        { title: 'Overwhelming', subtext: 'More than 5 hours'},
    ];

    return (
        <View >
            <Text className="text-[18px] font-semibold text-secondary-dark mb-[5%] pt-[10%] pl-[5%]">
                Time Spent Worrying
            </Text>
            {
                options.map((option, index) => (
                    <TextCard key={index} title={option.title} subtext={option.subtext}></TextCard>
                ))
            }
        </View>
    );
};

export default StageWorryTime;