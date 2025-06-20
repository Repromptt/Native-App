import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator, Image, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from "expo-router";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import icons from "@/constants/icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Clipboard from 'expo-clipboard';
import Constants from 'expo-constants';
const GEMINI_API_KEY = Constants.expoConfig.extra.geminiApiKey;
import axios from 'axios';

const Explore = () => {
  const router = useRouter();
  const [userId, setUserId] = useState(null);
  const [inputPrompt, setInputPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
      const checkLogin = async () => {
        const token = await AsyncStorage.getItem("user");
        console.log(token);
       // console.log(token);
        if (token===null) {
          router.replace("/");
        } else {
          setIsLoading(false);
        }
      };
      checkLogin();
    }, []);

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const value = await AsyncStorage.getItem("user");
        
        if (value !== null) {
          const user = JSON.parse(value); // parse the JSON string
          setUserId(user.name); // access the name property
        }
      } catch (e) {
        console.error("Failed to fetch userId:", e);
      }
    };
    fetchUserId();
  }, []);

 useEffect(() => {
  const fetchUserData = async () => {
    try {
      const userId = await AsyncStorage.getItem("userID");
      const userData = await AsyncStorage.getItem("user");

     // console.log("User ID:", userId);
      //console.log("User Data:", userData ? JSON.parse(userData) : null);
    } catch (e) {
      console.error("Error fetching from AsyncStorage:", e);
    }
  };

  fetchUserData();
}, []);


useEffect(() => {
  const resetCountIfNewDay = async () => {
    const today = new Date().toDateString();
    const lastDate = await AsyncStorage.getItem("lastDate");

    if (lastDate !== today) {
      await AsyncStorage.setItem("count", "0");
      await AsyncStorage.setItem("lastDate", today);
    }
  };

  resetCountIfNewDay();
}, []);



const handleGenerate = async () => {
  if (!inputPrompt.trim()) {
    Alert.alert("Input required", "Please enter a prompt.");
    return;
  }

  try {
    const userDataRaw = await AsyncStorage.getItem("user");
    const userData = userDataRaw ? JSON.parse(userDataRaw) : {};

    if (userData?.ispremium !== 1) {
      const countRaw = await AsyncStorage.getItem("count");
      const count = parseInt(countRaw || "0", 10);

      if (count >= 2) {
        Alert.alert("Tokens Exhausted", "Upgrade to pro");
        return;
      }
    }

    if (!GEMINI_API_KEY) {
      Alert.alert("Missing Key", "GEMINI_API_KEY not found in app config.");
      return;
    }

    setLoading(true);

    const geminiPrompt = `
Give an improved and optimized version of the following prompt. Also provide one learning or feedback for improvement.

Prompt: ${inputPrompt}
    `;

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents: [{ role: "user", parts: [{ text: geminiPrompt }] }],
      },
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    const fullText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const [corrected, ...rest] = fullText.split("Learning:");
    const learning = rest.join("Learning:").trim();

    setResults({
      original: inputPrompt,
      corrected: [
        {
          prompt: corrected.trim(),
          learning: learning || "No learning provided",
        },
      ],
    });

    // Increment usage count for free users
    if (userData?.ispremium !== 1) {
      const newCount = (parseInt(await AsyncStorage.getItem("count") || "0", 10)) + 1;
      await AsyncStorage.setItem("count", newCount.toString());
    }
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    Alert.alert("Error", "Something went wrong while generating.");
  } finally {
    setLoading(false);
  }
};

  const handleCopy = async (text) => {
    await Clipboard.setStringAsync(text);
    Alert.alert("Copied", "Prompt copied to clipboard.");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Repromptt</Text>
          <MaterialCommunityIcons name="set-split" size={48} color="#021024" />
        </View>

        <View style={styles.userRow}>
          <Text style={styles.welcomeText}>Welcome {userId}</Text>
          <TouchableOpacity onPress={() => router.push(`/menu`)} style={styles.profileButton}>
            <Image source={icons.person} style={styles.profileIcon} />
          </TouchableOpacity>
        </View>

        <View style={styles.container}>
          <Text style={styles.label}>Write prompt here:</Text>
          <TextInput
            style={styles.input}
            value={inputPrompt}
            onChangeText={setInputPrompt}
            placeholder="e.g., Write a tweet about climate change"
            multiline
          />
          <TouchableOpacity onPress={handleGenerate} style={styles.button}>
            <Text style={styles.buttonText}>Generate</Text>
          </TouchableOpacity>

          {loading && <ActivityIndicator size="large" color="#052659" style={styles.loader} />}

          {results && (
            <View style={styles.resultsContainer}>
              <Text style={styles.sectionTitle}>Original Prompt</Text>
              <PromptCard text={results.original} onCopy={() => handleCopy(results.original)} />

              {results.corrected.map((item, index) => (
                <View key={index} style={styles.correctedItem}>
                  <Text style={styles.sectionTitle}>Corrected Prompt {index + 1}</Text>
                  <PromptCard text={item.prompt} onCopy={() => handleCopy(item.prompt)} />
                  <Text style={styles.learningText}>💡 Learning: {item.learning}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const PromptCard = ({ text, onCopy }) => (
  <View style={styles.promptCard}>
    <Text style={styles.promptText}>{text}</Text>
    <TouchableOpacity onPress={onCopy} style={styles.copyButton}>
      <Text style={styles.copyText}>Copy</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#c1e8ff',
    flex: 1
  },
  scrollView: {
    paddingBottom: 40
  },
  header: {
    backgroundColor: '#5483B3',
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold'
  },
  userRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  welcomeText: {
    fontSize: 30,
    fontWeight: "bold",
    paddingLeft: 10,
    padding: 20,
    color: "#052659"
  },
  profileButton: {
    padding: 10,
    borderRadius: 8
  },
  profileIcon: {
    width: 36,
    height: 36,
    tintColor: "#021024"
  },
  container: {
    paddingHorizontal: 16
  },
  label: {
    fontSize: 18,
    color: "#021024",
    marginBottom: 6
  },
  input: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    borderColor: "#ccc",
    borderWidth: 1,
    textAlignVertical: 'top',
    minHeight: 80
  },
  button: {
    backgroundColor: "#052659",
    padding: 12,
    marginTop: 12,
    borderRadius: 8,
    alignItems: "center"
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold"
  },
  loader: {
    marginTop: 20
  },
  resultsContainer: {
    marginTop: 30
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#052659",
    marginBottom: 10
  },
  correctedItem: {
    marginTop: 20
  },
  promptCard: {
    backgroundColor: "#e6f1f5",
    padding: 12,
    borderRadius: 8,
    position: "relative"
  },
  promptText: {
    fontSize: 16,
    color: "#000"
  },
  copyButton: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "#052659",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6
  },
  copyText: {
    color: "#fff",
    fontSize: 12
  },
  learningText: {
    marginTop: 8,
    fontSize: 14,
    color: "#333"
  }
});

export default Explore;


//https://x8ki-letl-twmt.n7.xano.io/api:wjz1to2Z/user/{email}
