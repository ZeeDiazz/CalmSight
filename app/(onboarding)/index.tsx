import {View, Text, TouchableOpacity, Animated} from "react-native";
import {useRouter} from "expo-router";
import React, {useEffect, useRef} from "react";
import {LinearGradient} from "expo-linear-gradient";

const Index = () => {
    const router = useRouter();

    //for animation I used: https://reactnative.dev/docs/animations
    const fadeAnim1 = useRef(new Animated.Value(0)).current;
    const fadeAnim2 = useRef(new Animated.Value(0)).current;
    const fadeAnim3 = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.stagger(200, [
            Animated.timing(fadeAnim1, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }),
            Animated.timing(fadeAnim2, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }),
            Animated.timing(fadeAnim3, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            })
        ]).start();
    }, []);

    const handleRoute = () => {
        router.push("/(onboarding)/appMeasures");
    };

    const handleSkip = () => {
        router.push("/(onboarding)/setup");
    };

    return (
        <View className="flex-1 bg-background">
            <View className="flex-row justify-between items-center px-[3%] pt-[10%] mt-4 mb-4">
                <View className="flex-row items-center gap-2">
                    <Text className="text-xl">⏳</Text>
                    <Text className="text-sm text-secondary opacity-80">
                        2 minutes to setup
                    </Text>
                </View>
                <TouchableOpacity
                    onPress={handleSkip}
                    className="px-3 py-2 rounded-lg"
                >
                    <Text className="text-sm font-medium text-secondary opacity-80 active:text-secondary-dark">Skip
                        intro</Text>
                </TouchableOpacity>
            </View>
            <View className="flex-1 px-[3%]">
                <View className="mb-6">
                    <Text className="text-4xl font-black text-secondary-dark mb-1">
                        Understanding Stress
                    </Text>
                    <Text className="text-[15px] text-secondary mb-5 leading-relaxed">
                        Stress isn&#39;t just about what happens to you
                    </Text>
                </View>

                {/*TODO: replace with an image*/}
                <View className="mb-10">
                    <LinearGradient
                        colors={['#a5d9cd', '#6cc1c3', '#a5d9cd']}
                        style={{
                            minHeight: 200,
                            borderRadius: 16,
                            overflow: 'hidden',
                            paddingVertical: 48,
                            paddingHorizontal: 24,
                        }}
                        className="items-center justify-center">
                        <View className="flex-row items-center justify-between w-full">
                            <Animated.View
                                className="flex-1 items-center"
                                style={{opacity: fadeAnim1}}>
                                <View className="rounded-full bg-white items-center justify-center w-16 h-16"
                                      style={{
                                          shadowColor: "#000",
                                          shadowOffset: {width: 0, height: 4},
                                          shadowOpacity: 0.08,
                                          shadowRadius: 12,
                                          elevation: 5,
                                      }}>
                                    <Text className="text-4xl">⚡</Text>
                                </View>
                                <Text
                                    className="text-xs font-semibold text-white uppercase tracking-wider mt-3 text-center">
                                    Stressor
                                </Text>
                            </Animated.View>

                            <Text className="text-2xl text-white opacity-70 px-2">→</Text>

                            <Animated.View
                                className="flex-1 items-center"
                                style={{opacity: fadeAnim2}}>
                                <View className="rounded-full bg-white items-center justify-center w-16 h-16"
                                      style={{
                                          shadowColor: "#000",
                                          shadowOffset: {width: 0, height: 4},
                                          shadowOpacity: 0.08,
                                          shadowRadius: 12,
                                          elevation: 5,
                                      }}>
                                    <Text className="text-4xl">🧠</Text>
                                </View>
                                <Text
                                    className="text-xs font-semibold text-white uppercase tracking-wider mt-3 text-center">
                                    Your Mind
                                </Text>
                            </Animated.View>

                            <Text className="text-2xl text-white opacity-70 px-2">→</Text>

                            <Animated.View
                                className="flex-1 items-center"
                                style={{opacity: fadeAnim3}}>
                                <View className="rounded-full bg-white items-center justify-center w-16 h-16"
                                      style={{
                                          shadowColor: "#000",
                                          shadowOffset: {width: 0, height: 4},
                                          shadowOpacity: 0.08,
                                          shadowRadius: 12,
                                          elevation: 5,
                                      }}>
                                    <Text className="text-4xl">📨</Text>
                                </View>
                                <Text
                                    className="text-xs font-semibold text-white uppercase tracking-wider mt-3 text-center">
                                    Response
                                </Text>
                            </Animated.View>
                        </View>
                    </LinearGradient>
                </View>

                <View className="px-[3%] bg-white rounded-2xl p-5 border-l-4 border-primary shadow-sm">
                    <Text className="text-[16px] font-bold text-secondary-dark leading-relaxed mb-2">
                        Stress depends on interpretation and coping resources, not events alone.
                    </Text>
                    <Text className="text-secondary text-[16px] leading-relaxed">
                        Two people in the same situation experience different stress levels based on how they appraise
                        the situation and their available resources.
                    </Text>
                </View>

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
                        <Text className="text-center text-[15px] text-white">Get Started</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

export default Index;