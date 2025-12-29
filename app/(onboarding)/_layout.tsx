import {Stack} from "expo-router";

export default function OnboardingLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="appMeasures" />
            <Stack.Screen name="subjectiveIndicators" />
            <Stack.Screen name="setup" />
            <Stack.Screen name="login" />
            <Stack.Screen name="pickAvatar" />
        </Stack>
    );
}