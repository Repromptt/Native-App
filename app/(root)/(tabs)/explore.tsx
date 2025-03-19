import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, FlatList, TouchableOpacity, TextInput, Button, Modal, Pressable, StyleSheet,Alert,ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from "expo-router";

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
    const expenseData = {
      userId: userId, // Ensure 'userId' is correctly referenced
      brief: value,
      contacts: selectedContacts.map(contact => `${contact.name} - ${contact.phone}`),
    };
  
    try {
      const response = await fetch('https://localhost:5000/add-expense', {
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
      console.error('Error adding expense:');
    }
  };
  
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const response = await fetch(`http://localhost:5000/expenses/${userId}`); // Update with your backend URL
        const data = await response.json();
        console.log(response);

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

    fetchExpenses();
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
        <View style={{ backgroundColor: '#af8064', padding: 10 }}>
          <Text style={{ fontSize: 24, fontWeight: 'bold' }}>Home</Text>
        </View>

        

        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(!modalVisible)}
        >
          <View style={styles.modalView}>
            <Text style={styles.modalText}>Brief about Expense</Text>
            <TextInput
              editable
              multiline
              numberOfLines={4}
              maxLength={100}
              onChangeText={text => onChangeText(text)}
              value={value}
              style={styles.modalInput}
            />
            <FlatList
  data={selectedContacts}
  horizontal={true}
  renderItem={({ item }) => (
    <View key={item.id} style={styles.contactItem}>
      <Text style={styles.contactName}>{item.name}</Text>
    </View>
  )}
  keyExtractor={(item) => item.id.toString()}
/>


            <Text style={styles.modalText} className=''>Select Contacts to Split Bill</Text>
            <TextInput
              placeholder="Search Contacts"
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />

            {searchQuery.length > 0 && (
              <FlatList
                data={filteredContacts.slice(0, 2)}
                renderItem={({ item }) => (
                    <TouchableOpacity onPress={() => handleContactSelect(item)}>
                    <View style={styles.contactItem}>
                      <Text style={styles.contactName}>{item.name}</Text>
                      {selectedContacts.some(contact => contact.id === item.id) && (
                      <Text style={styles.selectedMarker}>Selected</Text>
                      )}
                    </View>
                    </TouchableOpacity>
                )}
                keyExtractor={(item) => item.id.toString()}
              />
            )}

            <View style={styles.buttonContainer}>
              <Pressable
                style={[styles.button, styles.buttonClose]}
                onPress={() => setModalVisible(!modalVisible)}
              >
                <Text>Close</Text>
              </Pressable>
              <Pressable
                style={[styles.button, styles.buttonOpen]}
                onPress={handleList}
              >
                <Text >Submit</Text>
              </Pressable>
            </View>
          </View>
        </Modal>

        <Pressable
          style={[styles.button, styles.buttonOpen]}
          onPress={() => setModalVisible(true)}
        >
          <Text>Show Modal</Text>
        </Pressable>
      </ScrollView>
      <View style={{ flex: 1, padding: 20, backgroundColor: "#f5f5f5" }}>
      <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 10 }}>
        Expenses for {userId}
      </Text>

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
              <Text>Amount: ₹{item.expenseAmount}</Text>
              <Text>Category: {item.category}</Text>
              <Text>Contacts: {item.contacts.join(", ") || "None"}</Text>
              
            </View>
          )}
        />
      )}
    </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  modalView: {
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
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
  modalInput: {
    borderColor: 'gray',
    borderWidth: 1,
    padding: 10,
    marginBottom: 20,
    width: '100%',
  },
  searchInput: {
    borderColor: 'gray',
    borderWidth: 1,
    padding: 10,
    marginBottom: 10,
    width: '100%',
  },
  contactItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'gray',
  },
  contactName: {
    fontSize: 16,
  },
  selectedMarker: {
    color: 'green',
    fontSize: 14,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  button: {
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    elevation: 2,
  },
  buttonOpen: {
    backgroundColor: '#F194FF',
  },
  buttonClose: {
    backgroundColor: '#2196F3',
  },
});

export default Explore;


