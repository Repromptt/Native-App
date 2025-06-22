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
import images from "@/constants/images";
import { LinearGradient } from 'expo-linear-gradient';


export default function Index() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [signupModalVisible, setSignupModalVisible] = useState(false);
  const [signupData, setSignupData] = useState({ name: "", email: "", password: "" });
  const [isLoading, setIsLoading] = useState(true);
  const baseURL = "https://reprompttserver.onrender.com/api";

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
       <LinearGradient
   colors={["#0f051d", "#3b0c59", "#833ab4", "#b95dd3", "#2d0039"]}
  start={{ x: 0.2, y: 0.5 }}
  end={{ x: 0.7, y: 1.1 }}
  locations={[0, 0.3, 0.55, 0.75, 1]}
  style={styles.container}

>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Image source={images.icon} style={styles.logo} />

          <Text style={styles.title}>Welcome Back 👋</Text>
          <TextInput
            placeholder="Email"
            placeholderTextColor="white"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            placeholder="Password"
            placeholderTextColor="white"
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
            placeholderTextColor="#ffe"
            style={styles.input}
            value={signupData.name}
            onChangeText={(text) => setSignupData({ ...signupData, name: text })}
          />
          <TextInput
            placeholder="Email"
            placeholderTextColor="#ffe"
            style={styles.input}
            value={signupData.email}
            onChangeText={(text) => setSignupData({ ...signupData, email: text })}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            placeholder="Password"
            placeholderTextColor="#ffe"
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
       </LinearGradient>
    </SafeAreaView>
   
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1f0136",
  },
  keyboardView: {
    flex: 1,
  },
  scrollContainer: {
    width: "100%",
    paddingHorizontal: 28,
    paddingTop: 70,
    alignItems: "center",
  },
  logo: {
    width: 90,
    height: 90,
    marginBottom: 25,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 5,
  },
  title: {
    fontSize: 30,
    color: "#e0d7ff",
    fontWeight: "700",
    marginBottom: 30,
  },
  input: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderColor: "#7a4df1",
    borderWidth: 1,
    width: "100%",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 14,
    marginBottom: 16,
    fontSize: 16,
    color: "#fff",
  },
  button: {
    backgroundColor: "#7a4df1",
    paddingVertical: 16,
    borderRadius: 14,
    width: "100%",
    alignItems: "center",
    marginTop: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 17,
  },
  linkButton: {
    marginTop: 25,
  },
  linkText: {
    color: "#ae9af0",
    fontSize: 15,
    textDecorationLine: "underline",
  },
  modalContainer: {
    backgroundColor: "#2a0052",
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 20,
    color: "#dfd6fc",
    textAlign: "center",
  },
});
