import { View, Text, TouchableOpacity, ScrollView } from "react-native";
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

    const {status, permissionsGranted, requestPermissions} = useHealthService();

    const frequencyOptions= [1, 2, 3, 4, 5, 7];

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

    const applyRecommended = () => {
        setTrackingFrequency(3);
        handleHealthToggle();
        setCalendarAccess(true);
        setNotifications(true);
    };

    return (
        <View className="flex-1 bg-background">
                <View className="flex-row justify-between items-center px-[3%] pt-[10%] mt-4 mb-4">
                    <Text className="justify-center text-sm font-medium text-background opacity-80">
                        Skip
                    </Text>
                    <View className="flex-row justify-center gap-2">
                        <View className="w-2 h-2 rounded-full bg-secondary opacity-20"/>
                        <View className="w-2 h-2 rounded-full bg-secondary opacity-20"/>
                        <View className="w-2 h-2 rounded-full bg-secondary opacity-20"/>
                        <View className="rounded-full bg-primary" style={{ width: 24, height: 8}}/>
                    </View>
                    <Text className="justify-center text-sm font-medium text-background opacity-80">
                        Skip
                    </Text>
                </View>
                <View className="px-[3%]">
                    <Text className="text-4xl font-black text-secondary-dark mb-1">
                        Setup Settings
                    </Text>
                </View>

                <ScrollView className="flex-1 px-[3%]" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
                    <Text className="text-[15px] text-secondary leading-relaxed mb-6">
                        CalmSight monitors multiple dimensions of your wellbeing
                    </Text>

                    <View className="mb-6">
                        <View className="rounded-2xl p-5 text-center" style={{ backgroundColor: '#E0F5F5'}}>
                            <View className="self-center rounded-full px-3 py-1 mb-2 " style={{ backgroundColor: '#2FB5B5'}}>
                                <Text className="text-xs font-bold text-white uppercase text-center tracking-wider">
                                    ⭐ Recommended
                                </Text>
                            </View>
                            <Text>
                                <Text className="text-sm text-secondary-dark font-semibold ">
                                    Quick Setup
                                </Text>
                                <Text className="text-[13px] text-secondary mb-4 ml-2">
                                     Configures optimal settings for stress tracking
                                </Text>
                            </Text>
                        </View>

                        <TouchableOpacity onPress={applyRecommended} className="rounded-xl p-4 border-2 mt-3" style={{borderColor: '#2FB5B5', backgroundColor: 'white'}}>
                            <Text className="text-center text-[15px] font-semibold" style={{ color: '#2FB5B5'}}>
                                Use Recommended Settings
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <View className="flex-row items-center mb-6">
                        <View className="flex-1 h-[1px] bg-secondary" />
                        <Text className="px-4 text-[13px] text-secondary">
                            or customize manually
                        </Text>
                        <View className="flex-1 h-[1px] bg-secondary" />
                    </View>

                    <View className="gap-4 mb-6">
                        <View className={'rounded-2xl p-5 border-2 bg-white'}
                            style={{
                                borderColor: '#2FB5B5',
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 1 },
                                shadowOpacity: 0.05,
                                shadowRadius: 3,
                                elevation: 2
                            }}
                        >
                            <Text className="text-base font-bold text-secondary-dark mb-2">
                                Tracking Frequency
                            </Text>
                            <Text className="text-[13px] text-secondary leading-relaxed mb-4">
                                How often should we prompt you to check in?
                            </Text>
                            <HorizontalSelector
                                options={frequencyOptions}
                                selectedValue={trackingFrequency}
                                onSelect={(value) => setTrackingFrequency(value as number)}
                            />
                            <View className="flex-row items-center gap-2 mt-3">
                                <Text className="text-xs text-primary font-medium">
                                    ✓ Helps us identify stress patterns
                                </Text>
                            </View>
                        </View>
                    </View>

                    <View className={`rounded-2xl mb-6 p-5 border-2 ${health ? 'bg-[#E0F5F5]' : 'bg-white'}`}
                        style={{
                            borderColor: health ? '#2FB5B5' : '#F5F5F5',
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 1 },
                            shadowOpacity: 0.05,
                            shadowRadius: 3,
                            elevation: 2
                        }}
                    >
                        <View className="flex-row justify-between items-center mb-2">
                            <Text className="text-base font-bold text-secondary-dark">
                                Health Data Sync
                            </Text>
                            <ToggleSwitch value={health} onToggle={handleHealthToggle} />
                        </View>
                        <Text className="text-[13px] text-secondary leading-relaxed mb-2">
                            Connect Apple Health or Google Fit to track heart rate, sleep, and activity
                        </Text>
                        {health && (
                            <>
                                <View className="flex-row items-center gap-2 mb-3">
                                    <Text className="text-xs text-primary font-medium">
                                        ✓ Provides objective stress indicators
                                    </Text>
                                </View>
                                <DemoHealthConnectWrite />
                            </>
                        )}
                        {healthError && (
                            <View className="mt-2 p-3 rounded-lg bg-red-50">
                                <Text className="text-xs text-red-600">
                                    {healthError}
                                </Text>
                            </View>
                        )}
                    </View>


                    <View
                        className={`rounded-2xl mb-6 p-5 border-2 ${
                            notifications ? 'bg-[#E0F5F5]' : 'bg-white'
                        }`}
                        style={{
                            borderColor: notifications ? '#2FB5B5' : '#F5F5F5',
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 1 },
                            shadowOpacity: 0.05,
                            shadowRadius: 3,
                            elevation: 2,
                        }}
                    >
                        <View className="flex-row justify-between items-center mb-2">
                            <Text className="text-base font-bold text-secondary-dark">
                                Notifications
                            </Text>
                            <ToggleSwitch
                                value={notifications}
                                onToggle={() => setNotifications(!notifications)}
                            />
                        </View>
                        <Text className="text-[13px] text-secondary leading-relaxed">
                            Get gentle reminders to check in throughout the day
                        </Text>
                        {notifications && (
                            <View className="flex-row items-center gap-2 mt-2">
                                <Text className="text-xs text-primary font-medium">
                                    ✓ Maintain consistent tracking
                                </Text>
                            </View>
                        )}
                    </View>

                    <View className={`rounded-2xl p-5 border-2 ${calendarAccess ? 'bg-[#E0F5F5]' : 'bg-white'}`}
                        style={{
                            borderColor: calendarAccess ? '#2FB5B5' : '#F5F5F5',
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 1 },
                            shadowOpacity: 0.05,
                            shadowRadius: 3,
                            elevation: 2
                        }}
                    >
                        <View className="flex-row justify-between items-center mb-2">
                            <Text className="text-base font-bold text-secondary-dark">
                                Calender
                            </Text>
                            <ToggleSwitch
                                value={calendarAccess}
                                onToggle={() => setCalendarAccess(!calendarAccess)}
                            />
                        </View>
                        <Text className="text-[13px] text-secondary leading-relaxed">
                            Get gentle reminders to check in throughout the day
                        </Text>
                        {calendarAccess && (
                            <View className="flex-row items-center gap-2 mt-2">
                                <Text className="text-xs text-primary font-medium">
                                    ✓ Maintain consistent tracking
                                </Text>
                            </View>
                        )}
                    </View>

                </ScrollView>


            <View className="absolute bottom-12 left-0 right-0 px-[3%]">
                <TouchableOpacity
                    onPress={handleRoute}
                    className="rounded-2xl p-5 items-center justify-center bg-primary shadow-lg"
                    style={{
                        shadowColor: '#2FB5B5',
                        shadowOffset: {width: 0, height: 4},
                        shadowOpacity: 0.3,
                        shadowRadius: 12,
                        elevation: 8,
                    }}
                >
                    <Text className="text-center text-[15px] text-white">Complete Setup</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default Setup;