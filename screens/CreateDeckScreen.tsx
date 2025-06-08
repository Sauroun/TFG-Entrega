import React, { useState } from 'react';
import {
  View,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  Text,
} from 'react-native';
import { useDecks } from '../context/DeckContext';
import { useNavigation } from '@react-navigation/native';
import { v4 as uuidv4 } from 'uuid';
import { Picker } from '@react-native-picker/picker';
import type { DeckFormat } from '../context/DeckContext'; // 👈 importa el tipo correctamente

export default function CreateDeckScreen() {
  const [deckName, setDeckName] = useState('');
  const [format, setFormat] = useState<DeckFormat>('commander');
  const { addDeck } = useDecks();
  const navigation = useNavigation();

  const handleCreate = () => {
    if (deckName.trim() === '') {
      Alert.alert('Error', 'Debes ponerle nombre al mazo');
      return;
    }

    const newDeck = {
      id: uuidv4(),
      name: deckName.trim(),
      format: format,
      cards: [],
    };

    addDeck(newDeck);
    setDeckName('');
    setFormat('commander');
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Nombre del mazo"
        value={deckName}
        onChangeText={setDeckName}
        style={styles.input}
      />

      <Text style={styles.label}>Formato del mazo:</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={format}
          onValueChange={(itemValue) => setFormat(itemValue as DeckFormat)} // 👈 asegúrate del tipo
          style={styles.picker}
        >
          <Picker.Item label="Commander" value="commander" />
          <Picker.Item label="Modern" value="modern" />
          <Picker.Item label="Standard" value="standard" />
          <Picker.Item label="Legacy" value="legacy" />
          <Picker.Item label="Vintage" value="vintage" />
          <Picker.Item label="Pioneer" value="pioneer" />
        </Picker>
      </View>

      <Button title="Crear mazo" onPress={handleCreate} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  input: {
    borderWidth: 1,
    padding: 10,
    marginBottom: 10,
    borderRadius: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  pickerContainer: {
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 20,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    width: '100%',
  },
});
