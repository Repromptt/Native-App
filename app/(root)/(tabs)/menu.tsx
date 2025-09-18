// MENU.tsx
import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Alert,
  StyleSheet, Image, ActivityIndicator, Linking,
  Modal, TextInput, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import icons from '@/constants/icons';
import * as Updates from 'expo-updates';
import { checkUserSubscription } from './revenue';

function Menu() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState('');
  const [dropdownVisible, setDropdownVisible] = useState(false);

  useEffect(() => {
    const fetchAndSyncUser = async () => {
      try {
        const value = await AsyncStorage.getItem('user');
        if (value) {
          const localUser = JSON.parse(value);
          const res = await fetch('https://reprompttserver.onrender.com/api/get-info', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: localUser.email }),
          });

          if (res.ok) {
            const updatedUser = await res.json();
            await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
            setUser(updatedUser);
            await checkUserSubscription();
          }
        }
      } catch (err) {
        console.error('Fetch user failed:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAndSyncUser();
  }, []);

  const handleLogout = async () => {
    Alert.alert('Confirm Logout', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout', style: 'destructive', onPress: async () => {
          await AsyncStorage.multiRemove(['user', 'FirstTime']);
          router.replace('/');
          Updates.reloadAsync();
        },
      },
    ]);
  };
   const handleDelete = () => setShowDeleteModal(true);

  const confirmDeleteAccount = async () => {
    if (confirmEmail !== user.email) return Alert.alert('Error', 'Email mismatch');
    try {
      const res = await fetch('https://reprompttserver.onrender.com/api/deleteacc-2345rwe4h94f2e', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, password: user.password }),
      });
      if (res.ok) {
        await AsyncStorage.multiRemove(['user', 'FirstTime']);
        Alert.alert('Deleted', 'Account removed');
        router.replace('/');
        Updates.reloadAsync();
      } else Alert.alert('Error', 'Failed to delete account');
    } catch (err) {
      console.error('Delete error:', err);
      Alert.alert('Error', 'Unexpected error');
    }
  };

  const handleCheckFirstTime = async () => {
    await AsyncStorage.removeItem('FirstTime');
    router.push('/');
  };


  if (isLoading) {
    return <SafeAreaView style={styles.centered}><ActivityIndicator size="large" color="#052659" /></SafeAreaView>;
  }

  return <SafeAreaView style={styles.safeArea}>{user ? renderUserView() : renderGuestView()}</SafeAreaView>;

  function renderUserView() {
    const promptLeft = user.isPremium ? '∞' : `${Math.max(0, 2 - user.count)}`;
    return (
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Header />
        <View style={styles.profileContainer}>
          <Image source={icons.person} style={styles.avatarLarge} />
          <Text style={styles.username}>{user.name || 'User'}</Text>
          <View style={styles.divider} />
          <View style={styles.infoCardFull}>
            <Text style={styles.infoRow}><Text style={styles.infoLabel}>Mail: </Text>{user.email}</Text>
            <View style={styles.divider} />
            <Text style={styles.infoRow}><Text style={styles.infoLabel}>Plan: </Text><Text style={{ color: user.isPremium ? '#7a5af5' : '#5b3ba3' }}>{user.isPremium ? '👑 Premium' : '🆓 Basic'}</Text></Text>
            <View style={styles.divider} />
            <Text style={styles.infoRow}><Text style={styles.infoLabel}>Daily Prompts Left: </Text><Text style={{ color: user.isPremium ? '#00c26e' : '#5b3ba3', fontWeight: '900' }}>{promptLeft}</Text></Text>
          </View>

          {!user.isPremium && (
           <View>
            <View style={styles.premiumInfoBox}>
              <Text style={styles.premiumInfoTitle}>Unlock Repromptt Plus </Text>
              <Text style={styles.premiumFeature}>- Unlimited Prompts</Text>
              <Text style={styles.premiumFeature}>- Advanced Learnings</Text>
              
              <Text style={styles.premiumFeature}></Text>
              <TouchableOpacity style={styles.premiumBtn} onPress={() => router.replace('/revenue')}>
                <Text style={styles.btnText}> Upgrade to Repromptt Plus </Text>
              </TouchableOpacity>
                        <View style={{alignItems:'center'}}>
                        
                        <TouchableOpacity onPress={() => Linking.openURL('https://www.repromptt.com/privacy_policy.md')}>
                          <Text style={{textDecorationLine: 'underline', color:'grey'}}>Privacy & terms</Text>
                        </TouchableOpacity>
                        </View>
              
            </View>
            </View>
          )}

          <View style={styles.divider} />
          <View style={styles.dropdownContainer}>
            <TouchableOpacity style={styles.dropdownToggle} onPress={() => setDropdownVisible(!dropdownVisible)}>
              <Text style={styles.secondaryText}>Account Options</Text>
              <MaterialIcons name={dropdownVisible ? "keyboard-arrow-up" : "keyboard-arrow-down"} size={20} color="#5b3ba3" />
            </TouchableOpacity>

            {dropdownVisible && (
              <View style={styles.dropdownMenu}>
                <TouchableOpacity style={styles.dangerBtn} onPress={handleLogout}><Text style={styles.dangerText}>Logout</Text></TouchableOpacity>
                <TouchableOpacity style={styles.dangerBtn} onPress={() => Linking.openURL(`https://repromptt.com/privacy_policy.md`)}><Text style={styles.dangerText}>Privacy Policy</Text></TouchableOpacity>
                <TouchableOpacity style={styles.dangerBtn} onPress={handleDelete}><Text style={styles.dangerText}>Delete Account</Text></TouchableOpacity>
              </View>
            )}
          </View>

          <Modal visible={showDeleteModal} transparent animationType="slide">
            <View style={styles.modalOverlay}>
              <View style={styles.modalContainer}>
                <Text style={styles.modalTitle}>Confirm Account Deletion</Text>
                <TextInput placeholder="Enter your email to confirm" style={styles.input} onChangeText={setConfirmEmail} value={confirmEmail} autoCapitalize="none" />
                <View style={styles.modalButtons}>
                  <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowDeleteModal(false)}><Text style={styles.cancelText}>Cancel</Text></TouchableOpacity>
                  <TouchableOpacity style={styles.confirmBtn} onPress={confirmDeleteAccount}><Text style={styles.confirmText}>Confirm</Text></TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </View>
      </ScrollView>
    );
  }

  function renderGuestView() {
    return (
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Header />
        <View style={{ padding: 20, alignItems: 'center' }}>
          <Image source={icons.person} style={styles.avatarLarge} />
          <Text style={styles.username}>Welcome Guest</Text>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.primaryBtn} onPress={() => router.push('/login')}>
            <Text style={styles.btnText}>Login / Signup</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryBtn} onPress={handleCheckFirstTime}>
            <Text style={styles.secondaryText}>How to Use?</Text>
          </TouchableOpacity>
          <View style={styles.divider} />
        
        </View>
      </ScrollView>
    );
  }

  function Header() {
    return (
      <View style={styles.header}>
        <Text style={styles.headerText}>Repromptt</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialIcons name="chevron-left" size={30} color="#5b3ba3" />
          <Text style={{ fontSize: 10, textAlign: 'center', marginTop: -5, color: "#5b3ba3", fontWeight: '700' }}>Back</Text>
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
    marginBottom:10,
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
