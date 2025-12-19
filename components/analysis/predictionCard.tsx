import {View, Text} from "react-native";

interface PredictionCardProps {
    riskLevel: 'Low Risk' | 'Medium Risk' | 'High Risk';
    pattern: string;
    actions: string[];
}

const PredictionCard = ({riskLevel, pattern, actions}: PredictionCardProps) => {
    const getRiskBadgeColor = (level: string) => {
        switch (level) {
            case 'High Risk':
                return 'bg-[#D47474]/40 border-[#D47474]';
            case 'Medium Risk':
                return 'bg-orange-100 border-orange-300';
            case 'Low Risk':
                return 'bg-primary/30 border-primary';
        }
    };

    const getRiskTextColor = (level: string) => {
        switch (level) {
            case 'High Risk':
                return 'text-red-700';
            case 'Medium Risk':
                return 'text-orange-700';
            case 'Low Risk':
                return 'text-green-700';
            default:
                return 'text-gray-700';
        }
    };
    const getBgColor = (level: string) => {
        switch (level) {
            case 'High Risk':
                return 'bg-[#D47474]/10 border-[#D47474]';
            case 'Medium Risk':
                return 'bg-[#D4A574]/10 border-[#D4A574]';
            case 'Low Risk':
                return 'bg-primary/10 border-primary';
        }
    }

    return (
        <View className={`rounded-xl p-5 border ${getBgColor(riskLevel)}`}>
            <Text className="text-base font-bold text-secondary-dark mb-3">
                PREDICTION
            </Text>

            <View className={`self-start px-3 py-1 rounded-full border mb-4 ${getRiskBadgeColor(riskLevel)}`}>
                <Text className={`text-xs font-semibold ${getRiskTextColor(riskLevel)}`}>
                    {riskLevel}
                </Text>
            </View>

            <Text className="text-sm text-secondary-dark mb-4">
                <Text className="font-semibold">Behavior Pattern: </Text>
                {pattern}
            </Text>

            <View>
                <Text className="text-sm font-semibold text-secondary-dark mb-2">
                    Recommended Actions:
                </Text>
                {actions.map((action, index) => (
                    <Text
                        key={index}
                        className="text-sm text-secondary-dark mb-1 ml-2"
                    >
                        - {action}
                    </Text>
                ))}
            </View>
        </View>
    );
};

export default PredictionCard;