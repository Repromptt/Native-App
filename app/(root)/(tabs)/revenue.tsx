import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Alert,
  StyleSheet, ActivityIndicator, Platform, Linking
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as RNIap from 'react-native-iap';

const itemSkus = Platform.select({
  ios: ['pro_monthly'], 
});

function Revenue() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const init = async () => {
      try {
        const value = await AsyncStorage.getItem('user');
        

        await RNIap.initConnection();
        const availableProducts = await RNIap.getSubscriptions(itemSkus);
        setProducts(availableProducts);
      } catch (err) {
        console.error('IAP Error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    init();

    return () => {
      RNIap.endConnection();
    };
  }, []);

  const purchase = async () => {
    try {
      if (!products.length) {
        return Alert.alert('Error', 'No subscriptions found.');
      }

      const selected = products[0]; 
      const purchase = await RNIap.requestSubscription(selected.productId);

      if (purchase.transactionId && purchase.productId === 'pro_monthly') {
        const updatedUser = { ...user, isPremium: true };
        await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);

       
        await fetch('https://reprompttserver.onrender.com/api/access-premium', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: updatedUser.email,
            entitlement: 'pro_monthly',
            platform: Platform.OS,
          })
        });

        Alert.alert('Success', 'You are now a premium user!');
      }
    } catch (err) {
      if (err.code !== 'E_USER_CANCELLED') {
        Alert.alert('Error', err.message || 'Purchase failed');
      }
    }
  };

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

          <Text style={styles.premiumInfoTitle}>Repromptt Plus</Text>
           <Text style={styles.infoLabel}></Text>
          <Text style={styles.infoLabel}>- Unlock Unlimited Prompts Generation</Text>
          <Text style={styles.infoLabel}>- Get advanced Learning Features</Text>
          <Text style={styles.infoLabel}>- $11.99/month (Base Price, May vary on your country Regions)</Text>
         
          <TouchableOpacity style={styles.premiumBtn} onPress={purchase}>
            <Text style={styles.btnText}>Subscribe</Text>
          </TouchableOpacity>
           <View style={{alignItems:'center'}}>
          <TouchableOpacity >
            <Text style={{color:'grey'}}>with auto-renew, cancel anytime</Text>
            <Text></Text>
          </TouchableOpacity>
        
          </View>
          <View style={{alignItems:'center'}}>

          <TouchableOpacity onPress={() => Linking.openURL('https://play.google.com/about/play-terms/')}>
            <Text style={{textDecorationLine: 'underline'}}>Google Play Terms</Text>

          </TouchableOpacity>
          <TouchableOpacity onPress={() => Linking.openURL('https://www.repromptt.com/privacy_policy.md')}>
            <Text style={{textDecorationLine: 'underline'}}>Privacy & Terms</Text>

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
          <Text style={{ fontSize: 10, textAlign: 'center', marginTop: -5, color: "#5b3ba3", fontWeight: '700' }}>Back</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

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
  divider: {
    height: 1,
    backgroundColor: "#ddd",
    width: "90%",
    marginVertical: 16,
  },
  infoCardFull: {
    backgroundColor: "#fff",
    width: "100%",
    marginTop:30,
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
    fontWeight: "900",
    fontSize: 18,
    color: "#5b3ba3",
    marginBottom: 6,
  },
  premiumFeature: {
    fontSize: 14,
    color: "#4e3b7c",
    marginBottom: 4,
  },
  premiumBtn: {
    marginTop:40,
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
  
  

  
});
