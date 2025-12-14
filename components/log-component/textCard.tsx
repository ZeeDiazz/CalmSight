import {Text, TouchableOpacity, View} from "react-native";


interface TextCardProps {
    title: string;
    subtext?: string;
    dropdownList?: string[];
}


const TextCard = ({title, subtext, dropdownList}:TextCardProps) => {
    const renderSubText = () => {
        if (subtext === undefined) {
            return;
        }

        return (<Text className="text-secondary text-[13px]">
            {subtext}
        </Text>);
    };

    const renderDropdownList = () =>{
        if (dropdownList === undefined) {
            return;
        }

        return (<Text>
            {subtext}
        </Text>);
    };

    return(
    <View className="flex-col px-[3%] mb-[3%]">
        <TouchableOpacity className="flex-auto justify-center bg-background-dark rounded-xl border border-[#D9D9D9] p-[3%] min-h-[100px]">
            <Text className="text-[16px] font-semibold text-secondary-dark mb-[2%]">{title}</Text>
            {renderSubText()}
            {renderDropdownList()}
        </TouchableOpacity>
    </View>
    );
}

export default TextCard;