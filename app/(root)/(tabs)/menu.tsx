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
    const checkoutURL = `https://buy.stripe.com/test_bJebJ0gCEeOrcy6015grS00?prefilled_email=${email}`;

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
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
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
    backgroundColor: '#eddbf8',
    flex: 1
  },
  profileButton: {
    padding: 10,
    borderRadius: 8,
  },
  profileIcon: {
    width: 36,
    height: 36,
    tintColor: "#021024",
  },
  header: {
    backgroundColor: '#cc95f8',
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomRightRadius: 20,
    borderBottomLeftRadius: 20
  },
  headerText: {
    fontSize: 30,
    fontWeight: '800',
    color: "#420472"
  },
  profileContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  avatar: {
    width: 60,
    height: 60,
    tintColor: "#420472",
    marginBottom: 10,
  },
  username: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#420472',
  },
  card: {
    backgroundColor: "#ecbcf4",
    marginTop: 20,
    borderRadius: 20,
    padding: 15,
    paddingTop: 40,
    elevation: 5,
    display: "flex",
    gap: 10

  },
  cardValue: {
    fontSize: 18,
    fontWeight: "600",
    color: "#052659",
    backgroundColor: "rgb(243, 110, 243)",
    paddingTop: 20,
    paddingBottom:20,
    paddingLeft:10,
    elevation: 10,
    borderRadius: 5,
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
