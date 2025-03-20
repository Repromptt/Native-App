import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, FlatList, TouchableOpacity, TextInput, Button, Modal, Pressable, StyleSheet,Alert,ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from "expo-router";
import { FaMoneyBill } from "react-icons/fa";
import { SiBuymeacoffee } from "react-icons/si";
import { MdMoreTime } from "react-icons/md";
import { useRouter } from "expo-router";
import { FaArrowsSplitUpAndLeft } from "react-icons/fa6";
import { IoIosContact } from "react-icons/io";
import { CiTimer } from "react-icons/ci";

const fetchWithSelfSignedCert = async () => {
  try {
    const response = await RNFetchBlob.fetch('GET', 'https://your-self-signed-server.com/api/data', {
      trusty: true, // Trust the self-signed certificate
    });
    console.log(response.data);
  } catch (error) {
    console.error('Error fetching data:', error);
  }
};
const router = useRouter();

const Explore = () => {
  const [value, onChangeText] = useState('');
  const [selectedContacts, setSelectedContacts] = useState<{ id: number; name: string; phone: string }[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  // Predefined contact list
  const allContacts = [
    { id: 1, name: 'John Doe', phone: '123-456-7890' },
    { id: 2, name: 'Jane Smith', phone: '987-654-3210' },
    { id: 3, name: 'Alice Johnson', phone: '555-666-7777' },
    { id: 4, name: 'Bob Brown', phone: '444-333-2222' },
    { id: 5, name: 'John joe', phone: '123-456-7890' },
    { id: 6, name: 'Jane james', phone: '987-654-3210' },
    { id: 7, name: 'Alice tom', phone: '555-666-7777' },
    { id: 8, name: 'Bob henry', phone: '444-333-2222' },
  ];
  const { userId } = useLocalSearchParams(); // Get userId from URL params


  const handleList = async () => {
    console.log(userId);
    const expenseData = {
      userId: userId, // Ensure 'userId' is correctly referenced
      brief: value,
      contacts: selectedContacts.map(contact => `${contact.name} - ${contact.phone}`),
    };
  
    try {
      const response = await fetch('http://localhost:5000/add-expense', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(expenseData),
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
      console.log('Expense added:', data);
  
      setModalVisible(false);
      setSelectedContacts([]);
      onChangeText('');
      setSearchQuery('');
    } catch (error) {
      console.error('Error adding expense:',error);
    }
  };
  
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const response = await fetch(`http://localhost:5000/expenses?userId=${userId}`); // Assuming your backend accepts userId as a query parameter
        const data = await response.json();
  
        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch expenses");
        }
  
        setExpenses(data.expenses);
      } catch (error) {
        Alert.alert("Error");
      } finally {
        setLoading(false);
      }
    };

    const intervalId = setInterval(fetchExpenses, 10000); // Refresh every 10 seconds

    fetchExpenses(); // Initial fetch

    return () => clearInterval(intervalId); // Cleanup interval on component unmount
  }, [userId]);
  
  

  const handleContactSelect = (contact: { id: number; name: string; phone: string }) => {
    if (selectedContacts.includes(contact)) {
      setSelectedContacts(selectedContacts.filter(c => c.id !== contact.id));
    } else {
      setSelectedContacts([...selectedContacts, contact]);
    }
  };

  const filteredContacts = allContacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
 
  return (
    <SafeAreaView style={{ backgroundColor: '#f2d3bd', flex: 1 }}>
    <ScrollView>
      <View style={{ backgroundColor: '#af8064', padding: 10, display:'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold' }}>Splitkaro &beta;</Text>
        <FaArrowsSplitUpAndLeft style={{ fontSize: 24, fontWeight: 'bold' }} />

      </View>

      <View style={{display:'flex', flexDirection:'row', justifyContent:'space-between',alignItems:'center'}}>

      <Text style={{ fontSize: 30, fontWeight: "bold", marginBottom: 10, paddingLeft:10,padding:20 }}>
        Welcome, {userId}
      </Text>
      <TouchableOpacity
      onPress={() => router.push(`/menu?userId=${userId}`)}
      style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "transparent",
        padding: 10,
        borderRadius: 8,
      }}
    >
     
      <IoIosContact style={{ fontSize: 36, color: "Black", marginLeft: 5 }} />
     
    </TouchableOpacity>
      </View>

     

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(!modalVisible)}
      >
        <View style={{
          margin: 20,
          backgroundColor: 'white',
          borderRadius: 20,
          padding: 35,
          alignItems: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 4,
          elevation: 5,
        }}>
          <Text style={{ marginBottom: 15, textAlign: 'left', fontWeight:'500', fontSize:'24px' }}>Brief about Expense</Text>
          <TextInput
            editable
            multiline
            numberOfLines={4}
            maxLength={100}
            onChangeText={text => onChangeText(text)}
            value={value}
            style={{
              borderColor: 'gray',
              borderWidth: 1,
              padding: 10,
              marginBottom: 20,
              width: '100%',
            }}
          />
          <FlatList
            data={selectedContacts}
            horizontal={true}
            renderItem={({ item }) => (
              <View key={item.id} style={{
                padding: 10,
                borderBottomWidth: 1,
                borderBottomColor: 'gray',
              }}>
                <Text style={{ fontSize: 16 }}>{item.name}</Text>
              </View>
            )}
            keyExtractor={(item) => item.id.toString()}
          />

          <Text style={{ marginBottom: 15, textAlign: 'left' }}>Select Contacts to Split Bill</Text>
          <TextInput
            placeholder="Search Contacts"
            style={{
              borderColor: 'gray',
              borderWidth: 1,
              padding: 10,
              marginBottom: 10,
              width: '100%',
            }}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />

          {searchQuery.length > 0 && (
            <FlatList
              data={filteredContacts.slice(0, 2)}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => handleContactSelect(item)}>
                  <View style={{
                    padding: 10,
                    borderBottomWidth: 1,
                    borderBottomColor: 'gray',
                  }}>
                    <Text style={{ fontSize: 16 }}>{item.name}</Text>
                    {selectedContacts.some(contact => contact.id === item.id) && (
                      <Text style={{ color: 'green', fontSize: 14 }}>Selected</Text>
                    )}
                  </View>
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item.id.toString()}
            />
          )}

          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            width: '100%',
          }}>
            <Pressable
              style={[
                {
                  borderRadius: 20,
                  paddingHorizontal: 20,
                  paddingVertical: 10,
                  elevation: 2,
                  backgroundColor: '#2196F3',
                },
              ]}
              onPress={() => setModalVisible(!modalVisible)}
            >
              <Text>Close</Text>
            </Pressable>
            <Pressable
              style={[
                {
                  borderRadius: 20,
                  paddingHorizontal: 20,
                  paddingVertical: 10,
                  elevation: 2,
                  backgroundColor: '#F194FF',
                },
              ]}
              onPress={handleList}
            >
              <Text>Submit</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Pressable
        style={{
          borderRadius: 20,
          paddingHorizontal: 10,
          paddingVertical: 10,
          height: '15vh',
          margin: 10,
          elevation: 2,
          backgroundColor: '#F194FF',
        display: 'flex',
        flexDirection: 'row'
        ,justifyContent: 'center',
        alignItems:'center'
      }}

        onPress={() => setModalVisible(true)}
      >
        <SiBuymeacoffee style={{fontSize: 48, fontWeight: "bold", marginBottom: 10}} />
        <Text style={{fontSize: 24, fontWeight: "bold", marginBottom: 10}}>Add your Expense 
        </Text>
        
      </Pressable>

      <View style={{ flex: 1, padding: 20, backgroundColor: "#f5f5f5" }}>
        <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center'}}>
      <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 10 }}>
        Recent Expenses    
      </Text>
      <MdMoreTime style={{ fontSize: 24, fontWeight: "bold", marginBottom: 10 }} />
      </View>
      


      {loading ? (
        <ActivityIndicator size="large" color="#11aadd" />
      ) : expenses.length === 0 ? (
        <Text>No expenses found.</Text>
      ) : (
        <FlatList
          data={expenses}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <View
              style={{
                backgroundColor: "#fff",
                padding: 15,
                borderRadius: 10,
                marginBottom: 10,
                shadowColor: "#000",
                shadowOpacity: 0.1,
                shadowRadius: 5,
                shadowOffset: { width: 0, height: 3 },
                elevation: 3, // For Android shadow
              }}
            >
              <Text style={{ fontSize: 18, fontWeight: "bold" }}>{item.itemName}</Text>
              <Text>total Amount: ₹{item.expenseAmount}</Text>
              <Text>Category: {item.category}</Text>
              <Text>My Amount: {item.myexpense}</Text>
              <Text>Contacts: {item.contacts.join(", ") || "None"}</Text>
              <Text>Date: {item.createdAt ? item.createdAt.substring(0, 10) : "None"}</Text>

            </View>
          )}
        />
      )}
    </View>
    </ScrollView>
   
  </SafeAreaView>
  );
}
export default Explore;


