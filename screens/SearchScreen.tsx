import React, { useState } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Button,
  Alert,
  ScrollView,
} from 'react-native';
import SearchBar from '../components/SearchBar';
import CardItem from '../components/CardItem';
import { useDecks } from '../context/DeckContext';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';

interface ScryfallCard {
  id: string;
  name: string;
  type_line: string;
  image_uris?: {
    normal: string;
  };
  oracle_text?: string;
  legalities?: Record<string, string>;
}

const SearchScreen = () => {
  const [query, setQuery] = useState('');
  const [color, setColor] = useState('');
  const [cmc, setCmc] = useState('');
  const [oracle, setOracle] = useState('');
  const [type, setType] = useState('');
  const [subtype, setSubtype] = useState('');
  const [set, setEdition] = useState('');
  const [legalFormats, setLegalFormats] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(true);

  const [results, setResults] = useState<ScryfallCard[]>([]);
  const [loading, setLoading] = useState(false);

  const { activeDeckId, addCardToDeck } = useDecks();

  const handleSearch = async () => {
    const isAnyFieldFilled = query || color || cmc || oracle || type || subtype || set || legalFormats.length > 0;
    if (!isAnyFieldFilled) return;

    setLoading(true);

    try {
      let fullQuery = query || '';

      if (color) fullQuery += ` color:${color}`;
      if (cmc) fullQuery += ` cmc=${cmc}`;
      if (oracle) fullQuery += ` o:"${oracle}"`;
      if (type || subtype) fullQuery += ` type:${[type, subtype].filter(Boolean).join(' ')}`;
      if (set) fullQuery += ` set:${set}`;
      legalFormats.forEach((format) => {
        fullQuery += ` legal:${format}`;
      });

      const response = await fetch(
        `https://api.scryfall.com/cards/search?q=${encodeURIComponent(fullQuery)}`
      );
      const data = await response.json();
      if (data.data) {
        setResults(data.data);
      } else {
        setResults([]);
      }
      setShowFilters(false);
    } catch (error) {
      console.error('Error buscando cartas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilters = () => {
    setQuery('');
    setColor('');
    setCmc('');
    setOracle('');
    setType('');
    setSubtype('');
    setEdition('');
    setLegalFormats([]);
  };

  return (
    <View style={styles.container}>
      {showFilters && (
        <ScrollView style={{ maxHeight: 300 }}>
          <SearchBar
            value={query}
            onChangeText={setQuery}
            placeholder="Buscar carta por nombre..."
          />

          <View style={styles.filters}>
            <SearchBar value={color} onChangeText={setColor} placeholder="Color (r, g, u, b, w)" />
            <SearchBar value={cmc} onChangeText={setCmc} placeholder="Coste de maná (3, <4, >2)" />
            <SearchBar value={oracle} onChangeText={setOracle} placeholder="Texto (draw, damage...)" />
            <SearchBar value={type} onChangeText={setType} placeholder="Tipo (creature, sorcery...)" />
            <SearchBar value={subtype} onChangeText={setSubtype} placeholder="Subtipo (elf, goblin...)" />
            <SearchBar value={set} onChangeText={setEdition} placeholder="Edición (khm, neo...)" />
            <Text style={styles.label}>Formatos legales:</Text>
            <View style={styles.formatList}>
              {['commander', 'modern', 'standard', 'legacy', 'vintage', 'pioneer'].map((format) => (
                <Button
                  key={format}
                  title={legalFormats.includes(format) ? `✓ ${format}` : format}
                  onPress={() => {
                    setLegalFormats((prev) =>
                      prev.includes(format)
                        ? prev.filter((f) => f !== format)
                        : [...prev, format]
                    );
                  }}
                />
              ))}
            </View>
            <Button title="Limpiar filtros" onPress={handleClearFilters} />
          </View>
        </ScrollView>
      )}

      <Button title={showFilters ? 'Buscar' : 'Mostrar filtros'} onPress={() => {
        if (showFilters) {
          handleSearch();
        } else {
          setShowFilters(true);
        }
      }} />

      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : results.length > 0 ? (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) =>
            item.image_uris ? (
              <View style={styles.cardContainer}>
                <CardItem card={item} />
                {activeDeckId ? (
                  <Button
                    title="Añadir al mazo"
                    onPress={() => {
                      addCardToDeck(item);
                      Alert.alert('Carta añadida', `"${item.name}" se ha añadido al mazo.`);
                    }}
                  />
                ) : (
                  <Text style={styles.noDeck}>Selecciona un mazo para añadir cartas</Text>
                )}
              </View>
            ) : null
          }
        />
      ) : (
        <Text style={styles.info}>No hay resultados</Text>
      )}
    </View>
  );
};

export default SearchScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  filters: {
    gap: 6,
    marginBottom: 10,
  },
  formatList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    justifyContent: 'flex-start',
    marginBottom: 10,
  },
  label: {
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 6,
  },
  info: {
    textAlign: 'center',
    marginTop: 20,
    fontStyle: 'italic',
  },
  cardContainer: {
    marginBottom: 10,
    alignItems: 'center',
  },
  noDeck: {
    color: '#888',
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 4,
  },
});
