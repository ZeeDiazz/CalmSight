import {Tabs} from "expo-router"

const _Layout =() => {
    return (
        <Tabs>
            <Tabs.Screen
                name="index"
                options={{
                    title: "Home",
                    headerShown: false
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: "Profile",
                    headerShown: false
                }}
            />
            <Tabs.Screen
                name="analysis"
                options={{
                    title: "Analysis",
                    headerShown: false
                }}
            />
            <Tabs.Screen
                name="log"
                options={{
                    title: "Log",
                    headerShown: false
                }}
            />
        </Tabs>

    );
}

export default _Layout;
