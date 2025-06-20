import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, StyleSheet, Image, ActivityIndicator, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from "expo-router";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
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

        if (!email ) {
          console.warn("Missing email or password for update.");
          return;
        }

        const response = await fetch("https://b716-2409-40e4-200d-dcdc-ddec-a0fd-ce29-1c65.ngrok-free.app/api/get-info", {
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

    Linking.openURL(checkoutURL).catch((err) =>
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

  const promptLeft = user.isPremium ? "Unlimited" : `${2 - promptCount} remaining`;

  return (
    <SafeAreaView style={{ backgroundColor: '#c1e8ff', flex: 1 }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Repromptt</Text>
          <MaterialCommunityIcons name="set-split" size={48} color="black" />
        </View>

        <View style={styles.profileContainer}>
          <Image source={icons.person} style={styles.avatar} />
          <Text style={styles.username}>Hello {user.name}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Profile</Text>
          <Text style={styles.cardValue}>Name : {user.name}</Text>
          <Text style={[styles.cardValue, { marginTop: 8 }]}>Email : {user.email}</Text>
          <Text style={[styles.cardValue, { marginTop: 8 }]}>Premium: {user.isPremium ? "✅ Premium" : "❌ Free"}</Text>
          <Text style={[styles.cardValue, { marginTop: 8 }]}>Prompts Left: {promptLeft}</Text>
        </View>

        {!user.isPremium && (
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
    fontSize: 22,
    fontWeight: "bold",
    color: "#021024",
    marginBottom: 20,
  },
  cardValue: {
    fontSize: 18,
    fontWeight: "600",
    color: "#052659",
    backgroundColor:"rgb(136, 181, 250)",
    padding: 5 ,
    borderRadius: 5

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