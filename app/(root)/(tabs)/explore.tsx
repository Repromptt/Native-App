import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator, Image, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from "expo-router";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import icons from "@/constants/icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Clipboard from 'expo-clipboard';
import Constants from 'expo-constants';
import axios from 'axios';
import moment from "moment";
import { LinearGradient } from 'expo-linear-gradient';

const Explore = () => {
  const router = useRouter();
  const [userId, setUserId] = useState(null);
  const [isPremium, setIsPremium] = useState(false);
  const [inputPrompt, setInputPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dailyCount, setDailyCount] = useState(0);


  // useEffect(() => {
  //   const checkLogin = async () => {
  //     try {
  //       const userData = await AsyncStorage.getItem("user");
  //       if (!userData) {
  //         router.replace("/");
  //       } else {
  //         const user = JSON.parse(userData);
  //         setUserId(user.name);
  //         setIsPremium(user.isPremium);
  //         setIsLoading(false);
  //       }
  //     } catch (error) {
  //       console.error("Error checking login:", error);
  //     }
  //   };
  //   checkLogin();
  // }, []);

  useEffect(() => {
    const resetCountIfNewDay = async () => {
      try {
        const today = new Date().toDateString();
        const lastDate = await AsyncStorage.getItem("lastDate");

        if (lastDate !== today) {
          await AsyncStorage.setItem("count", "0");
          await AsyncStorage.setItem("lastDate", today);
          setDailyCount(0);
        } else {
          const currentCount = await AsyncStorage.getItem("count");
          setDailyCount(parseInt(currentCount || '0'));
        }
      } catch (error) {
        console.error("Error resetting count:", error);
      }
    };
    resetCountIfNewDay();
  }, []);

  const handleGenerate = async () => {
    if (!inputPrompt) {
      Alert.alert("Error", "Please enter a prompt first.");
      return;
    }

    if (!isPremium && dailyCount >= 2) {
      Alert.alert("Limit Reached", "Free users can only generate 2 prompts per day. Upgrade to Premium for unlimited access.");
      return;
    }

    setLoading(true);
    setResults(null);

    try {
      const response = await fetch("https://reprompttserver.onrender.com/api/correct-prompt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inputPrompt }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Something went wrong");
      }

      const data = await response.json();
      setInputPrompt('');

      setResults({
        original: inputPrompt,
        corrected: data.correctedPrompt || [],
      });

      if (!isPremium) {
        const newCount = dailyCount + 1;
        setDailyCount(newCount);
        await AsyncStorage.setItem("count", newCount.toString());
      }

    } catch (error) {
      console.error("Error generating prompt:", error.message);
      Alert.alert("Error", "Failed to generate prompt. Please try again.");
    } finally {
      setLoading(false);
    }
  };


  const handleCopy = async (text) => {
    await Clipboard.setStringAsync(text);
    //Alert.alert("Copied", "Prompt copied to clipboard.");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
       
      <ScrollView contentContainerStyle={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Repromptt </Text>
          <TouchableOpacity onPress={() => router.push(`/menu`)} style={styles.profileButton}>
            <Image source={icons.person} style={styles.profileIcon} />
          </TouchableOpacity>
        </View>

        <View style={styles.userRow}>
          <Text style={styles.welcomeText}> </Text>
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

         
        </View>
         {results && (
            <View style={styles.resultsContainer}>
             
              {results.corrected.map((item, index) => (
                <View key={index} style={styles.correctedItem}>
                  <Text style={styles.sectionTitle}>Corrected Prompt {index + 1}</Text>
                  <PromptCard text={item.prompt} onCopy={() => handleCopy(item.prompt)} />
                  <Text style={styles.learningText}>💡Learning-{"\n"}
                    <Text style={styles.learningText2}>{item.learning}</Text></Text>
                </View>
              ))}
               <Text style={styles.sectionTitle}>Original Prompt</Text>
              <PromptCard text={results.original} onCopy={() => handleCopy(results.original)} />

            </View>
          )}
      </ScrollView>
    </SafeAreaView>
  );
};

const PromptCard = ({ text, onCopy }) => (
  <View style={styles.promptCard}>
    <Text style={styles.promptText}>"{text}"</Text>
    <TouchableOpacity onPress={onCopy} style={styles.copyButton}>
      <Text style={styles.copyText}>Copy</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f6f0ff", // soft lavender
  },
  scrollView: {
    paddingBottom: 40,
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
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#5b3ba3", // professional purple
  },
  profileButton: {
    padding: 8,
    backgroundColor: "#fff",
    borderRadius: 10,
    elevation: 2,
  },
  profileIcon: {
    width: 32,
    height: 32,
    tintColor: "#5b3ba3",
  },
  userRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: "600",
    color: "#333",
    fontStyle: "italic",
  },
  container: {
    paddingHorizontal: 20,
  },
  label: {
    fontSize: 18,
    fontWeight: "600",
    color: "#5b3ba3",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#ffffff",
    padding: 14,
    borderRadius: 10,
    borderColor: "#ccc",
    borderWidth: 1,
    fontSize: 16,
    minHeight: 90,
    color: "#212121",
    textAlignVertical: "top",
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
  loader: {
    marginTop: 20,
  },
  resultsContainer: {
    marginTop: 30,
    backgroundColor: "#f2eaff",
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ddd",
    shadowColor: "#aaa",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#4a2f7c",
    marginBottom: 12,
  },
  correctedItem: {
    marginBottom: 20,
  },
  promptCard: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  promptText: {
    fontSize: 16,
    color: "#212121",
  },
  copyButton: {
    marginTop: 10,
    alignSelf: "flex-end",
    backgroundColor: "#9370f4",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  copyText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
  learningText: {
    marginTop: 10,
    padding: 12,
    backgroundColor: "#efe2ff",
    borderRadius: 10,
    fontSize: 16,
    color: "#4c2d84",
    fontWeight: "700",
  },
  learningText2: {
    color: "#4c2d84",
    fontSize: 14,
    fontWeight: "500",
  },
});


export default Explore;