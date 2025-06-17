import React, { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Alert, ScrollView, Text, TouchableOpacity, View, Image, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import icons from "@/constants/icons";

export default function Index() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState("");

  // Check if user ID exists on app load
  useEffect(() => {
    const checkLogin = async () => {
      try {
        const savedId = await AsyncStorage.getItem("userId");
        if (savedId) {
          router.replace("/explore"); // Navigate if already logged in
        } else {
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error reading userId:", error);
        setIsLoading(false);
      }
    };
    checkLogin();
  }, []);

  const handleLogin = async () => {
    try {
      const fakeId = "123"; // Replace this with your real Google OAuth or ID logic
      await AsyncStorage.setItem("userId", fakeId);
      router.push("/explore");
    } catch (error) {
      Alert.alert("Login Failed", "Something went wrong!");
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView className="bg-blue h-full justify-center items-center">
        <ActivityIndicator size="large" color="#fff" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="bg-blue h-full">
      <ScrollView contentContainerStyle={{ flex: 1, backgroundColor: "#5483B3" }}>
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
          <Image source={icons.wallet} style={{ width: 60, height: 60, tintColor: "#052659" }} />
          <Text className="text-6xl font-extrabold mb-2" style={{ color: "#052659" }}>
            Splitkaro MVP-&beta;
          </Text>
          <Text className="text-2xl font-rubik-extrabold mb-10" style={{ color: "#C1E8FF" }}>
            Track your expenses
          </Text>

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
              elevation: 5,
            }}
          >
            <Text className="text-lg font-bold text-center text-white">ENTER</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
