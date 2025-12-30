import {View, Text} from "react-native";
interface ChartData {
    day: string;
    value: number;
    label: string;
}

interface WeeklyStressChartProps {
    data: ChartData[];
}

const WeeklyStressChart = ({data}: WeeklyStressChartProps) => {
    const maxValue = 100;

    const getBarColor = (value: number) => {
        if (value >= 70) return 'bg-[#D47474]';
        if (value >= 40) return 'bg-[#D4A574]';
        return 'bg-primary'; // Low stress
    };

    const getBarHeight = (value: number) => {
        return Math.max((value / maxValue) * 120, 8);
    };

    return (
        <View className="bg-white rounded-xl p-4 border border-[#D9D9D9]">
            <Text className="text-base font-semibold text-secondary-dark mb-4">
                Weekly Stress Trends
            </Text>

            <View className="flex-row items-end justify-between h-32">
                {data.map((item, index) => (
                    <View key={index} className="flex-1 items-center">
                        <View
                            className={`rounded-t-md mb-2 w-8 ${getBarColor(item.value)}`}
                            style={{ height: getBarHeight(item.value)}}
                        />

                        <Text className="text-xs text-secondary">
                            {item.day}
                        </Text>
                    </View>
                ))}
            </View>
        </View>
    );
};

export default WeeklyStressChart;