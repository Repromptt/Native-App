import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import { FaArrowsSplitUpAndLeft } from "react-icons/fa6";
import { Ionicons } from '@expo/vector-icons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
export default function Index() {
  const router = useRouter();
  const [userId, setUserId] = useState(""); // State to store user input

  const handleLogin = async () => {
    if (!userId.trim()) {
      Alert.alert("Error", "Please enter a valid User ID");
      return;
    }

    try {
      router.push(`/explore?userId=${userId}`); // Pass userId to next screen
    } catch (error) {
      Alert.alert("Login Failed, Something went wrong!");
    }
  };

  return (
    <SafeAreaView className="bg-blue h-full">
      <ScrollView contentContainerStyle={{ flex: 1 ,backgroundColor:'#5483B3'}}>
        <View
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            backgroundColor: "black",
            opacity: 0.01,
            bottom: 0,
          }}
        />
        <View className="flex-1 justify-end px-10 pb-[60px]">
          {/* Title */}
          <Text className="text-6xl font-extrabold  mb-2" style={{color:'#052659'}}>Splitkaro MVP-&beta;</Text>
          <Text className="text-2xl font-rubik-extrabold mb-10" style={{color:'#C1E8FF'}}>
            Track your expenses
          </Text>

          {/* User ID Input */}
          <TextInput
            style={{
              paddingVertical: 15,
              backgroundColor: "#C1E8FF",
              borderRadius: 10,
              paddingHorizontal: 10,
              marginBottom: 10,
            }}
            placeholder="Enter User ID"
            value={userId}
            onChangeText={setUserId}
          />

          {/* Login Button */}
          <TouchableOpacity
            onPress={handleLogin}
            className="rounded-full w-full"
            style={{
              backgroundColor: "#052659",
              paddingVertical: 15,
              shadowColor: "#fff",
              shadowOpacity: 0.2,
              shadowRadius: 5,
              shadowOffset: { width: 0, height: 3 },
              elevation: 5, // For Android shadow
            }}
          >
            <Text className="text-lg font-bold text-center text-white">ENTER</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
