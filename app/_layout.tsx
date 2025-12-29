import { Stack } from "expo-router";
import { AuthProvider } from "@/utils/AuthContext";
import "./global.css"

export default function RootLayout() {
    return (
        <AuthProvider>
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(onboarding)" />
                <Stack.Screen name="(screens)" />
            </Stack>
        </AuthProvider>
    );
}