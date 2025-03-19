import React from 'react';
import { View, Text, Image, StyleSheet, ImageSourcePropType } from 'react-native';

interface MenuCardProps {
  item: {
    image: ImageSourcePropType;
    name: string;
    description: string;
    price: string;
  };
}

const MenuCard: React.FC<MenuCardProps> = ({ item }) => {
  return (
    <View style={styles.card}>
      <Image source={item.image} style={styles.image} />
      <View style={styles.cardContent} className='pr-10'>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.description} className='mr-30'>{item.description}</Text>
        <Text style={styles.price}>{item.price}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    flexDirection: 'row',
    margin: 10,
    borderRadius: 10,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    overflow: 'hidden',
  },
  image: {
    width: '40%',
    height: 150,
  },
  cardContent: {
    padding: 10,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  description: {
    fontSize: 14,
    color: '#361b08',
    maxWidth:'80%'
  },
  price: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E91E63',
    paddingTop: 10
  },
});

export default MenuCard;
