import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import React, {useEffect, useState} from "react";
import HorizontalSelector from "@/components/horizontalSelector";
import {useHealthService} from "@/hooks/useHealthService";
import {DemoHealthConnectWrite} from "@/components/demoHealthConnectWrite";

const Setup = () => {
    const router = useRouter();
    //TODO: Make the settings functional if there is time
    const [trackingFrequency, setTrackingFrequency] = useState(3);
    const [health, setHealth] = useState(false);
    const [healthError, setHealthError] = useState<string | null>(null);
    const [calendarAccess, setCalendarAccess] = useState(false);
    const [notifications, setNotifications] = useState(false);
    const [notificationLimit, setNotificationLimit] = useState(3);
    const [checkInReminder, setCheckInReminder] = useState(false);

    const {status, permissionsGranted, requestPermissions} = useHealthService();

    const frequencyOptions= [1, 2, 3, 4, 5, 7];
    const notificationOptions= [1, 2, 3, 4, 5];

    useEffect(() => {
        if (permissionsGranted && status === 'available') {
            setHealth(true);
        }
    }, [permissionsGranted, status]);

    const handleRoute= ()=> {
        router.push("/(onboarding)/login");
    };

    const ToggleSwitch = ({ value, onToggle, disabled }: { value: boolean; onToggle: () => void; disabled?: boolean; }) => (
        <TouchableOpacity
            onPress={onToggle}
            disabled={disabled}
            className={`w-12 h-6 rounded-full justify-center ${value ? 'bg-primary' : 'bg-background-dark'}`}
        >
            <View className={`w-5 h-5 rounded-full bg-white ${value ? 'ml-[55%]' : 'ml-[9%]'}`} />
        </TouchableOpacity>
    );

    const handleHealthToggle = async () => {
        setHealthError(null);

        if (!health) {
            try {
                const granted = await requestPermissions();

                if (granted) {
                    setHealth(true);
                } else {
                    setHealth(false);
                    setHealthError('Permission denied. You can enable this later in Settings.');
                }
            } catch{
                setHealth(false);
                setHealthError('Failed to request permissions. Please try again.');
            }
        } else {
            setHealth(false);
            setHealthError('Failed to request permissions. Please try again.');
        }
    };

    return (
        <View className="flex-1 bg-background pt-[12%] px-[3%]">
            <Text className="text-3xl font-black text-secondary-dark mt-4 mb-5">
                Setup Settings
            </Text>

            <View className="flex-1 gap-4">
                <View className="py-4 border-b border-[#D9D9D9]">
                    <Text className="text-secondary-dark text-base mb-2">Tracking frequency</Text>
                    <HorizontalSelector
                        options={frequencyOptions}
                        selectedValue={trackingFrequency}
                        onSelect={(value) => setTrackingFrequency(value as number)}
                    />
                </View>

                <View className="flex-row justify-between items-center py-4 border-b border-[#D9D9D9]">
                    <Text className="text-secondary-dark text-base">Apple Health/ Google Fit</Text>
                    <ToggleSwitch value={health} onToggle={handleHealthToggle} />
                </View>
                {health && <DemoHealthConnectWrite />}

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