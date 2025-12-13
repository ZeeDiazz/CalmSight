import {Text, View} from "react-native";


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

        return (<Text>
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
    <View className="bg-background-dark rounded-xl border border-[#D9D9D9]">
        <Text> {title}</Text>
        {renderSubText()}
        {renderDropdownList()}
    </View>
    );
}

export default TextCard;