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
      tintColor={focused ? "#000" : "#4e250f"}
      resizeMode="contain"
      className="size-6"
    />
    <Text
      className={`${
        focused
          ? "text-black-300 font-rubik-bold"
          : "text-black-200 font-rubik"
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
    <View style={{ flex: 1 }}>
    <Tabs
      screenOptions={{
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: "#c49c86",
          position: "absolute",
          borderTopColor: "#0061FF1A",
          borderTopWidth: 1,
          minHeight: 70,
          borderRadius: 10,
        },
      }}
    >
      <Tabs.Screen
        name="explore"
        options={{
          title: "HOME",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon={icons.home} title="Home" />
          ),
        }}
      />
      <Tabs.Screen
        name="menu"
        options={{
          title: "Profile",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon={icons.cutlery} title="Menu" />
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
const styles = StyleSheet.create({
  contactButton: {
    position: "absolute",
    bottom: 90, // Adjust this to place it above the tab bar
    right: 20,
    backgroundColor: "#efac87",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 50,
    borderBlockColor:'#000',
    elevation: 5, // Shadow for Android
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.9,
    shadowRadius: 10,
  },
  contactButtonText: {
    color: "#361b0d",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
});
export default TabsLayout;