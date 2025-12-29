import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { DemoHealthConnectDataWriter } from '@/utils/DemoHealthConnectDataWriter';

export const DemoHealthConnectWrite = () => {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    const handleWriteLowStress = async () => {
        setLoading(true);
        setMessage(null);

        try {
            const success = await DemoHealthConnectDataWriter.writeTestDataToHealthConnect({
                daysBack: 7,
                stressLevel: 'low',
            });

            if (success) {
                setMessage('Low stress data written! (7 days)');
            } else {
                setMessage('Failed to write data. Check console.');
            }
        } catch (error) {
            setMessage('Error: ' + error);
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleWriteModerateStress = async () => {
        setLoading(true);
        setMessage(null);

        try {
            const success = await DemoHealthConnectDataWriter.writeTestDataToHealthConnect({
                daysBack: 7,
                stressLevel: 'moderate',
            });

            if (success) {
                setMessage('Moderate stress data written! (7 days)');
            } else {
                setMessage('Failed to write data. Check console.');
            }
        } catch (error) {
            setMessage('Error: ' + error);
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleWriteHighStress = async () => {
        setLoading(true);
        setMessage(null);

        try {
            const success = await DemoHealthConnectDataWriter.writeTestDataToHealthConnect({
                daysBack: 7,
                stressLevel: 'high',
            });

            if (success) {
                setMessage('High stress data written! (7 days)');
            } else {
                setMessage('Failed to write data. Check console.');
            }
        } catch (error) {
            setMessage('Error: ' + error);
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View className="bg-yellow-50 border border-yellow-400 rounded-xl p-4 mb-4">
            <Text className="text-sm font-bold text-yellow-800 mb-2">
                 Demo: Write Test Data to Health Connect
            </Text>
            <Text className="text-xs text-yellow-700 mb-3">
                For Demo purpose only: Writes 7 days of realistic health data.
            </Text>

            {loading ? (
                <View className="py-4 items-center">
                    <ActivityIndicator size="small" color="#ca8a04" />
                    <Text className="text-xs text-yellow-700 mt-2">
                        Writing data to Health Connect...
                    </Text>
                </View>
            ) : (
                <View className="gap-2">
                    <TouchableOpacity
                        onPress={handleWriteLowStress}
                        className="bg-green-500 rounded-lg p-3"
                    >
                        <Text className="text-white text-xs font-semibold text-center">
                            Write Low Stress Data
                        </Text>
                        <Text className="text-white text-xs text-center opacity-80">
                            HRV: ~72ms, Sleep: 8h, HR: ~62 BPM
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={handleWriteModerateStress}
                        className="bg-orange-500 rounded-lg p-3"
                    >
                        <Text className="text-white text-xs font-semibold text-center">
                            Write Moderate Stress Data
                        </Text>
                        <Text className="text-white text-xs text-center opacity-80">
                            HRV: ~50ms, Sleep: 6.5h, HR: ~75 BPM
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={handleWriteHighStress}
                        className="bg-red-500 rounded-lg p-3"
                    >
                        <Text className="text-white text-xs font-semibold text-center">
                            Write High Stress Data
                        </Text>
                        <Text className="text-white text-xs text-center opacity-80">
                            HRV: ~28ms, Sleep: 5h, HR: ~88 BPM
                        </Text>
                    </TouchableOpacity>
                </View>
            )}

            {message && (
                <View className="mt-3 p-2 bg-white rounded">
                    <Text className="text-xs text-yellow-800">{message}</Text>
                </View>
            )}

            <Text className="text-xs text-yellow-600 mt-3 italic">
                After writing data, toggle Health Connect OFF then ON to refresh.
            </Text>
        </View>
    );
};