import { Tabs } from "expo-router";
import { Image, ImageSourcePropType, Linking, Text, TouchableOpacity, View, StyleSheet } from "react-native";

import icons from "@/constants/icons";

const TabIcon = ({
  focused,
  icon,
  title,
}: {
  focused: boolean;
  icon: ImageSourcePropType;
  title: string;
}) => (
  <View className="flex-1 mt-3 flex flex-col items-center">
    <Image
      source={icon}
      tintColor={focused ? "#000" : "#c1e8ff"}
      resizeMode="contain"
      className="size-6"
    />
    <Text
      className={`${
        focused
          ? "text-black-400 font-rubik-bold"
          : "text-white font-rubik"
      } text-xs w-full text-center mt-1`}
    >
      {title}
    </Text>
  </View>
);

const TabsLayout = () => {

  const handleContactPress = () => {
    const phoneNumber = "+1234567890"; // Replace with your desired phone number
    Linking.openURL(`tel:${phoneNumber}`);
  };
  return (
    <View style={{ flex: 1, paddingBottom: 40 , backgroundColor: "#5483B3",}}>
    <Tabs
      screenOptions={{
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: "#5483B3",
          position: "absolute",
          borderTopColor: "#5483B3",
          borderTopWidth: 1,
          minHeight: 70,
          borderRadius: 0,
        },
      }}
    >
      <Tabs.Screen
        name="explore"
        options={{
          title: "HOME",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon={icons.wallet} title="Home" />
          ),
        }}
      />
      <Tabs.Screen
        name="menu"
        options={{
          title: "Profile",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon={icons.person} title="Profile" />
          ),
        }}
      />
    </Tabs>

    {/* Contact Button */}
    {/* <TouchableOpacity style={styles.contactButton} onPress={handleContactPress}>
      <Text style={styles.contactButtonText}>📞 Call</Text>
    </TouchableOpacity> */}
  </View>
  );
};

export default TabsLayout;