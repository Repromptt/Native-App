import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, StyleSheet, Image, ActivityIndicator, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import icons from "@/constants/icons";

function Menu() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [promptCount, setPromptCount] = useState(0);

  useEffect(() => {
    const checkLogin = async () => {
      const token = await AsyncStorage.getItem("user");
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

  useEffect(() => {
    const fetchLatestUserInfo = async () => {
      try {
        const value = await AsyncStorage.getItem("user");
        if (value !== null) {
          const userData = JSON.parse(value);
          const { email } = userData;

          if (!email) {
            console.warn("Missing email for update.");
            return;
          }

          const response = await fetch("https://reprompttserver.onrender.com/api/get-info", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email }),
          });

          if (response.ok) {
            const data = await response.json();
            await AsyncStorage.setItem("user", JSON.stringify(data));
            setUser(data);
          } else {
            console.error("Failed to fetch updated user info.");
          }
        }
      } catch (error) {
        console.error("Error during user info refresh:", error);
      }
    };

    fetchLatestUserInfo();
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
    if (!user?.email) {
      Alert.alert("Error", "Email not found. Please log in again.");
      return;
    }
    const email = encodeURIComponent(user.email);
    const checkoutURL = `https://buy.stripe.com/dRm00igHeasneC6fet0VO00?prefilled_email=${email}`;

    Linking.openURL(checkoutURL).catch(() =>
      Alert.alert("Error", "Failed to open payment link.")
    );
  };

  if (isLoading || !user) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color="#052659" />
      </SafeAreaView>
    );
  }

  const promptLeft = user.isPremium ? "Unlimited" : `${Math.max(0, 2 - promptCount)} remaining`;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView >
        <View style={styles.header}>
          <Text style={styles.headerText}>Repromptt {user.isPremium ? "👑" : ""}</Text>
          <TouchableOpacity onPress={() => router.push(`/explore`)} style={styles.profileButton}>
            <Image source={icons.rightArrow} style={styles.profileIcon} />
          </TouchableOpacity>
        </View>

        <View style={styles.profileContainer}>
          <Image source={icons.person} style={styles.avatar} />
          <Text style={styles.username}>Profile</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardValue}>Name : {user.name}</Text>
          <Text style={[styles.cardValue, { marginTop: 8 }]}>Email : {user.email}</Text>
          <Text style={[styles.cardValue, { marginTop: 8 }]}>Status: {user.isPremium ? "👑 Premium" : "🆓 Basic"}</Text>
          <Text style={[styles.cardValue, { marginTop: 8 }]}>Prompts Left: {promptLeft}</Text>

          {!user.isPremium && (
            <TouchableOpacity style={styles.premiumBtn} onPress={handleGoPremium}>
              <Text style={styles.btnText}>Upgrade to Premium 👑</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Text style={styles.btnText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f6f0ff", // soft lavender background
  },
  profileButton: {
    padding: 10,
    borderRadius: 10,
    backgroundColor: "#ffffff",
    shadowColor: "#aaa",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  profileIcon: {
    width: 36,
    height: 36,
    tintColor: "#5b3ba3", // soft professional purple
  },
  header: {
    backgroundColor: "#e6d6ff", // lighter header with pastel purple
    paddingVertical: 18,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomRightRadius: 20,
    borderBottomLeftRadius: 20,
    shadowColor: "#bbb",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  headerText: {
    fontSize: 28,
    fontWeight: "700",
    color: "#4e2c86",
  },
  profileContainer: {
    alignItems: "center",
    marginVertical: 24,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#f2e9ff",
    tintColor: "#5b3ba3",
    marginBottom: 10,
  },
  username: {
    fontSize: 26,
    fontWeight: "700",
    color: "#4e2c86",
  },
  card: {
    backgroundColor: "#f1e7ff",
    marginTop: 20,
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: "#ccc",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  cardValue: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2d1a4f",
    backgroundColor: "#e8d7fc",
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginTop: 10,
  },
  premiumBtn: {
    backgroundColor: "#7a5af5",
    marginHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 12,
    shadowColor: "#7a5af5",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
  },
  logoutBtn: {
    backgroundColor: "#5b3ba3",
    marginHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  btnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f2eaff",
  },
});


export default Menu;
