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

const Explore = () => {
  const router = useRouter();
  const [userId, setUserId] = useState(null);
  const [isPremium, setIsPremium] = useState(false);
  const [inputPrompt, setInputPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dailyCount, setDailyCount] = useState(0);

  useEffect(() => {
    const checkLogin = async () => {
      try {
        const userData = await AsyncStorage.getItem("user");
        if (!userData) {
          router.replace("/");
        } else {
          const user = JSON.parse(userData);
          setUserId(user.name);
          setIsPremium(user.isPremium);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error checking login:", error);
      }
    };
    checkLogin();
  }, []);

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
          <Text style={styles.welcomeText}> Welcome {userId}</Text>
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
    backgroundColor: '#eddbf8',
    flex: 1
  },
  scrollView: {
    paddingBottom: 40
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
  headerTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: "#420472"

  },
  userRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  welcomeText: {
    fontSize: 30,
    fontWeight: 600,
    fontStyle:"italic",
    paddingLeft: 10,
    padding: 20,
    color: "#052659",
    marginBottom:10
  },
  profileButton: {
    padding: 10,
    borderRadius: 8,
    borderBlockColor:"#fff",
  },
  profileIcon: {
    width: 36,
    height: 36,
    tintColor: "#021024",
    borderColor: "fff"
  },
  container: {
    paddingHorizontal: 16
  },
  label: {
    fontSize: 18,
    fontWeight: 500,
    color: "#420472",
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
    padding: 15,
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
    marginTop: 30,
    padding:20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor:"#be76f8",
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
    backgroundColor: "#eddbf8",
    padding: 12,
    borderTopRightRadius: 8,
    borderTopLeftRadius: 8,
    position: "relative"
  },
  promptText: {
    fontSize: 18,
    color: "#000"
  },
  copyButton: {
    position: "absolute",
    top: -40,
    right: 10,
    backgroundColor: "#052659",
    margin: 3,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6
  },
  copyText: {
    color: "#fff",
    fontSize: 12
  },
  learningText2: {
    fontSize: 14,
    fontWeight: 600,
    color: "#3f0449"
  },
   learningText: {
     backgroundColor:"#ecbcf4",
     borderColor: "#820696",
     borderStyle:"solid",
     borderWidth: 1.5,
     borderBottomLeftRadius: 10,
     borderBottomRightRadius: 10,
     marginBottom:18,
     padding:14,
    fontSize: 18,
    color: "#820896",
    fontWeight: 800,
  }
});

export default Explore;