// Updated React Native login/signup screen using backend at http://localhost:3000
import React, { useState, useEffect } from "react";
import {
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Image,
  TextInput,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import Modal from "react-native-modal";
import icons from "@/constants/icons";

export default function Index() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [signupModalVisible, setSignupModalVisible] = useState(false);
  const [signupData, setSignupData] = useState({ name: "", email: "", password: "" });
  const [isLoading, setIsLoading] = useState(true);
  const baseURL = "http://localhost:5000/api";

  useEffect(() => {
    const checkLogin = async () => {
      const token = await AsyncStorage.getItem("user");
      if (token) {
        router.replace("/explore");
      } else {
        setIsLoading(false);
      }
    };
    checkLogin();
  }, []);

  const handleLogin = async () => {
    try {
      const response = await fetch(`${baseURL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (response.ok) {
        await AsyncStorage.setItem("user", JSON.stringify(data));
        await AsyncStorage.setItem("lastDate", new Date().toDateString());
        await AsyncStorage.setItem("count", "0");
        router.replace("/explore");
      } else {
        Alert.alert("Login Failed", data.error || "Invalid credentials");
      }
    } catch (error) {
      Alert.alert("Login Failed", "Unable to connect to server.");
      console.error("Login error", error);
    }
  };

  const handleSignup = async () => {
    const { name, email, password } = signupData;
    try {
      const response = await fetch(`${baseURL}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await response.json();

      if (response.ok) {
        await AsyncStorage.setItem("user", JSON.stringify(data));
        setSignupModalVisible(false);
        router.replace("/explore");
      } else {
        Alert.alert("Signup Failed", data.error || "Could not create account");
      }
    } catch (error) {
      Alert.alert("Signup Failed", "Unable to connect to server.");
      console.error("Signup error", error);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#fff" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Image source={icons.wallet} style={styles.logo} />

          <Text style={styles.title}>Welcome Back 👋</Text>
          <TextInput
            placeholder="Email"
            placeholderTextColor="#ccc"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            placeholder="Password"
            placeholderTextColor="#ccc"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={styles.input}
          />

          <TouchableOpacity onPress={handleLogin} style={styles.button}>
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setSignupModalVisible(true)} style={styles.linkButton}>
            <Text style={styles.linkText}>Don't have an account? Sign Up</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal isVisible={signupModalVisible} onBackdropPress={() => setSignupModalVisible(false)}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Create Account</Text>

          <TextInput
            placeholder="Name"
            placeholderTextColor="#999"
            style={styles.input}
            value={signupData.name}
            onChangeText={(text) => setSignupData({ ...signupData, name: text })}
          />
          <TextInput
            placeholder="Email"
            placeholderTextColor="#999"
            style={styles.input}
            value={signupData.email}
            onChangeText={(text) => setSignupData({ ...signupData, email: text })}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            placeholder="Password"
            placeholderTextColor="#999"
            secureTextEntry
            style={styles.input}
            value={signupData.password}
            onChangeText={(text) => setSignupData({ ...signupData, password: text })}
          />

          <TouchableOpacity onPress={handleSignup} style={styles.button}>
            <Text style={styles.buttonText}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#052659",
  },
  keyboardView: {
    flex: 1,
  },
  scrollContainer: {
    width: "100%",
    paddingHorizontal: 30,
    paddingTop: 80,
    alignItems: "center",
  },
  logo: {
    width: 60,
    height: 60,
    marginBottom: 30,
    tintColor: "#fff",
  },
  title: {
    fontSize: 22,
    color: "#fff",
    fontWeight: "600",
    marginBottom: 20,
  },
  input: {
    backgroundColor: "#113F67",
    color: "#fff",
    width: "100%",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#1E90FF",
    paddingVertical: 14,
    borderRadius: 12,
    width: "100%",
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  linkButton: {
    marginTop: 20,
  },
  linkText: {
    color: "#a9c9ff",
    fontSize: 14,
    textDecorationLine: "underline",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#052659",
    textAlign: "center",
  },
});