import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator, Image, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from "expo-router";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import icons from "@/constants/icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Clipboard from 'expo-clipboard';

const Explore = () => {
  const router = useRouter();
  const [userId, setUserId] = useState(null);
  const [inputPrompt, setInputPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
      const checkLogin = async () => {
        const token = await AsyncStorage.getItem("access_token");
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
        const value = await AsyncStorage.getItem("userId");
        if (value !== null) {
          setUserId(value);
        }
      } catch (e) {
        console.error("Failed to fetch userId:", e);
      }
    };
    fetchUserId();
  }, []);

  const handleGenerate = async () => {
    if (!inputPrompt.trim()) {
      Alert.alert("Input required", "Please enter a prompt.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("https://your-backend.com/api/correct-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: inputPrompt })
      });

      const data = await response.json();

      setResults({
        original: inputPrompt,
        corrected: Array.isArray(data.correctedPrompts) ? data.correctedPrompts : []
      });
    } catch (error) {
      console.error("Error fetching prompts:", error);
      Alert.alert("Error", "Backend not responding. Showing test prompts instead.");

      // ✅ Fallback mock data
      setResults({
        original: inputPrompt,
        corrected: [
          {
            prompt: "Write a LinkedIn post highlighting how AI is revolutionizing diagnostics in healthcare.",
            learning: "Be more specific about the content type and focus area."
          },
          {
            prompt: "Draft a tweet that explains how AI improves patient outcomes in hospitals.",
            learning: "Specify the platform and desired outcome to improve clarity."
          }
        ]
      });
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
