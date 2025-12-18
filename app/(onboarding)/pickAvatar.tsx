import {View, Text, TouchableOpacity, Image} from "react-native";
import {useRouter} from "expo-router";
import React, {useState} from "react";

const PickAvatar = () => {
    const router = useRouter();
    const [selectedAvatar, setSelectedAvatar] = useState<number | null>(null);


    const avatars = [
        {id: 1, source: require('@/assets/images/avatar1.png')},
        {id: 2, source: require('@/assets/images/avatar2.png')},
        /*TODO: Add more icons*/
    ];

    const handleRoute = () => {
        // TODO: Save selected avatar
        router.replace("/(screens)");
    };

    return (
        <View className="flex-1 bg-background pt-[12%] px-[3%]">
            <Text className="text-3xl font-black text-secondary-dark mt-4 mb-5">
                Pick an Avatar
            </Text>

            <View className="flex-1 flex-row flex-wrap justify-between mb-8">
                {avatars.map((avatar) => (
                    <TouchableOpacity
                        key={avatar.id}
                        onPress={() => setSelectedAvatar(avatar.id)}
                        className="w-[45%] mb-6 items-center justify-center"
                    >
                        <Image className={` ${selectedAvatar === avatar.id ? 'rounded-full border-4 border-primary'
                            : ''}`} source={avatar.source}/>
                    </TouchableOpacity>
                ))}
            </View>

            <View className="absolute bottom-[5%] left-0 right-0 items-center">
                <TouchableOpacity
                    onPress={handleRoute}
                    disabled={selectedAvatar === null}
                    className={`rounded-xl p-5 items-center justify-center border border-[#D9D9D9] w-[48%] ${selectedAvatar === null ? 'bg-gray-300' : 'bg-primary'}`}>
                    <Text className="text-center text-[15px] text-white">Continue</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default PickAvatar;