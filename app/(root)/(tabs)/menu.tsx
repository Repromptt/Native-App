import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Image,
  ActivityIndicator,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import icons from "@/constants/icons";
import { checkUserSubscription } from "./revenue";

function Menu() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [premium, setPremium] = useState(false);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const init = async () => {
      const isPro = await checkUserSubscription();
      setPremium(isPro);

      const storedCount = await AsyncStorage.getItem("pcount");
      setCount(storedCount ? parseInt(storedCount) : 0);

      setIsLoading(false);
    };

    init();
  }, []);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color="#052659" />
      </SafeAreaView>
    );
  }

  const promptLeft = premium ? "∞" : `${Math.max(0, 3 - count)}`;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Header />
        <View style={styles.profileContainer}>
          <Image source={icons.person} style={styles.avatarLarge} />
          <Text style={styles.username}>Welcome Back</Text>
          <View style={styles.divider} />

          <View style={styles.infoCardFull}>
            <Text style={styles.infoRow}>
              <Text style={{ color: premium ? "#7a5af5" : "#5b3ba3" }}>
                {premium ? "👑 Premium" : "Free User"}
              </Text>
            </Text>
            <View style={styles.divider} />
            <Text style={styles.infoRow}>
              <Text style={styles.infoLabel}>Daily Prompts Left: </Text>
              <Text
                style={{
                  color: premium ? "#00c26e" : "#5b3ba3",
                  fontWeight: "900",
                }}
              >
                {promptLeft}
              </Text>
            </Text>
          </View>

          {!premium && (
            <View style={styles.premiumInfoBox}>
              <Text style={styles.premiumInfoTitle}>
                Unlock Pro Monthly - $11.99 /month
              </Text>
              <Text style={styles.premiumFeature}>- Unlimited Prompts</Text>
              <Text style={styles.premiumFeature}>- Advanced Learnings</Text>
              <TouchableOpacity
                style={styles.premiumBtn}
                onPress={() => router.replace("/revenue")}
              >
                <Text style={styles.btnText}> Upgrade to Pro Monthly </Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.divider} />
          <View style={styles.dropdownContainer}>
            <TouchableOpacity
              style={styles.dropdownToggle}
              onPress={() => setDropdownVisible(!dropdownVisible)}
            >
              <Text style={styles.secondaryText}>Legals-</Text>
              <MaterialIcons
                name={
                  dropdownVisible ? "keyboard-arrow-up" : "keyboard-arrow-down"
                }
                size={20}
                color="#5b3ba3"
              />
            </TouchableOpacity>

            {dropdownVisible && (
              <View style={styles.dropdownMenu}>
                <TouchableOpacity
                  style={styles.dangerBtn}
                  onPress={() =>
                    Linking.openURL(`https://repromptt.com/privacy_policy.md`)
                  }
                >
                  <Text style={styles.dangerText}>Privacy Policy</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.dangerBtn}
                  onPress={() =>
                    Linking.openURL(
                      `https://www.apple.com/legal/internet-services/itunes/dev/stdeula/`
                    )
                  }
                >
                  <Text style={styles.dangerText}>Apple EULA</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );

  function Header() {
    return (
      <View style={styles.header}>
        <Text style={styles.headerText}>Repromptt</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialIcons name="chevron-left" size={30} color="#5b3ba3" />
          <Text
            style={{
              fontSize: 10,
              textAlign: "center",
              marginTop: -5,
              color: "#5b3ba3",
              fontWeight: "700",
            }}
          >
            Back
          </Text>
        </TouchableOpacity>
      </View>
    );
  }
}
export default Menu;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f6f0ff", // soft lavender
  },
  scrollContainer: {
    paddingBottom: 40,
    backgroundColor: "#f6f0ff",
    flexGrow: 1,
  },
  header: {
    backgroundColor: "#e6d6ff", // very light purple
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: "#aaa",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  headerText: {
    fontSize: 28,
    fontWeight: "700",
    color: "#5b3ba3", // professional purple
  },
  profileContainer: {
    padding: 20,
    alignItems: "center",
  },
  avatarLarge: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#ede7ff",
    tintColor: "#5b3ba3",
    marginBottom: 16,
    borderWidth: 2,
    borderColor: "#c7b0ff",
  },
  username: {
    fontSize: 22,
    fontWeight: "700",
    color: "#40216d",
    marginBottom: 12,
  },
  divider: {
    height: 1,
    backgroundColor: "#ddd",
    width: "90%",
    marginVertical: 16,
  },
  infoCardFull: {
    backgroundColor: "#fff",
    width: "90%",
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 20,
  },
  infoRow: {
    fontSize: 15,
    fontWeight: "500",
    color: "#34245c",
    marginBottom: 10,
  },
  infoLabel: {
    fontWeight: "600",
    color: "#5e409c",
  },
  premiumInfoBox: {
    width: "90%",
    backgroundColor: "#efe7ff",
    borderRadius: 10,
    padding: 16,
    borderWidth: 1,
    borderColor: "#d6c6ff",
    marginBottom: 16,
  },
  premiumInfoTitle: {
    fontWeight: "700",
    fontSize: 16,
    color: "#5b3ba3",
    marginBottom: 6,
  },
  premiumFeature: {
    fontSize: 14,
    color: "#4e3b7c",
    marginBottom: 4,
  },
  premiumBtn: {
    backgroundColor: "#7a5af5",
    padding: 12,
    borderRadius: 10,
    width: "100%",
    margin:'auto',
    alignItems: "center",
    marginBottom: 12,
  },
  btnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
  primaryBtn: {
    backgroundColor: "#5b3ba3",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 12,
    width: "90%",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#4e2c86",
    marginBottom: 10,
  },
  secondaryBtn: {
    backgroundColor: "#f3ebff",
    paddingVertical: 12,
    borderRadius: 10,
    width: "90%",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#d6c6ff",
    marginBottom: 12,
  },
  secondaryText: {
    color: "#5b3ba3",
    fontSize: 15,
    fontWeight: "700",
  },
  dangerBtn: {
    backgroundColor: "#ffe6e6",
    paddingVertical: 12,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
    marginBottom: 12,
    borderColor: "#ffb3b3",
    borderWidth: 1,
  },
  dangerText: {
    color: "#cc0000",
    fontSize: 15,
    fontWeight: "700",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  modalContainer: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    width: "90%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
    color: "#3a2373",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    fontSize: 15,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  cancelBtn: {
    backgroundColor: "#ddd",
    padding: 10,
    borderRadius: 8,
    flex: 1,
    marginRight: 10,
  },
  cancelText: {
    textAlign: "center",
    fontWeight: "600",
  },
  confirmBtn: {
    backgroundColor: "#cc0000",
    padding: 10,
    borderRadius: 8,
    flex: 1,
  },
  confirmText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "600",
  },
  dropdownContainer: {
    width: "90%",
    marginBottom: 12,
  },
  dropdownToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f3ebff",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#c7b0ff",
  },
  dropdownMenu: {
    marginTop: 8,
  },
  button: {
    backgroundColor: "#7a5af5",
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 16,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
