import {View, Text} from "react-native";

export const WeeklySummaryCard = () => {
    return (
        <View className="bg-primary/10 rounded-xl p-5 border border-primary mb-4">
            <Text className="text-base font-semibold text-primary mb-4">
                This Week's Summary
            </Text>

            <View className="space-y-2">
                <View className="flex-row justify-between">
                    <Text className="text-sm text-secondary-dark">Check-ins completed</Text>
                    <Text className="text-sm font-bold text-secondary-dark">18/21</Text>
                </View>
                <View className="flex-row justify-between">
                    <Text className="text-sm text-secondary-dark">Average stress</Text>
                    <Text className="text-sm font-bold text-secondary-dark">52%</Text>
                </View>
                <View className="flex-row justify-between">
                    <Text className="text-sm text-secondary-dark">High stress days</Text>
                    <Text className="text-sm font-bold text-secondary-dark">2/7</Text>
                </View>
                <View className="flex-row justify-between">
                    <Text className="text-sm text-secondary-dark">Breaks taken</Text>
                    <Text className="text-sm font-bold text-secondary-dark">12</Text>
                </View>
            </View>
        </View>
    );
};

export const StressComparisonCard = () => {
    const thisWeek = 52;
    const lastWeek = 68;
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

                <View className={`px-3 py-1 rounded-full ${
                    isImprovement ? 'bg-green-100' : 'bg-red-100'
                }`}>
                    <Text className={`text-sm font-semibold ${
                        isImprovement ? 'text-green-700' : 'text-red-700'
                    }`}>
                        {isImprovement ? '↓' : '↑'} {Math.abs(change)}%
                    </Text>
                </View>
            </View>
        </View>
    );
};

export const MostStressfulDayCard = () => {
    return (
        <View className="bg-background-dark rounded-xl p-5 border border-[#D9D9D9] mb-4">
            <Text className="text-base font-semibold text-secondary-dark mb-4">
                Most Stressful Day
            </Text>

            <View className="flex-row items-center justify-between">
                <View>
                    <Text className="text-2xl font-bold text-secondary-dark">
                        Monday
                    </Text>
                    <Text className="text-sm text-secondary">
                        Consistently high stress
                    </Text>
                </View>

                <View className="bg-orange-100 px-3 py-1 rounded-full">
                    <Text className="text-sm font-semibold text-orange-700">
                        75% avg
                    </Text>
                </View>
            </View>
        </View>
    );
};

export const SleepImpactCard = () => {
    return (
        <View className="bg-background-dark rounded-xl p-5 border border-[#D9D9D9] mb-4">
            <Text className="text-base font-semibold text-secondary-dark mb-4">
                Sleep Impact on Stress
            </Text>

            <View className="mb-3">
                <View className="flex-row justify-between mb-1">
                    <Text className="text-sm text-secondary">{'<6 hours sleep'}</Text>
                    <Text className="text-sm font-semibold text-red-700">85% stress</Text>
                </View>
                <View className="h-2 bg-background rounded-full overflow-hidden">
                    <View className="h-full bg-[#D47474] rounded-full w-[85%]"/>
                </View>
            </View>

            <View className="mb-3">
                <View className="flex-row justify-between mb-1">
                    <Text className="text-sm text-secondary">8+ hours sleep</Text>
                    <Text className="text-sm font-semibold text-primary-dark">35% stress</Text>
                </View>
                <View className="h-2 bg-background rounded-full overflow-hidden">
                    <View className="h-full bg-primary rounded-full w-[35%]"/>
                </View>
            </View>
            <View>
                <View className="flex-row justify-between mb-1">
                    <Text className="text-sm text-secondary">{'<8 hours sleep'}</Text>
                    <Text className="text-sm font-semibold text-primary-dark">45% stress</Text>
                </View>
                <View className="h-2 bg-background rounded-full overflow-hidden">
                    <View className="h-full bg-primary rounded-full w-[45%]"/>
                </View>
            </View>
        </View>
    );
};

export const StressTriggersCard = () => {
    const triggers = [
        {trigger: 'Work deadlines', count: 12},
        {trigger: 'Poor sleep', count: 8},
        {trigger: 'Meetings', count: 6},
    ];

    return (
        <View className="bg-background-dark rounded-xl p-5 border border-[#D9D9D9] mb-4">
            <Text className="text-base font-semibold text-secondary-dark mb-4">
                Top Stress Triggers
            </Text>

            {triggers.map((item, index) => (
                <View key={index} className="mb-3 last:mb-0">
                    <View className="flex-row justify-between mb-1">
                        <Text className="text-sm text-secondary-dark">{item.trigger}</Text>
                        <Text className="text-sm font-semibold text-primary">
                            {item.count}x this month
                        </Text>
                    </View>
                    <View className="h-1.5 bg-background rounded-full overflow-hidden">
                        <View
                            className="h-full bg-primary rounded-full"
                            style={{width: `${(item.count / 12) * 100}%`}}
                        />
                    </View>
                </View>
            ))}
        </View>
    );
};