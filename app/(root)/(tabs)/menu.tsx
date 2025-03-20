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

import axios from "axios";

function menu() {
  
  const [insights, setInsights] = useState(null);
  const { userId } = useLocalSearchParams();
  const [modalVisible, setModalVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    axios
      .get(`http://localhost:5000/user/${userId}/insights`)
      .then(response => setInsights(response.data))
      .catch(error => console.error("Error fetching data:", error));
  }, [userId]);

  interface Message {
    id: number;
    text: string;
    isUser: boolean;
  }
  if (!insights) return <Text>Loading...</Text>;
  
  const handleSendMessage=()=>{

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
                
                <Text className='text-3xl font-rubik-bold' style={{color: '#052659'}}>{userId}</Text>
                </View>


                

      
      {/* <Pressable onPress={() => setModalVisible(true)} style={{display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 10, margin:'auto',backgroundColor: '#f2d3ff', borderRadius: 10,width: 250}}>
        <Text>Open Chatbot Modal</Text>
      </Pressable> */}
      

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <FlatList
              data={messages}
              renderItem={({ item }) => (
                <View style={[styles.messageContainer, item.isUser ? styles.userMessage : styles.botMessage]}>
                  <Text>{item.text}</Text>
                </View>
              )}
              keyExtractor={item => item.id.toString()}
            />
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.textInput}
                placeholder="Type a message..."
                value={message}
                onChangeText={setMessage}
                onSubmitEditing={handleSendMessage}
              />
            </View>
            <Pressable
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>


       

                <View style={styles.container}>
                <Text style={{ fontSize:24, color:'7DA0CA', fontWeight:'bold',paddingBottom:10}}>Your Insights</Text>

      <View style={styles.card}>
        <Text style={styles.title}>Total Expense</Text>
        <Text style={styles.value}>₹{insights.totalExpense}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>My Expenses</Text>
        <Text style={styles.value}>₹{insights.totalMyExpense}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>Top Category</Text>
        <Text style={styles.value}>{insights.topCategory.name}: ₹{insights.topCategory.amount}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>Most Common Contact</Text>
        <Text style={styles.value}>{insights.topContact.name} ({insights.topContact.count} times)</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.title}>Count of Expenses</Text>
        <Text style={styles.value}>{insights.expensescnt}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>Avg. Expense Per Item</Text>
        <Text style={styles.value}>₹{insights.averageExpense}</Text>
      </View>
    </View>
                
    
       


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
