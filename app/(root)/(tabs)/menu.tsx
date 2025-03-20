import Reviewcards from '@/components/discount';
import MenuCard from '@/components/MenuCard';
import images from '@/constants/images'
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, FlatList, TouchableOpacity, TextInput, Button, Modal, Pressable, StyleSheet,Alert,ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from "expo-router";
import { FaMoneyBill } from "react-icons/fa";
import { SiBuymeacoffee } from "react-icons/si";
import { MdMoreTime } from "react-icons/md";

import { FaArrowsSplitUpAndLeft } from "react-icons/fa6";

import { CiTimer } from "react-icons/ci";

import { IoIosContact } from "react-icons/io";

import axios from "axios";

function menu() {
  const [insights, setInsights] = useState(null);
  const { userId } = useLocalSearchParams();

  useEffect(() => {
    axios
      .get(`http://localhost:5000/user/${userId}/insights`)
      .then(response => setInsights(response.data))
      .catch(error => console.error("Error fetching data:", error));
  }, [userId]);

  if (!insights) return <Text>Loading...</Text>;
  return (
    <SafeAreaView  style={{backgroundColor: '#f2d3bd', flex: 1}} >
        <ScrollView>
                <View style={{ backgroundColor: '#af8064', padding: 10, display:'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={{ fontSize: 24, fontWeight: 'bold' }}>Splitkaro &beta;</Text>
                      <FaArrowsSplitUpAndLeft style={{ fontSize: 24, fontWeight: 'bold' }} />
                </View>
                <View style={{display: 'flex', flexDirection: 'column', padding: 10,justifyContent: 'center', alignItems: 'center'}}>
                <IoIosContact style={{fontSize: 180, fontWeight: 'bold' }} />
                <Text className='text-3xl font-rubik-bold' style={{color: '#41221b'}}>{userId}</Text>
                </View>
                <View style={styles.container}>
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
        <Text style={styles.title}>Avg. Expense Per Item</Text>
        <Text style={styles.value}>₹{insights.averageExpense}</Text>
      </View>
    </View>
                
    
       


          </ScrollView>
          </SafeAreaView>
  )
};
const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  card: {
    backgroundColor: "#f8f9fa",
    padding: 15,
    borderRadius: 8,
    marginVertical: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  value: {
    fontSize: 18,
    fontWeight: "600",
    color: "#007bff",
    marginTop: 5,
  },
});


export default menu
