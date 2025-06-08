import React from 'react';
import { View, Button, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();

  return (
    <View style={styles.container}>
      <Text>Bienvenido</Text><Button title="Buscar cartas" onPress={() => navigation.navigate('Search')} />
      <Button title="Crear nuevo mazo" onPress={() => navigation.navigate('CreateDeck')} />
      <Button title="Ver mis mazos" onPress={() => navigation.navigate('Decks')} />
      <Button title="Contador de vidas" onPress={() => navigation.navigate('LifeCounter')} />

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
