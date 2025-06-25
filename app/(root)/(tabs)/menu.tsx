// Enhanced Profile Screen for RePromptt - Clean, Professional & Elegant

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Image,
  ActivityIndicator,
  Linking
} from 'react-native';
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
    const fetchUser = async () => {
      try {
        const value = await AsyncStorage.getItem("user");
        if (value !== null) {
          const userData = JSON.parse(value);
          setUser(userData);
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
        const fcount= await AsyncStorage.getItem("pcount");
        if (value !== null) {
          const userData = JSON.parse(value);
          const response = await fetch("https://reprompttserver.onrender.com/api/get-info", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: userData.email }),
          });

          if (response.ok) {
            const data = await response.json();
            await AsyncStorage.setItem("user", JSON.stringify(data));
            setUser(data);
          } else {
            console.error("Failed to refresh user info.");
          }
        }
      } catch (error) {
        console.error("Error refreshing user info:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLatestUserInfo();
  }, []);

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("user");
       await AsyncStorage.removeItem("FirstTime");
      Alert.alert("Logged Out", "You have been logged out.");
      router.replace("/");
    } catch (error) {
      console.error("Logout Error:", error);
      Alert.alert("Error", "Could not log out. Please try again.");
    }
  };

  const handleGoPremium = () => {
    if (!user?.email) return Alert.alert("Error", "Email not found. Please log in again.");
    const email = encodeURIComponent(user.email);
    Linking.openURL(`https://buy.stripe.com/dRm00igHeasneC6fet0VO00?prefilled_email=${email}`)
      .catch(() => Alert.alert("Error", "Failed to open payment link."));
  };

  const handleCheckFirstTime = async () => {
    await AsyncStorage.removeItem("FirstTime");
    router.push('/');
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color="#052659" />
      </SafeAreaView>
    );
  }

  const Header = () => (
    <View style={styles.header}>
      <Text style={styles.headerText}>Repromptt</Text>
      {user?.isPremium && <Text style={styles.headerText}>👑</Text>}
    </View>
  );

  const renderGuestView = () => (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <Header />
       <View style={{padding: 20, alignItems: "center" }}>
      <Image source={icons.person} style={styles.avatarLarge} />
      <Text style={styles.username}>Welcome Guest</Text>

      <TouchableOpacity style={styles.primaryBtn} onPress={() => router.replace("/login")}> 
        <Text style={styles.btnText}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.secondaryBtn} onPress={handleCheckFirstTime}>
        <Text style={styles.secondaryText}>How to Use?</Text>
      </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderUserView = () => {
    const promptLeft = user.isPremium ? "Unlimited" : `${Math.max(0, 2 - user?.count)} remaining`;

    return (
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Header />
        <View style={{padding: 20,alignItems: "center" }}>
        <Image source={icons.person} style={styles.avatarLarge} />
        <Text style={styles.username}>{user.name || "User"}</Text>

<View style={styles.infoCardFull}>
  <View style={styles.infoRow}>
    <Text style={styles.infoValue}>Mail: {user.email}</Text>
  </View>
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>Plan</Text>
    <Text style={[styles.infoValue, { color: user.isPremium ? "#7a5af5" : "#5b3ba3" }]}>
      {user.isPremium ? "👑 Premium" : "🆓 Basic"}
    </Text>
  </View>
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>Prompts Left</Text>
    <Text
      style={[
        styles.infoValue,
        { color: user.isPremium ? "#00c26e" : promptCount >= 2 ? "#ff4d4d" : "#f59e0b" },
      ]}
    >
      {promptLeft}
    </Text>
  </View>
</View>


        {!user.isPremium && (
          <TouchableOpacity style={styles.premiumBtn} onPress={handleGoPremium}>
            <Text style={styles.btnText}>Upgrade to Premium 👑</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.secondaryBtn} onPress={handleCheckFirstTime}>
          <Text style={styles.secondaryText}>How to Use?</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
        </View>
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {user ? renderUserView() : renderGuestView()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f8f6ff" },
  scrollContainer: { alignItems: "center", paddingBottom: 40 },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f2eaff",
  },
  infoCardFull: {
  backgroundColor: "#fff",
  width: "100%",
  minWidth: 300,
  paddingVertical: 20,
  paddingHorizontal: 18,
  borderColor:"#d6d6ff",
  borderRadius: 14,
  borderLeftWidth: 5,
  shadowColor: "#e6d6ff",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.2,
  shadowRadius: 4,
  elevation: 4,
  marginBottom: 24,
},

infoRow: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 16,
},

infoLabel: {
  fontSize: 16,
  fontWeight: "700",
  color: "#4e2c86",
},

infoValue: {
  fontSize: 16,
  fontWeight: "600",
  color: "#3c296e",
  textAlign: "right",
  flexShrink: 1,
},

  header: {
    backgroundColor: "#e6d6ff",
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
    width: "100%",
    marginBottom: 20,
    borderBottomWidth: 1,
    borderColor: "#d4bfff",
  },
  headerText: {
    fontSize: 28,
    fontWeight: "800",
    color: "#4e2c86",
  },
  avatarLarge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#e3d8ff",
    tintColor: "#5b3ba3",
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "#d4bfff",
  },
  username: {
    fontSize: 24,
    fontWeight: "700",
    color: "#40216d",
    marginBottom: 16,
  },
  infoCard: {
    backgroundColor: "#fff",
    padding: 20,
    minWidth:320,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#ded1ff",
    shadowColor: "#ccc",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 24,
  },
  infoItem: {
    fontSize: 16,
    fontWeight: "600",
    color: "#3c296e",
    marginBottom: 12,
  },
  primaryBtn: {
    backgroundColor: "#5b3ba3",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 12,
    width: "100%",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#4e2c86",
  },
  premiumBtn: {
    backgroundColor: "#7a5af5",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 16,
    width: "100%",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#6b4ee9",
  },
  logoutBtn: {
    marginTop: 20,
    alignItems: "center",
    width: "100%",
  },
  btnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  logoutText: {
    color: "#ff4d4d",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  secondaryBtn: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    width: "100%",
    padding: 10,
    borderWidth: 1,
    borderColor: "#c7b0ff",
    backgroundColor: "#f3ebff",
    marginTop: 10,
  },
  secondaryText: {
    color: "#5b3ba3",
    fontSize: 16,
    fontWeight: "700",
  },
});


export default Menu;