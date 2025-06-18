import Reviewcards from '@/components/discount';
import MenuCard from '@/components/MenuCard';
import images from '@/constants/images'
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, FlatList, TouchableOpacity, TextInput, Button, Modal, Pressable, StyleSheet,Alert,ActivityIndicator,Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from "expo-router";

import Entypo from '@expo/vector-icons/Entypo';

import { useRouter } from "expo-router";
import Feather from '@expo/vector-icons/Feather';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Fontisto from '@expo/vector-icons/Fontisto';
import icons from "@/constants/icons";
import AsyncStorage from "@react-native-async-storage/async-storage";


import axios from "axios";

function menu() {
  const router = useRouter(); // Make sure this is inside your component
  const [userId, setUserId] = useState(null);
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
const handleLogout = async () => {
  try {
    await AsyncStorage.clear();
    Alert.alert("Logged Out", "You have been logged out.");
    router.replace("/"); // Replace with your login screen route
  } catch (error) {
    console.error("Failed to logout:", error);
    Alert.alert("Error", "Could not log out. Please try again.");
  }
};
 

  

  return (
    <SafeAreaView  style={{backgroundColor: '#c1e8ff', flex: 1}} >
        <ScrollView>
                <View style={{ backgroundColor: '#5483B3', padding: 10, display:'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={{ fontSize: 24, fontWeight: 'bold' }}>Splitkaro &beta;</Text>
                      <MaterialCommunityIcons name="set-split" size={48} color="black" />
                      </View>
                <View style={{display: 'flex', flexDirection: 'column', padding: 10,justifyContent: 'center', alignItems: 'center'}}>
                 <Image source={icons.person} style={{ width: 150, height: 150,tintColor:"#021024"}} />
                
                <Text className='text-3xl font-rubik-bold' style={{color: '#052659'}}>  Hello {userId}</Text>
                </View>
                {/* Add a logout button that clears all asyncstorage  */}

                <TouchableOpacity
    onPress={handleLogout}
    style={{
      backgroundColor: '#021024',
      padding: 10,
      borderRadius: 8,
      marginTop: 20,
      width: 150,
      alignItems: 'center',
    }}
  >
    <Text style={{ color: 'white', fontWeight: 'bold' }}>Logout</Text>
  </TouchableOpacity>
       


          </ScrollView>
          </SafeAreaView>
  )
};

const styles = StyleSheet.create({

  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    width: '90%',
    height: '80%',
    borderRadius: 10,
    padding: 20,
  },
  messageContainer: {
    padding: 10,
    marginVertical: 5,
    borderRadius: 10,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#ADD8E6',
  },
  botMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#ededed',
  },
  inputContainer: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
  },
  textInput: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 5,
    borderColor: 'gray',
    borderWidth: 1,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 10,
    backgroundColor: '#007bff',
    borderRadius: 5,
  },
  container: {
    padding: 20,
    marginBottom:80,
  },
  card: {
    backgroundColor: "#7da0ca",
    padding: 15,
    borderRadius: 8,
    marginVertical: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#021024",
  },
  value: {
    fontSize: 18,
    fontWeight: "600",
    color: "#052659",
    marginTop: 5,
  },
});


export default menu
