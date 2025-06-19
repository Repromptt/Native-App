import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from "expo-router";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import AsyncStorage from "@react-native-async-storage/async-storage";
import icons from "@/constants/icons";

function Menu() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [promptCount ,setPromptCount]= useState(0);

  useEffect(() => {
    const checkLogin = async () => {
      const token = await AsyncStorage.getItem("userID");
      if (!token) {
        router.replace("/");
      } else {
        setIsLoading(false);
      }
    };
    checkLogin();
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const value = await AsyncStorage.getItem("user");
        const countValue = await AsyncStorage.getItem("count");
        if (value !== null) {
          const userData = JSON.parse(value);
          setUser(userData);
          setPromptCount(parseInt(countValue || "0", 10));

        }
      } catch (e) {
        console.error("Failed to fetch user:", e);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      await AsyncStorage.clear();
      Alert.alert("Logged Out", "You have been logged out.");
      router.replace("/");
    } catch (error) {
      console.error("Logout Error:", error);
      Alert.alert("Error", "Could not log out. Please try again.");
    }
  };

  const handleGoPremium = () => {
    Alert.alert("Upgrade", "Redirecting to payment...");
    // Implement premium upgrade flow here
  };

  if (isLoading || !user) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color="#052659" />
      </SafeAreaView>
    );
  }


  const promptLeft = user.ispremium ? "Unlimited" : `${2 - promptCount} remaining`;

  return (
    <SafeAreaView style={{ backgroundColor: '#c1e8ff', flex: 1 }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Splitkaro &beta;</Text>
          <MaterialCommunityIcons name="set-split" size={48} color="black" />
        </View>

        <View style={styles.profileContainer}>
          <Image source={icons.person} style={styles.avatar} />
          <Text style={styles.username}>Hello, {user.name}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Premium:</Text>
          <Text style={styles.cardValue}>{user.ispremium ? "✅ Premium User" : "❌ Free User"}</Text>
          <Text style={[styles.cardValue, { marginTop: 8 }]}>
            Prompts Left: {promptLeft}
          </Text>
        </View>

        {!user.ispremium && (
          <TouchableOpacity style={styles.premiumBtn} onPress={handleGoPremium}>
            <Text style={styles.btnText}>Upgrade to Premium</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.btnText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#5483B3',
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  profileContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  avatar: {
    width: 120,
    height: 120,
    tintColor: "#021024",
    marginBottom: 10,
  },
  username: {
    fontSize: 22,
    fontWeight: '600',
    color: '#052659',
  },
  card: {
    backgroundColor: "#7da0ca",
    margin: 20,
    borderRadius: 12,
    padding: 15,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#021024",
    marginBottom: 8,
  },
  cardValue: {
    fontSize: 16,
    color: "#052659",
  },
  premiumBtn: {
    backgroundColor: "#021024",
    marginHorizontal: 20,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  logoutBtn: {
    backgroundColor: "#052659",
    marginHorizontal: 20,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  btnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#c1e8ff",
  },
});

export default Menu;
