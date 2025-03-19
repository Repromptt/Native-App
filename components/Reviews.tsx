import React from 'react';
import { View, Text, Image, StyleSheet, ImageSourcePropType } from 'react-native';

interface ReviewCardProps {
  item: {
    avatar: ImageSourcePropType;
    name: string;
    review: string;
    rating: number; // Assuming rating is out of 5
  };
}

const ReviewCard: React.FC<ReviewCardProps> = ({ item }) => {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Image source={item.avatar} style={styles.avatar} tintColor={"#4e250f"} />
        <View style={styles.headerContent}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.rating}>{'\u2605'.repeat(item.rating)}{'\u2606'.repeat(5 - item.rating)}</Text>
        </View>
      </View>
      <Text style={styles.review} className='font-rubik-Light'>{item.review}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    margin: 5,
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#af8064',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 25,
    marginRight: 10,
    

  },
  headerContent: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '900',
    color: '#333',
  },
  rating: {
    fontSize: 14,
    color: '#fff', // Gold color for stars
  },
  review: {
    fontSize: 14,
    color: '#361b08',
    
  },
});

export default ReviewCard;
