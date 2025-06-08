import React from 'react';
import {View,Text,FlatList,TouchableOpacity,StyleSheet,Alert} from 'react-native';
import { useDecks } from '../context/DeckContext';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { Button } from 'react-native-paper';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { v4 as uuidv4 } from 'uuid';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Decks'>;

export default function DeckListScreen() {
  const {
    decks,
    setActiveDeck,
    activeDeckId,
    removeDeck,
    addDeck,
  } = useDecks();
  const navigation = useNavigation<NavigationProp>();

  const handleSelectDeck = (id: string, name: string) => {
    setActiveDeck(id);
    Alert.alert('Mazo activo', `"${name}" ahora es el mazo activo.`);
  };

  const confirmDelete = (id: string, name: string) => {
    Alert.alert('Eliminar mazo', `¿Eliminar el mazo "${name}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => removeDeck(id) },
    ]);
  };

  const handleImportDeck = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: 'application/json' });

      if (!result.assets || result.canceled) return;

      const file = result.assets[0];
      const content = await FileSystem.readAsStringAsync(file.uri);
      const parsed = JSON.parse(content);

      if (!parsed.name || !parsed.cards) {
        Alert.alert('Archivo inválido', 'El JSON no tiene el formato correcto.');
        return;
      }

      const newDeck = {
        id: uuidv4(),
        name: parsed.name + ' (importado)',
        cards: parsed.cards.map((c: any) => ({
          card: { id: c.id, name: c.name },
          quantity: c.quantity || 1,
        })),
      };

      addDeck(newDeck);
      Alert.alert('Mazo importado', `Se ha añadido "${newDeck.name}".`);
    } catch (err) {
      Alert.alert('Error', 'No se pudo importar el archivo.');
      console.error(err);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tus mazos</Text>

      <Button mode="outlined" onPress={handleImportDeck} style={styles.importButton}>
        <Text>Importar mazo desde JSON</Text>
      </Button>

      <FlatList
        data={decks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const isActive = item.id === activeDeckId;

          return (
            <TouchableOpacity
              style={[styles.item, isActive && styles.activeItem]}
              onPress={() => {
                handleSelectDeck(item.id, item.name);
                navigation.navigate('DeckDetail', { deckId: item.id });
              }}
            >
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.count}>{item.cards.length} cartas</Text>
              {isActive && <Text style={styles.activeLabel}>Activo</Text>}
              <Button
                mode="outlined"
                onPress={() => confirmDelete(item.id, item.name)}
                style={{ marginTop: 8 }}
              >
                <Text>Eliminar mazo</Text>
              </Button>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  importButton: { marginBottom: 20 },
  item: {
    padding: 12,
    backgroundColor: '#e3e3e3',
    borderRadius: 6,
    marginVertical: 6,
  },
  activeItem: {
    backgroundColor: '#c6f6d5',
  },
  name: { fontSize: 18 },
  count: { fontSize: 14, color: '#555' },
  activeLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'green',
    marginTop: 4,
  },
});
