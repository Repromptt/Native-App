import React from 'react';
import { View, Text, Image, StyleSheet, ImageSourcePropType } from 'react-native';

interface FeatureCardProps {
  item: {
    image: ImageSourcePropType;
    title: string;
    description: string;
  };
}

const Reviewcards: React.FC<FeatureCardProps> = ({ item }) => {
  return (
    <View style={styles.card}>
      <Image source={ item.image } style={styles.image} />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    margin: 5,
    borderRadius: 16,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 10,
    width: '100%',
    height: 250,
    
    borderColor: '#000',
    borderWidth: 4,
  },
  image: {
    width: '100%',
    height: 250,
    borderRadius: 8,
  },
  cardContent: {
    padding: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  description: {
    fontSize: 12,
    color: '#777',
  },
});

export default Reviewcards;