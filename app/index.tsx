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

  useEffect(() => {
    const checkLogin = async () => {
      const token = await AsyncStorage.getItem("userID");
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
      const response = await fetch("https://x8ki-letl-twmt.n7.xano.io/api:wjz1to2Z/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      const today = new Date().toDateString();

      if (response.ok) {
        await AsyncStorage.setItem("userID", data.authToken);
        await AsyncStorage.setItem("user", JSON.stringify(data.user));
        await AsyncStorage.setItem("count", "0");
         await AsyncStorage.setItem("lastDate", today);
        router.replace("/explore");
      } else {
        
         if (response.status === 403) {
        Alert.alert("Login Failed", data.message || "Access Forbidden. Check your permissions or API configuration.");
      } else if (data.message) {
        Alert.alert("Login Failed", data.message);
      } else {
        Alert.alert("Login Failed", "An unexpected error occurred. Please try again.");
      }
      }
    } catch (error) {
       Alert.alert("Login Failed", "No Account Found");
      console.error("Login error", error);
     
    }
  };

  const handleSignup = async () => {
    const { name, email, password } = signupData;
    try {
      const response = await fetch("https://x8ki-letl-twmt.n7.xano.io/api:wjz1to2Z/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await response.json();

      if (response.ok) {
        await AsyncStorage.setItem("userID", data.authToken);
        await AsyncStorage.setItem("user", JSON.stringify(data.user));
        setSignupModalVisible(false);
        router.replace("/explore");
      } else {
        Alert.alert("Signup Failed", data.message || "Account may already exist");
      }
    } catch (error) {
      Alert.alert("Signup Failed Try Again");
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
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Image source={icons.wallet} style={styles.logo} />

        <TextInput
          placeholder="Email"
          placeholderTextColor="#ccc"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
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
          <Text style={styles.buttonText}>LOGIN</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setSignupModalVisible(true)} style={styles.linkButton}>
          <Text style={styles.linkText}>Don't have an account? Sign Up</Text>
        </TouchableOpacity>
      </ScrollView>

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
            <Text style={styles.buttonText}>SIGN UP</Text>
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
    justifyContent: "center",
    alignItems: "center",
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
    marginBottom: 40,
    tintColor: "#fff",
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



// https://x8ki-letl-twmt.n7.xano.io/api:wjz1to2Z/auth/signup