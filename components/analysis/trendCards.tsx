import {View, Text} from "react-native";

interface WeeklySummaryCardProps {
    checkInsCompleted: number;
    checkInsTotal: number;
    averageStress: number;
    highStressDays: number;
    totalDays: number;
    breaksTaken: number;
}
interface StressComparisonCardProps {
    thisWeek: number;
    lastWeek: number;
}
interface MostStressfulDayCardProps {
    day: string;
    averageStress: number;
    description?: string;
}

interface SleepImpactData {
    label: string;
    stressLevel: number;
}
interface SleepImpactCardProps {
    data: SleepImpactData[];
}

interface StressTrigger {
    trigger: string;
    count: number;
}
interface StressTriggersCardProps {
    triggers: StressTrigger[];
    maxCount?: number;
    period?: string;
}

export const WeeklySummaryCard = ({checkInsCompleted = 0, checkInsTotal = 7, averageStress = 0, highStressDays = 0, totalDays = 7, breaksTaken = 0,}: Partial<WeeklySummaryCardProps>) => {
    return (
        <View className="bg-primary/10 rounded-xl p-5 border border-primary mb-4">
            <Text className="text-base font-semibold text-primary mb-4">
                This Week&#39;s Summary
            </Text>

            <View className="space-y-2">
                <View className="flex-row justify-between">
                    <Text className="text-sm text-secondary-dark">Check-ins completed</Text>
                    <Text className="text-sm font-bold text-secondary-dark">{checkInsCompleted}/{checkInsTotal}</Text>
                </View>
                <View className="flex-row justify-between">
                    <Text className="text-sm text-secondary-dark">Average stress</Text>
                    <Text className="text-sm font-bold text-secondary-dark">{averageStress}%</Text>
                </View>
                <View className="flex-row justify-between">
                    <Text className="text-sm text-secondary-dark">High stress days</Text>
                    <Text className="text-sm font-bold text-secondary-dark">{highStressDays}/{totalDays}</Text>
                </View>
                <View className="flex-row justify-between">
                    <Text className="text-sm text-secondary-dark">Breaks taken</Text>
                    <Text className="text-sm font-bold text-secondary-dark">{breaksTaken}</Text>
                </View>
            </View>
        </View>
    );
};

export const StressComparisonCard = ({thisWeek = 0, lastWeek = 0}: Partial<StressComparisonCardProps>) => {
    const change = lastWeek - thisWeek;
    const isImprovement = change > 0;

    return (
        <View className="bg-background-dark rounded-xl p-5 border border-[#D9D9D9] mb-4">
            <Text className="text-base font-semibold text-secondary-dark mb-4">
                Average Stress Level
            </Text>

            <View className="flex-row justify-between items-center">
                <View>
                    <Text className="text-3xl font-bold text-secondary-dark">
                        {thisWeek}%
                    </Text>
                    <Text className="text-sm text-secondary">This week</Text>
                </View>

                {lastWeek > 0 && (
                    <View className={`px-3 py-1 rounded-full ${
                        isImprovement ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                        <Text className={`text-sm font-semibold ${
                            isImprovement ? 'text-green-700' : 'text-red-700'
                        }`}>
                            {isImprovement ? '↓' : '↑'} {Math.abs(change)}%
                        </Text>
                    </View>
                )}
            </View>
        </View>
    );
};

export const MostStressfulDayCard = ({day = '--', averageStress = 0, description = 'Consistently high stress',}: Partial<MostStressfulDayCardProps>) => {
    const getBadgeColor = () => {
        if (averageStress >= 70) return 'bg-red-100';
        if (averageStress >= 50) return 'bg-orange-100';
        return 'bg-green-100';
    };

    const getTextColor = () => {
        if (averageStress >= 70) return 'text-red-700';
        if (averageStress >= 50) return 'text-orange-700';
        return 'text-green-700';
    };

    return (
        <View className="bg-background-dark rounded-xl p-5 border border-[#D9D9D9] mb-4">
            <Text className="text-base font-semibold text-secondary-dark mb-4">
                Most Stressful Day
            </Text>

            <View className="flex-row items-center justify-between">
                <View>
                    <Text className="text-2xl font-bold text-secondary-dark">
                        {day}
                    </Text>
                    <Text className="text-sm text-secondary">
                        {description}
                    </Text>
                </View>

                <View className={`px-3 py-1 rounded-full ${getBadgeColor()}`}>
                    <Text className={`text-sm font-semibold ${getTextColor()}`}>
                        {averageStress}% avg
                    </Text>
                </View>
            </View>
        </View>
    );
};

export const SleepImpactCard = ({data = [],}: Partial<SleepImpactCardProps>) => {
    const getBarColor = (stress: number) => {
        if (stress >= 60) return 'bg-[#D47474]';
        if (stress >= 40) return 'bg-[#D4A574]';
        return 'bg-primary';
    };

    const getTextColor = (stress: number) => {
        if (stress >= 60) return 'text-red-700';
        if (stress >= 40) return 'text-orange-700';
        return 'text-primary-dark';
    };

    // Default data if none provided
    const displayData = data.length > 0 ? data : [
        { label: '<6 hours sleep', stressLevel: 0 },
        { label: '6-7 hours sleep', stressLevel: 0 },
        { label: '8+ hours sleep', stressLevel: 0 },
    ];

    return (
        <View className="bg-background-dark rounded-xl p-5 border border-[#D9D9D9] mb-4">
            <Text className="text-base font-semibold text-secondary-dark mb-4">
                Sleep Impact on Stress
            </Text>

            {displayData.map((item, index) => (
                <View key={index} className={index < displayData.length - 1 ? 'mb-3' : ''}>
                    <View className="flex-row justify-between mb-1">
                        <Text className="text-sm text-secondary">{item.label}</Text>
                        <Text className={`text-sm font-semibold ${getTextColor(item.stressLevel)}`}>
                            {item.stressLevel}% stress
                        </Text>
                    </View>
                    <View className="h-2 bg-background rounded-full overflow-hidden">
                        <View
                            className={`h-full rounded-full ${getBarColor(item.stressLevel)}`}
                            style={{ width: `${item.stressLevel}%` }}
                        />
                    </View>
                </View>
            ))}
        </View>
    );
};

export const StressTriggersCard = ({triggers = [], maxCount, period = 'this week',}: Partial<StressTriggersCardProps>) => {
    // Default triggers if none provided
    const displayTriggers = triggers.length > 0 ? triggers : [
        { trigger: 'No data yet', count: 0 },
    ];

    const actualMaxCount = maxCount || Math.max(...displayTriggers.map(t => t.count), 1);

    return (
        <View className="bg-background-dark rounded-xl p-5 border border-[#D9D9D9] mb-4">
            <Text className="text-base font-semibold text-secondary-dark mb-4">
                Top Stress Triggers
            </Text>

            {displayTriggers.map((item, index) => (
                <View key={index} className={index < displayTriggers.length - 1 ? 'mb-3' : ''}>
                    <View className="flex-row justify-between mb-1">
                        <Text className="text-sm text-secondary-dark">{item.trigger}</Text>
                        {item.count > 0 && (
                            <Text className="text-sm font-semibold text-primary">
                                {item.count}x {period}
                            </Text>
                        )}
                    </View>
                    {item.count > 0 && (
                        <View className="h-1.5 bg-background rounded-full overflow-hidden">
                            <View
                                className="h-full bg-primary rounded-full"
                                style={{ width: `${(item.count / actualMaxCount) * 100}%` }}
                            />
                        </View>
                    )}
                </View>
            ))}
        </View>
    );
};