import React, { useState, useEffect } from 'react';
import { View,Share, Text, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator, Image, StyleSheet, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Modal from 'react-native-modal';
import { useRouter } from "expo-router";
import icons from "@/constants/icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Clipboard from 'expo-clipboard';
import Constants from 'expo-constants';
import { MaterialIcons } from "@expo/vector-icons";
import { linkTo } from 'expo-router/build/global-state/routing';
import { BackHandler } from 'react-native';

const Explore = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [guestCount, setGuestCount] = useState(0);
  const [inputPrompt, setInputPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const value = await AsyncStorage.getItem("user");
        console.log(value);
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
    const fetchGuestCount = async () => {
      try {
        const vali = await AsyncStorage.getItem("pcount");
        if (vali === null) {
          await AsyncStorage.setItem("pcount", "0");
          setGuestCount(0);
        } else {
          setGuestCount(parseInt(vali, 10));
        }
      } catch (e) {
        console.error("Failed to fetch guest count:", e);
      }
    };
    fetchGuestCount();
  }, []);
  
  useEffect(() => {
    const resetCountIfNewDay = async () => {
      try {
        const today = new Date().toDateString();
        const lastDate = await AsyncStorage.getItem("lastDate");

        if (lastDate !== today) {
          await AsyncStorage.setItem("pcount", "0");
          await AsyncStorage.setItem("lastDate", today);
        }
      } catch (error) {
        console.error("Error resetting count:", error);
      }
    };
    resetCountIfNewDay();
  }, []);

const handleGenerate = async () => {
  if (!inputPrompt) return Alert.alert("Error", "Please enter a prompt first.");

  if (user !== null && !user.isPremium && user.count >= 2)
    return Alert.alert("Daily Limit Reached", "Free users can only generate 2 prompts per day. Upgrade for more!",
   [
      {
        text: "Upgrade",
        onPress: () =>  router.push("/menu"), // or any screen name
      },
      {
        text: "Cancel",
        style: "cancel",
      },
    ]
  );
  if (user == null && guestCount >= 2)
    return Alert.alert("Limit Reached", "Signup/login for Basic plan",
  [
      {
        text: "login",
        onPress: () => router.push("/login"), // or any screen name
      },
      {
        text: "Cancel",
        style: "cancel",
      },
    ]);

  setLoading(true);
  setResults(null);
  const gmail = user?.email || "t@gmail.com";

  try {
    const response = await fetch("https://reprompttserver.onrender.com/api/correct-prompt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gmail, inputPrompt }),
    });

    if (!response.ok) throw new Error((await response.json()).error || "Something went wrong");

    const data = await response.json();

    // ✅ Show result immediately
    setInputPrompt('');
    setResults({ original: inputPrompt, corrected: data.correctedPrompt || [] });

    // 🧠 Update count or user info asynchronously after showing the result
    if (user == null) {
      const newCount = guestCount + 1;
      setGuestCount(newCount);
      await AsyncStorage.setItem("pcount", newCount.toString());
    } else {
      // 🔄 Detach backend fetch to update user info AFTER showing result
      (async () => {
        try {
          const updatedUserRes = await fetch("https://reprompttserver.onrender.com/api/get-info", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: user.email }),
          });

          if (updatedUserRes.ok) {
            const updatedUser = await updatedUserRes.json();
            setUser(updatedUser);
            await AsyncStorage.setItem("user", JSON.stringify(updatedUser));
          } else {
            console.warn("Failed to fetch updated user info.");
          }
        } catch (err) {
          console.error("Background user update error:", err.message);
        }
      })();
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
  };

  const openSearchModal = (text) => {
    setSelectedPrompt(text);
    setModalVisible(true);
  };

  const handleSearch = (engineUrl) => {
    if (selectedPrompt) {
      const query = encodeURIComponent(selectedPrompt);
      Linking.openURL(`${engineUrl}${query}`);
      setModalVisible(false);
    }
  };

  const [dropdownVisible, setDropdownVisible] = useState(false);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Repromptt</Text>
          <View style={styles.dropdownContainer}>
            <TouchableOpacity
              style={styles.dropdownToggle}
              onPress={() => setDropdownVisible(!dropdownVisible)}
            >
              <MaterialIcons
                name={dropdownVisible ? "close" : "menu"}
                size={30}
                color="#5b3ba3"
              />
            </TouchableOpacity>

            {dropdownVisible && (
              <View style={styles.dropdownMenu}>
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => {
                    setDropdownVisible(false);
                    router.push("/menu");
                  }}
                >
                  <Text style={styles.menuText}>{user ? "Account" : "Account"}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={async () => {
                    setDropdownVisible(false);
                    await AsyncStorage.removeItem('FirstTime');
                    router.push('/');
                  }}
                >
                  <Text style={styles.menuText}>How to Use ?</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => {
                    setDropdownVisible(false);
                    Linking.openURL(`https://repromptt.com/#contact`);
                  }}
                >
                  <Text style={styles.menuText}>About Us</Text>
                </TouchableOpacity>

                 <TouchableOpacity
  style={styles.menuItem}
  onPress={async () => {
    try {
      const result = await Share.share({
        message:
          'Hey! I’ve been using this app called RePromptt – it helps you create better AI prompts. Thought you might like it! 😊 https://repromptt.com',
      });

      // Optional: handle different share outcomes
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          console.log('Shared with activity type: ', result.activityType);
        } else {
          console.log('Shared successfully');
        }
      } else if (result.action === Share.dismissedAction) {
        console.log('Share dismissed');
      }
    } catch (error) {
      console.error('Error sharing:', error.message);
    }
  }}
