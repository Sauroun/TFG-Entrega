import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';

interface CardItemProps {
  card: {
    id: string;
    name: string;
    type_line: string;
    image_uris?: {
      normal: string;
    };
    oracle_text?: string;
  };
}

const CardItem: React.FC<CardItemProps> = ({ card }) => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <TouchableOpacity onPress={() => navigation.navigate('CardDetail', { card })}>
      <View style={styles.card}>
        <Image source={{ uri: card.image_uris?.normal }} style={styles.image} />
        <Text style={styles.name}>{card.name}</Text>
        <Text style={styles.type}>{card.type_line}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default CardItem;

const styles = StyleSheet.create({
  card: {
    margin: 10,
    padding: 10,
    borderWidth: 1,
    borderRadius: 8,
    alignItems: 'center'
  },
  image: {
    width: 100,
    height: 140,
    resizeMode: 'contain'
  },
  name: {
    fontWeight: 'bold',
    marginTop: 5
  },
  type: {
    fontStyle: 'italic',
    color: '#555'
  }
});

