import {View, Text, ScrollView, Image, TouchableOpacity, Switch} from "react-native";
import React, {useState, useEffect} from "react";
import HorizontalSelector from "@/components/horizontalSelector";

const Profile = () => {
    // User info
    const [userName, setUserName] = useState("Mark Bo Jensen");
    const [userSince, setUserSince] = useState("25 November 2025");
    const [avatarId, setAvatarId] = useState(1);

    // Settings
    const [trackingFrequency, setTrackingFrequency] = useState(3);
    const [appleHealth, setAppleHealth] = useState(false);
    const [calendarAccess, setCalendarAccess] = useState(false);
    const [notifications, setNotifications] = useState(false);
    const [notificationLimit, setNotificationLimit] = useState(3);
    const [checkInReminder, setCheckInReminder] = useState(false);
    const [selectedTheme, setSelectedTheme] = useState<'light' | 'dark'>('light');


    const ToggleSwitch = ({ value, onToggle }: { value: boolean; onToggle: () => void }) => (
        <TouchableOpacity
            onPress={onToggle}
            className={`w-12 h-6 rounded-full justify-center ${value ? 'bg-primary' : 'bg-background-dark'}`}
        >
            <View className={`w-5 h-5 rounded-full bg-white ${value ? 'ml-[55%]' : 'ml-[9%]'}`} />
        </TouchableOpacity>
    );

    // TODO: Load user data from backend

    const getAvatarSource = () => {
        const avatarMap: { [key: number]: any } = {
            1: require('@/assets/images/avatar1.png'),
            2: require('@/assets/images/avatar2.png')
        };
        return avatarMap[avatarId] || avatarMap[1];
    };



    return (
        <View className="flex-1 bg-background pt-[12%] px-[3%]">
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 80 }}>

                <View className="flex-row flex-wrap  items-center pt-6 gap-4 mb-6">
                    <View className="w-32 h-32">
                        <Image
                            source={getAvatarSource()}
                            className="w-full h-full"
                            resizeMode="cover"
                        />
                    </View>
                    <View>
                        <Text className="text-2xl font-bold text-secondary-dark mb-1">
                            {userName}
                        </Text>
                        <Text className="text-sm text-secondary">
                            Since {userSince}
                        </Text>
                    </View>
                </View>

                <View className="h-2 bg-background-dark"/>

                <View className="pt-3">
                    <Text className="text-base font-bold text-secondary-dark mb-4">
                        General
                    </Text>
                    <View className="flex-1 gap-4">
                        <View className="py-4 border-b border-[#D9D9D9]">
                            <Text className="text-secondary-dark text-base mb-2">Tracking frequency</Text>
                            <HorizontalSelector
                                options={[1,2,3,4,5,6,7]}
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
                                options={[1,2,3,4,5]}
                                selectedValue={notificationLimit}
                                onSelect={(value) => setNotificationLimit(value as number)}
                            />
                        </View>

                        <View className="flex-row justify-between items-center py-4 border-b border-[#D9D9D9]">
                            <Text className="text-secondary-dark text-base">Check-in Reminder</Text>
                            <ToggleSwitch value={checkInReminder} onToggle={() => setCheckInReminder(!checkInReminder)} />
                        </View>
                    </View>
                </View>

                {/* Divider */}
                <View className="h-2 bg-background-dark" />

                {/* Theme Section */}
                <View className="px-[3%]">
                    <Text className="text-base font-bold text-secondary-dark mb-4">
                        Theme
                    </Text>

                    <View className="flex-row gap-4">
                        {/* Light Theme */}
                        <TouchableOpacity
                            onPress={() => setSelectedTheme('light')}
                            className="flex-1"
                        >
                            <View className={`rounded-xl overflow-hidden border-3 ${
                                selectedTheme === 'light'
                                    ? 'border-primary'
                                    : 'border-gray-200'
                            }`}>
                                <View className="bg-white p-6 h-32 justify-center items-center">
                                    <View className="w-12 h-12 rounded-full bg-primary/20" />
                                    <View className="w-16 h-2 bg-gray-200 mt-3 rounded" />
                                    <View className="w-12 h-2 bg-gray-100 mt-2 rounded" />
                                </View>
                                <View className="bg-gray-50 py-2">
                                    <Text className="text-xs text-center text-secondary-dark font-semibold">
                                        Light
                                    </Text>
                                </View>
                            </View>
                        </TouchableOpacity>

                        {/* Dark Theme */}
                        <TouchableOpacity
                            onPress={() => setSelectedTheme('dark')}
                            className="flex-1"
                        >
                            <View className={`rounded-xl overflow-hidden border-3 ${
                                selectedTheme === 'dark'
                                    ? 'border-primary'
                                    : 'border-gray-200'
                            }`}>
                                <View className="bg-[#1F2A30] p-6 h-32 justify-center items-center">
                                    <View className="w-12 h-12 rounded-full bg-primary/30" />
                                    <View className="w-16 h-2 bg-gray-600 mt-3 rounded" />
                                    <View className="w-12 h-2 bg-gray-700 mt-2 rounded" />
                                </View>
                                <View className="bg-gray-800 py-2">
                                    <Text className="text-xs text-center text-white font-semibold">
                                        Dark
                                    </Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

export default Profile;