>
  <Text style={styles.menuText}>Invite Friends</Text>
</TouchableOpacity>

              </View>
            )}
          </View>
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
            placeholder="e.g., What are some easy, healthy recipes..."
            multiline
          />
          <TouchableOpacity onPress={handleGenerate} style={styles.button}>
            <Text style={styles.buttonText}>Generate</Text>
          </TouchableOpacity>
          {loading && <ActivityIndicator size="large" color="#052659" style={styles.loader} />}
        </View>

        {!results && (
          <View style={{ backgroundColor: '#f8efff', margin: 20, padding: 20, borderRadius: 12, borderColor: '#d8c3ff', borderWidth: 1 }}>
              <Text style={{textAlign:'center'}}>Learn prompt generation with Repromptt</Text>

          </View>
        )}

        {results && (
          <View style={styles.resultsContainer}>
            {results.corrected.map((item, index) => (
              <View key={index} style={styles.correctedItem}>
                <Text style={styles.sectionTitle}>Corrected Prompt {index + 1}</Text>
                <PromptCard text={item.prompt} onCopy={() => handleCopy(item.prompt)} onSearch={() => openSearchModal(item.prompt)} />
                <Text style={styles.learningText}>
                  💡Learning-{"\n"}
                  <Text style={styles.learningText2}>{item.learning}</Text>
                </Text>
                <TouchableOpacity onPress={() => handleCopy(item.learning)} style={styles.copyButton}>
                  <Text style={styles.copyText}>Copy</Text>
                </TouchableOpacity>
                <View style={styles.divider} />
              </View>
            ))}
            <Text style={styles.sectionTitle}>Original Prompt</Text>
            <PromptCard text={results.original} onCopy={() => handleCopy(results.original)} onSearch={() => openSearchModal(results.original)} />
          </View>
        )}

        <Modal isVisible={modalVisible} onBackdropPress={() => setModalVisible(false)}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Search with</Text>
            <TouchableOpacity onPress={() => handleSearch("https://chat.openai.com/?q=")} style={styles.button}>
              <Text style={styles.buttonText}>ChatGPT</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleSearch("https://copilot.microsoft.com/?q=")} style={styles.button}>
              <Text style={styles.buttonText}>Copilot</Text>
            </TouchableOpacity>
            <TouchableOpacity  style={styles.button}>
              <Text style={styles.buttonText}>Gemini<Text style={{fontSize: 10}}>( Coming soon)</Text></Text>
            </TouchableOpacity>
            <TouchableOpacity  style={styles.button}>
              <Text style={styles.buttonText}>Grok<Text style={{fontSize: 10}}>( Coming soon)</Text></Text>
            </TouchableOpacity>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
};

const PromptCard = ({ text, onCopy, onSearch }) => (
  <View style={styles.promptCard}>
    <Text style={styles.promptText}>
      "{text}"
    </Text>
    <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 10 }}>
      <TouchableOpacity onPress={onCopy} style={styles.copyButton}>
        <Text style={styles.copyText}>Copy</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => onSearch(text)} style={styles.copyButton}>
        <Text style={styles.copyText}>Answer</Text>
      </TouchableOpacity>
    </View>
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
   dropdownContainer: {
    position: "relative",
    alignItems: "flex-end",
  },
  dropdownToggle: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical:20,
    paddingLeft:10,

  },
  profileIcon: {
    width: 24,
    height: 24,
    resizeMode: "contain",
    marginRight: 4,
  },
  dropdownMenu: {
    position: "absolute",
    top: 60,
    right: -20,
    width: 200,
    backgroundColor: "#5b3ba3",
    borderColor: "#e6d6ff",
    borderWidth: 1.5,
    borderRadius: 8,
    shadowColor: "#",
    shadowOpacity: 0.5,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 30 },
    elevation: 5,
  },
  menuItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderColor:"#e6d6ff",
    justifyContent:"center"

  },
  menuText: {
    fontSize: 16,
    fontWeight: 500,
    paddingHorizontal: 8,
    color: "#fff",
    textAlign:"right",
  },
  modalContainer: {
    backgroundColor: "#e6d6ff",
    borderRadius: 24,
    padding: 24,
    margin:18,
    shadowColor: "#5b3ba3",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 20,
    color: "#5b3ba3",
    textAlign: "center",
  },
  header: {
    backgroundColor: "#e6d6ff", // very light purple
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
    zIndex:300,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#5b3ba3", // professional purple
  },
  divider: {
    height: 1,
    backgroundColor: "#5b3ba380",
    width: "100%",
    marginVertical: 16,
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