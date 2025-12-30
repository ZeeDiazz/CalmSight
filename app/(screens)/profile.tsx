import {View, Text, ScrollView, Image, TouchableOpacity} from "react-native";
import React, {useState} from "react";
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
            className={`w-14 h-8 rounded-full justify-center ${value ? 'bg-primary' : 'bg-background-dark'}`}
        >
            <View className={`w-6 h-6 rounded-full bg-white ${value ? 'ml-7' : 'ml-1'}`}/>
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

    const handleDeleteData = () => {

    };

    const handleImportData = () => {

    };

    const handleExportData = () => {

    };

    return (
        <View className="flex-1 bg-background">
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
                <View className="bg-white pt-[12%] pb-8 px-6 mb-4">
                    <View className="flex-row items-center gap-5">
                        <View className="w-32 h-32 rounded-full overflow-hidden">
                            <Image
                                source={getAvatarSource()}
                                className="w-full h-full"
                                resizeMode="cover"
                            />
                        </View>
                        <View className="flex-1">
                            <Text className="text-2xl font-black text-secondary-dark mb-1">
                                {userName}
                            </Text>
                            <Text className="text-sm text-secondary">
                                Member since {userSince}
                            </Text>
                        </View>
                    </View>
                </View>

                <View className="px-[3%]">
                    <View className="mb-6">
                        <Text className="text-xs font-bold text-secondary uppercase tracking-wider mb-3 px-1">
                            general
                        </Text>
                        <View className="bg-white rounded-2xl overflow-hidden">
                            <View className="p-5 border-b border-[#D9D9D9]">
                                <Text className="text-base font-semibold text-secondary-dark mb-3">
                                    Check-ins per week
                                </Text>
                                <HorizontalSelector
                                    options={[1,2,3,4,5,6,7]}
                                    selectedValue={trackingFrequency}
                                    onSelect={(value) => setTrackingFrequency(value as number)}
                                />
                                <Text className="text-xs text-secondary mt-2">
                                    Currently tracking {trackingFrequency} {trackingFrequency === 1 ? 'time' : 'times'} per week
                                </Text>
                            </View>

                            <View className="p-5 border-b border-[#D9D9D9]">
                                <View className="flex-row justify-between items-center">
                                    <View className="flex-1 pr-4">
                                        <Text className="text-base font-semibold text-secondary-dark mb-1">
                                            Health Data Sync
                                        </Text>
                                        <Text className="text-xs text-secondary">
                                            Apple Health / Google Fit integration
                                        </Text>
                                    </View>
                                    <ToggleSwitch value={appleHealth} onToggle={() => setAppleHealth(!appleHealth)} />
                                </View>
                            </View>

                            <View className="p-5">
                                <View className="flex-row justify-between items-center">
                                    <View className="flex-1 pr-4">
                                        <Text className="text-base font-semibold text-secondary-dark mb-1">
                                            Calendar Access
                                        </Text>
                                        <Text className="text-xs text-secondary">
                                            Schedule breaks and reminders
                                        </Text>
                                    </View>
                                    <ToggleSwitch value={calendarAccess} onToggle={() => setCalendarAccess(!calendarAccess)} />
                                </View>
                            </View>
                        </View>
                    </View>

                    <View className="mb-6">
                        <Text className="text-xs font-bold text-secondary uppercase tracking-wider mb-3 px-1">
                            Notifications
                        </Text>
                        <View className="bg-white rounded-2xl overflow-hidden">
                            <View className="p-5 border-b border-[#D9D9D9]">
                                <View className="flex-row justify-between items-center">
                                    <View className="flex-1 pr-4">
                                        <Text className="text-base font-semibold text-secondary-dark mb-1">
                                            Push Notifications
                                        </Text>
                                        <Text className="text-xs text-secondary">
                                            Receive alerts and reminders
                                        </Text>
                                    </View>
                                    <ToggleSwitch value={notifications} onToggle={() => setNotifications(!notifications)} />
                                </View>
                            </View>

                            {notifications && (
                                <View className="p-5 border-b border-[#D9D9D9] bg-background-dark">
                                    <Text className="text-base font-semibold text-secondary-dark mb-3">
                                        Daily notification limit
                                    </Text>
                                    <HorizontalSelector
                                        options={[1,2,3,4,5]}
                                        selectedValue={notificationLimit}
                                        onSelect={(value) => setNotificationLimit(value as number)}
                                    />
                                    <Text className="text-xs text-secondary mt-2">
                                        Maximum {notificationLimit} {notificationLimit === 1 ? 'notification' : 'notifications'} per day
                                    </Text>
                                </View>
                            )}

                            <View className="p-5">
                                <View className="flex-row justify-between items-center">
                                    <View className="flex-1 pr-4">
                                        <Text className="text-base font-semibold text-secondary-dark mb-1">
                                            Check-in Reminder
                                        </Text>
                                        <Text className="text-xs text-secondary">
                                            Daily reminder to complete check-in
                                        </Text>
                                    </View>
                                    <ToggleSwitch value={checkInReminder} onToggle={() => setCheckInReminder(!checkInReminder)} />
                                </View>
                            </View>
                        </View>
                    </View>

                    <View className="mb-6">
                        <Text className="text-xs font-bold text-secondary uppercase tracking-wider mb-3 px-1">
                            Data Management
                        </Text>
                        <View className="bg-white rounded-2xl overflow-hidden">
                            <TouchableOpacity
                                onPress={handleExportData}
                                className="p-5 border-b border-[#D9D9D9]"
                                activeOpacity={0.7}
                            >
                                <View className="flex-row items-center justify-between">
                                    <View className="flex-1 pr-4">
                                        <Text className="text-base font-semibold text-secondary-dark mb-1">
                                            Export Data
                                        </Text>
                                        <Text className="text-xs text-secondary">
                                            Download all your check-ins as JSON
                                        </Text>
                                    </View>
                                    <Text className="text-2xl">📤</Text>
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={handleImportData}
                                className="p-5 border-b border-[#D9D9D9]"
                                activeOpacity={0.7}
                            >
                                <View className="flex-row items-center justify-between">
                                    <View className="flex-1 pr-4">
                                        <Text className="text-base font-semibold text-secondary-dark mb-1">
                                            Import Data
                                        </Text>
                                        <Text className="text-xs text-secondary">
                                            Restore from a previous export
                                        </Text>
                                    </View>
                                    <Text className="text-2xl">📥</Text>
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={handleDeleteData} className="p-5" activeOpacity={0.7}>
                                <View className="flex-row items-center justify-between">
                                    <View className="flex-1 pr-4">
                                        <Text className="text-base font-semibold text-red-600 mb-1">
                                            Delete All Data
                                        </Text>
                                        <Text className="text-xs text-secondary">
                                            Permanently delete all check-ins
                                        </Text>
                                    </View>
                                    <Text className="text-2xl">🗑️</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View className="mb-6">
                        <Text className="text-xs font-bold text-secondary uppercase tracking-wider mb-3 px-1">
                            Appearance
                        </Text>
                        <View className="bg-white rounded-2xl p-5">
                            <Text className="text-base font-semibold text-secondary-dark mb-4">
                                Theme
                            </Text>
                            <View className="flex-row gap-3">
                                <TouchableOpacity
                                    onPress={() => setSelectedTheme('light')}
                                    className="flex-1"
                                    activeOpacity={0.7}
                                >
                                    <View className={`rounded-xl overflow-hidden border-2 ${selectedTheme === 'light' ? 'border-primary' : 'border-[#D9D9D9]'}`}>
                                        <View className="bg-white p-6 h-32 justify-center items-center">
                                            <View className="w-10 h-10 rounded-full bg-primary/20 mb-2" />
                                            <View className="w-14 h-2 bg-gray-200 rounded" />
                                            <View className="w-10 h-2 bg-gray-100 mt-1 rounded" />
                                        </View>
                                        <View className={`py-3 ${selectedTheme === 'light' ? 'bg-primary/10' : 'bg-gray-50'}`}>
                                            <Text className={`text-sm text-center font-semibold ${selectedTheme === 'light' ? 'text-primary' : 'text-secondary-dark'}`}>
                                                Light
                                            </Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={() => setSelectedTheme('dark')}
                                    className="flex-1"
                                    activeOpacity={0.7}
                                >
                                    <View className={`rounded-xl overflow-hidden border-2 ${selectedTheme === 'dark' ? 'border-primary' : 'border-[#D9D9D9]'}`}>
                                        <View className="bg-[#1F2A30] p-6 h-32 justify-center items-center">
                                            <View className="w-10 h-10 rounded-full bg-primary/30 mb-2" />
                                            <View className="w-14 h-2 bg-gray-600 rounded" />
                                            <View className="w-10 h-2 bg-gray-700 mt-1 rounded" />
                                        </View>
                                        <View className={`py-3 ${selectedTheme === 'dark' ? 'bg-primary/10' : 'bg-gray-800'}`}>
                                            <Text className={`text-sm text-center font-semibold ${selectedTheme === 'dark' ? 'text-primary' : 'text-white'}`}>
                                                Dark
                                            </Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

export default Profile;