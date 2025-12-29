import {Tabs} from "expo-router"
import {Image, Text, View} from "react-native";
import {icons} from "@/constants/icons";
import {Colors} from "@/constants/colors";


interface NavBarProps {
    focused: boolean;
    icon: any;
    title: string;
}

const NavBar = ({focused, icon, title}:NavBarProps) => {
    return (
        <View className= "justify-center items-center gap-1">
            <Image
                className="h-7 w-7"
                tintColor={focused ? Colors.primary.DEFAULT : Colors.secondary.DEFAULT}
                source={icon}
                resizeMode={"contain"}
            />
            <Text className={`text-[7px] ${focused ? "text-primary" : "text-secondary"}`} >{title}</Text>
        </View>
    );
}


const _Layout =() => {
    return (
        <Tabs
            screenOptions={{
                tabBarShowLabel: false,
                tabBarItemStyle: {
                    width: "100%",
                    height: "100%",
                    justifyContent: "center",
                    alignItems: "center",
                },
                tabBarStyle: {
                    backgroundColor: Colors.background.DEFAULT,
                    position: "absolute",
                    overflow: "hidden",
                    borderTopWidth: 1,
                    borderTopColor: Colors.secondary.DEFAULT,
                    height: 70,
                    paddingBottom: 10,
                    paddingTop: 10,
                },
                headerShown: false,
            }}>
            <Tabs.Screen
                name="home"
                options={{
                    title: "Home",
                    headerShown: false,
                    tabBarIcon: ({focused}) => (
                        <NavBar
                            focused = {focused}
                            icon={icons.home}
                            title="Home"
                        />
                    )
                }}
            />
            <Tabs.Screen
                name="log"
                options={{
                    title: "Log",
                    headerShown: false,
                    tabBarIcon: ({focused}) => (
                        <NavBar
                            focused = {focused}
                            icon={icons.log}
                            title="Log"
                        />
                    )
                }}
            />
            <Tabs.Screen
                name="analysis"
                options={{
                    title: "Analysis",
                    headerShown: false,
                    tabBarIcon: ({focused}) => (
                        <NavBar
                            focused = {focused}
                            icon={icons.analysis}
                            title="Analysis"
                        />
                    )
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: "Profile",
                    headerShown: false,
                    tabBarIcon: ({focused}) => (
                        <NavBar
                            focused = {focused}
                            icon={icons.profile}
                            title="Profile"
                        />
                    )
                }}
            />
        </Tabs>

    );
}

export default _Layout;
