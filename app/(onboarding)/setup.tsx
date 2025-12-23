import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import HorizontalSelector from "@/components/horizontalSelector";

const Setup = () => {
    const router = useRouter();
    //TODO: Make the settings functional if there is time
    const [trackingFrequency, setTrackingFrequency] = useState(3);
    const [appleHealth, setAppleHealth] = useState(false);
    const [calendarAccess, setCalendarAccess] = useState(false);
    const [notifications, setNotifications] = useState(false);
    const [notificationLimit, setNotificationLimit] = useState(3);
    const [checkInReminder, setCheckInReminder] = useState(false);

    const frequencyOptions= [1, 2, 3, 4, 5, 7];
    const notificationOptions= [1, 2, 3, 4, 5];

    const handleRoute= ()=> {
        router.push("/(onboarding)/login");
    };


    const ToggleSwitch = ({ value, onToggle }: { value: boolean; onToggle: () => void }) => (
        <TouchableOpacity
            onPress={onToggle}
            className={`w-12 h-6 rounded-full justify-center ${value ? 'bg-primary' : 'bg-background-dark'}`}
        >
            <View className={`w-5 h-5 rounded-full bg-white ${value ? 'ml-[55%]' : 'ml-[9%]'}`} />
        </TouchableOpacity>
    );

    return (
        <View className="flex-1 bg-background pt-[12%] px-[3%]">
            <Text className="text-3xl font-black text-secondary-dark mt-4 mb-5">
                Setup Settings
            </Text>

            <View className="flex-1 gap-4">
                <View className="py-4 border-b border-[#D9D9D9]">
                    <Text className="text-secondary-dark text-base mb-2">Tracking frequency</Text>
                    {/*<Dropdown value={trackingFrequency} />*/}
                    <HorizontalSelector
                        options={frequencyOptions}
                        selectedValue={trackingFrequency}
                        onSelect={(value) => setTrackingFrequency(value as number)}
                    />
                </View>

                <View className="flex-row justify-between items-center py-4 border-b border-[#D9D9D9]">
                    <Text className="text-secondary-dark text-base">Apple Health/ Google Fit</Text>
                    <ToggleSwitch value={appleHealth} onToggle={() => setAppleHealth(!appleHealth)} />
                </View>

                <View className="flex-row justify-between items-center py-4 border-b border-[#D9D9D9]">
                    <Text className="text-secondary-dark text-base">Calender Access</Text>
                    <ToggleSwitch value={calendarAccess} onToggle={() => setCalendarAccess(!calendarAccess)} />
                </View>

                <View className="flex-row justify-between items-center py-4 border-b border-[#D9D9D9]">
                    <Text className="text-secondary-dark text-base">Notifications</Text>
                    <ToggleSwitch value={notifications} onToggle={() => setNotifications(!notifications)} />
                </View>

                <View className="py-4 border-b border-[#D9D9D9]">
                    <Text className="text-secondary-dark text-base">Daily Notification limit</Text>
                    <HorizontalSelector
                        options={notificationOptions}
                        selectedValue={notificationLimit}
                        onSelect={(value) => setNotificationLimit(value as number)}
                    />
                </View>

                <View className="flex-row justify-between items-center py-4 border-b border-[#D9D9D9]">
                    <Text className="text-secondary-dark text-base">Check-in Reminder</Text>
                    <ToggleSwitch value={checkInReminder} onToggle={() => setCheckInReminder(!checkInReminder)} />
                </View>
            </View>

            <View className="absolute bottom-[5%] left-0 right-0 items-center">
                <TouchableOpacity
                    onPress={handleRoute}
                    className="rounded-xl p-5 items-center justify-center border border-[#D9D9D9] w-[48%] bg-primary">
                    <Text className="text-center text-[15px] text-white">Continue</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default Setup;