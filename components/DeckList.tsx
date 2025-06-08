import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';

interface DeckListProps {
  decks: string[];
  onSelectDeck: (deckName: string) => void;
}

const DeckList: React.FC<DeckListProps> = ({ decks, onSelectDeck }) => {
  return (
    <FlatList
      data={decks}
      keyExtractor={(item) => item}
      renderItem={({ item }) => (
        <TouchableOpacity onPress={() => onSelectDeck(item)} style={styles.item}>
          <Text>{item}</Text>
        </TouchableOpacity>
      )}
    />
  );
};

export default DeckList;

const styles = StyleSheet.create({
  item: {
    padding: 12,
    marginVertical: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 6
  }
});
