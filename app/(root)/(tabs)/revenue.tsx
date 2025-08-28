import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
  Platform,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Purchases from "react-native-purchases";

function Revenue() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initRevenueCat = async () => {
      try {
        Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG);
        await Purchases.configure({
          apiKey:
            Platform.OS === "ios"
              ? "appl_CQCxgynMkPhMFbgGOVKNIhxvYEF"
              : "goog_gZBBYSQiWcQksqNDIppclWUMRiX",
          appUserID: null, // Let RevenueCat generate anonymous ID
        });
      } catch (err) {
        console.error("RevenueCat init error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    initRevenueCat();
  }, []);

  const purchase = async () => {
    try {
      const offerings = await Purchases.getOfferings();
      if (!offerings.current?.availablePackages?.length) {
        return Alert.alert("Error", "No subscription available");
      }

      const { customerInfo } = await Purchases.purchasePackage(
        offerings.current.availablePackages[0]
      );

      const isPro = !!customerInfo.entitlements.active["pro_monthly"];
      await AsyncStorage.setItem("premium", isPro ? "true" : "false");

      if (isPro) {
        Alert.alert("Success", "You are now premium!");
        router.push("/explore"); // 👈 navigate forward
      } else {
        Alert.alert("Error", "Subscription not activated.");
      }
    } catch (e) {
      if (!e.userCancelled) {
        Alert.alert("Error", e.message || "Purchase failed");
      }
    }
  };

  // const purchase = async () => {
  //   try {
  //     const offerings = await Purchases.getOfferings();
  //     if (!offerings.current?.availablePackages?.length) {
  //       return Alert.alert("Error", "No subscription available");
  //     }

  //     const { customerInfo } = await Purchases.purchasePackage(
  //       offerings.current.availablePackages[0]
  //     );

  //     const isPro = !!customerInfo.entitlements.active["pro_monthly"];
  //     await AsyncStorage.setItem("premium", isPro ? "true" : "false");

  //     if (isPro) {
  //       Alert.alert("Success", "You are now premium!");
  //     }
  //   } catch (e) {
  //     if (!e.userCancelled) {
  //       Alert.alert("Error", e.message || "Purchase failed");
  //     }
  //   }
  // };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color="#052659" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Header />

        <View style={styles.infoCardFull}>
          <Text style={styles.premiumInfoTitle}>Pro Monthly: $11.99/month</Text>
          <Text style={styles.infoLabel}>
            - Unlock Unlimited Prompts Generation
          </Text>
          <Text style={styles.infoLabel}>- Get advanced Learning Features</Text>

          <TouchableOpacity
            style={styles.premiumBtn}
            onPress={() => purchase()}
          >
            <Text style={styles.btnText}>Subscribe</Text>
          </TouchableOpacity>

          <View style={{ alignItems: "center" }}>
            <Text style={{ color: "grey" }}>
              with auto-renew, cancel anytime
            </Text>
          </View>

          <View style={{ alignItems: "center", marginTop: 10 }}>
            <TouchableOpacity
              onPress={() =>
                Linking.openURL(
                  "https://www.apple.com/legal/internet-services/itunes/dev/stdeula/"
                )
              }
            >
              <Text style={{ textDecorationLine: "underline" }}>
                Apple Terms of Use (EULA){" "}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                Linking.openURL("https://www.repromptt.com/privacy_policy.md")
              }
            >
              <Text style={{ textDecorationLine: "underline", marginTop: 5 }}>
                Terms of Services & Privacy Policy
              </Text>
            </TouchableOpacity>
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

export const checkUserSubscription = async () => {
  try {
    await Purchases.configure({
      apiKey:
        Platform.OS === "ios"
          ? "appl_CQCxgynMkPhMFbgGOVKNIhxvYEF"
          : "goog_gZBBYSQiWcQksqNDIppclWUMRiX",
      appUserID: null, // Let RevenueCat handle ID
    });
    const customerInfo = await Purchases.getCustomerInfo();
    const isPro = !!customerInfo.entitlements.active["pro_monthly"];
    await AsyncStorage.setItem("premium", isPro ? "true" : "false");
    return isPro;
  } catch (err) {
    console.error("Error in checkUserSubscription:", err);
    return false;
  }
};

export default Revenue;

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
    width: "100%",
    marginTop: 30,
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
    marginTop: 40,
    backgroundColor: "#7a5af5",
    paddingVertical: 12,
    borderRadius: 10,
    width: "100%",
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
});
