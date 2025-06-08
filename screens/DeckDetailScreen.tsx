import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  Alert,
  Modal,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { RouteProp, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';
import { useDecks, DeckCard } from '../context/DeckContext';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button } from 'react-native-paper';
import * as Clipboard from 'expo-clipboard';

type DeckDetailRouteProp = RouteProp<RootStackParamList, 'DeckDetail'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface Props {
  route: DeckDetailRouteProp;
}

export default function DeckDetailScreen({ route }: Props) {
  const { deckId } = route.params;
  const { decks, setActiveDeck, removeCardFromDeck, updateCardInDeck, setCommander, addCardToDeck } = useDecks();
  const navigation = useNavigation<NavigationProp>();
  const deck = decks.find((d) => d.id === deckId);

  const [editCard, setEditCard] = useState<DeckCard | null>(null);
  const [editQuantity, setEditQuantity] = useState(1);
  const [editSideboard, setEditSideboard] = useState(false);
  const [prints, setPrints] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);

  // Estados para modal comandante
  const [showCommanderModal, setShowCommanderModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  if (!deck) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Mazo no encontrado</Text>
      </View>
    );
  }

  const handleSetActive = () => {
    setActiveDeck(deck.id);
    Alert.alert('Mazo activo', `"${deck.name}" ahora es el mazo activo.`);
    navigation.goBack();
  };

  const handleEditPress = async (card: DeckCard) => {
    setEditCard(card);
    setEditQuantity(card.quantity);
    setEditSideboard(!!card.sideboard);
    setShowModal(true);
    try {
      const res = await fetch(card.card.prints_search_uri);
      const data = await res.json();
      setPrints(data.data);
    } catch (e) {
      setPrints([]);
    }
  };

  const handleSaveEdit = () => {
    if (!deck || !editCard) return;
    // Validación commander: solo 1 copia salvo básica
    if (
      deck.format === 'commander' &&
      !editSideboard &&
      editQuantity > 1 &&
      !(editCard.card.type_line && editCard.card.type_line.toLowerCase().includes('basic land'))
    ) {
      Alert.alert('Restricción', 'Solo puedes tener una copia de cada carta (salvo tierras básicas) en Commander.');
      return;
    }
    const updated: DeckCard = {
      ...editCard,
      quantity: editQuantity,
      sideboard: editSideboard,
    };
    updateCardInDeck(deck.id, updated, editCard.sideboard);
    setShowModal(false);
  };

  // Lógica para búsqueda y asignación de comandante
  const handleSearchCommander = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(`https://api.scryfall.com/cards/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      setSearchResults(data.data || []);
    } catch (e) {
      Alert.alert("Error", "No se pudieron buscar cartas.");
    } finally {
      setSearching(false);
    }
  };

  const handleSelectCommander = async (card: any) => {
  const canBeCommander =
    (card.type_line?.toLowerCase().includes("legendary") && card.type_line?.toLowerCase().includes("creature")) ||
    card.type_line?.toLowerCase().includes("planeswalker");
  if (!canBeCommander) {
    Alert.alert("No válido", "Solo puedes seleccionar criaturas legendarias o planeswalkers como comandante.");
    return;
  }
  // Añadir la carta al deck si no existe
  const cardAlreadyInDeck = deck.cards.some((c) => c.card.id === card.id);
  if (!cardAlreadyInDeck) {
    await new Promise<void>((resolve) => {
      addCardToDeck(card, false);
      setTimeout(resolve, 350); // Puedes ajustar el tiempo si va muy rápido/lento
    });
  }
  setCommander(deck.id, card.id);
  setShowCommanderModal(false);
  setSearchResults([]);
  setSearchQuery('');
  Alert.alert("Comandante asignado", `${card.name} es ahora el comandante de tu mazo.`);
};


  const handleRemoveCommander = () => {
    setCommander(deck.id, null);
    Alert.alert("Comandante eliminado", "Ya no hay comandante en el mazo.");
  };

  // Vista principal
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{deck.name}</Text>

      {/* Avisos de legalidad para Commander */}
      {deck.format === 'commander' && (
        <View style={{ marginBottom: 12 }}>
          {!deck.commanderId && (
            <Text style={{ color: 'red', textAlign: 'center', fontWeight: 'bold' }}>
              ¡Este deck no tiene comandante!
            </Text>
          )}
          {deck.cards.filter(c => !c.sideboard).reduce((sum, c) => sum + c.quantity, 0) + (deck.commanderId ? 1 : 0) < 100 && (
            <Text style={{ color: 'red', textAlign: 'center' }}>
              El deck debe tener 100 cartas (99 + comandante)
            </Text>
          )}
        </View>
      )}

      {/* Botón Asignar/Cambiar/Quitar Comandante */}
      {deck.format === "commander" && (
        <View style={{ marginBottom: 10, alignItems: "center" }}>
          <Button
            mode="contained"
            style={{ marginBottom: 5, backgroundColor: "#0066aa" }}
            onPress={() => setShowCommanderModal(true)}
          >
            {deck.commanderId ? "Cambiar comandante" : "Asignar comandante"}
          </Button>
          {deck.commanderId && (
            <Button
              mode="outlined"
              style={{ marginBottom: 5 }}
              onPress={handleRemoveCommander}
            >
              Quitar comandante
            </Button>
          )}
          {/* Mostrar el comandante actual si existe */}
          {deck.commanderId && (() => {
            const commander = deck.cards.find((c) => c.card.id === deck.commanderId);
            return commander ? (
              <View style={{ alignItems: "center" }}>
                <Image
                  source={{ uri: commander.card.image_uris?.normal }}
                  style={{ width: 70, height: 100, borderRadius: 8, marginVertical: 4 }}
                />
                <Text style={{ fontWeight: "bold" }}>{commander.card.name}</Text>
              </View>
            ) : null;
          })()}
        </View>
      )}

      {/* Modal para buscar y asignar comandante */}
      <Modal visible={showCommanderModal} animationType="slide">
        <View style={{ flex: 1, padding: 20, backgroundColor: "#fff" }}>
          <Text style={{ fontWeight: "bold", fontSize: 18, marginBottom: 12 }}>
            Buscar y asignar comandante
          </Text>
          <TextInput
            placeholder="Nombre de la carta"
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={{
              borderWidth: 1,
              borderColor: "#ccc",
              borderRadius: 8,
              padding: 10,
              marginBottom: 12,
            }}
          />
          <Button mode="contained" onPress={handleSearchCommander} disabled={searching}>
            {searching ? "Buscando..." : "Buscar"}
          </Button>
          <ScrollView style={{ marginTop: 16 }}>
            {searchResults.length === 0 && !searching && (
              <Text style={{ color: "#888", textAlign: "center" }}>
                No hay resultados
              </Text>
            )}
            {searchResults.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={{
                  padding: 10,
                  borderBottomWidth: 1,
                  borderColor: "#eee",
                  flexDirection: "row",
                  alignItems: "center",
                }}
                onPress={() => handleSelectCommander(item)}
              >
                {item.image_uris?.small && (
                  <Image
                    source={{ uri: item.image_uris.small }}
                    style={{ width: 40, height: 56, marginRight: 10 }}
                  />
                )}
                <Text style={{ fontWeight: "bold" }}>{item.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <Button onPress={() => setShowCommanderModal(false)} style={{ marginTop: 16 }}>
            Cerrar
          </Button>
        </View>
      </Modal>

      <Button
        mode="contained"
        style={{ marginBottom: 10 }}
        onPress={() => {
          const exportText = deck.cards
            .map((entry) => `${entry.card.name} x${entry.quantity}${entry.sideboard ? ' (Sideboard)' : ''}`)
            .join('\n');
          Clipboard.setStringAsync(exportText);
          Alert.alert('Mazo exportado', 'El contenido ha sido copiado al portapapeles.');
        }}
      >
        Exportar mazo
      </Button>

      <Button mode="outlined" onPress={handleSetActive} style={{ marginBottom: 20 }}>
        Usar este mazo como activo
      </Button>

      <FlatList
        data={deck.cards}
        keyExtractor={(item) => item.card.id + (item.sideboard ? '_side' : '_main')}
        renderItem={({ item }) => {
          const legality = item.card.legalities?.[deck.format];
          const isIllegal = legality !== 'legal';
          const isCommander = deck.commanderId === item.card.id && !item.sideboard;

          return (
            <TouchableOpacity onPress={() => handleEditPress(item)}>
              <View style={[
                styles.card,
                isIllegal && styles.illegal,
                isCommander && styles.commander
              ]}>
                <Image source={{ uri: item.card.image_uris?.normal }} style={styles.image} />
                <Text>
                  {item.card.name} x{item.quantity}
                  {item.sideboard ? ' (Sideboard)' : ''}
                  {isCommander ? ' [Comandante]' : ''}
                </Text>
                {isIllegal && (
                  <Text style={styles.illegalLabel}>❌ No legal en {deck.format}</Text>
                )}
                <Button
                  mode="outlined"
                  onPress={() => removeCardFromDeck(deck.id, item.card.id)}
                  style={{ marginTop: 6 }}
                >
                  Eliminar
                </Button>
              </View>
            </TouchableOpacity>
          );
        }}
      />

      {/* Modal de edición */}
      <Modal visible={showModal} animationType="slide">
        <ScrollView contentContainerStyle={{ padding: 20 }}>
          {editCard && (
            <>
              <Text style={styles.title}>{editCard.card.name}</Text>
              <Image source={{ uri: editCard.card.image_uris?.normal }} style={styles.image} />
              <Text>Cantidad:</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 10 }}>
                <Button onPress={() => setEditQuantity(Math.max(1, editQuantity - 1))}>-</Button>
                <Text style={{ marginHorizontal: 10 }}>{editQuantity}</Text>
                <Button onPress={() => setEditQuantity(editQuantity + 1)}>+</Button>
              </View>
              <Text>¿Sideboard?</Text>
              <Button
                mode={editSideboard ? 'contained' : 'outlined'}
                onPress={() => setEditSideboard(!editSideboard)}
                style={{ marginVertical: 8 }}
              >
                {editSideboard ? 'En Sideboard' : 'En mazo principal'}
              </Button>

              {/* Botón para marcar como comandante */}
              {deck.format === 'commander' && (
                <Button
                  mode={deck.commanderId === editCard.card.id ? 'contained' : 'outlined'}
                  onPress={() => {
                    // Validar que sea criatura legendaria antes de marcar
                    if (
                      !(
                        editCard.card.type_line &&
                        editCard.card.type_line.toLowerCase().includes('legendary') &&
                        editCard.card.type_line.toLowerCase().includes('creature')
                      )
                    ) {
                      Alert.alert('Comandante inválido', 'El comandante debe ser una criatura legendaria.');
                      return;
                    }
                    setCommander(deck.id, editCard.card.id);
                    setShowModal(false);
                  }}
                  style={{ marginVertical: 8 }}
                >
                  {deck.commanderId === editCard.card.id
                    ? 'Quitar como Comandante'
                    : 'Marcar como Comandante'}
                </Button>
              )}

              <Text style={styles.title}>Cambiar edición</Text>
              {prints.map((print) => (
                <TouchableOpacity
                  key={print.id}
                  onPress={() => setEditCard({ ...editCard, card: print })}
                >
                  <Image source={{ uri: print.image_uris?.normal }} style={styles.image} />
                  <Text style={{ textAlign: 'center' }}>{print.set_name}</Text>
                </TouchableOpacity>
              ))}

              <Button mode="contained" onPress={handleSaveEdit} style={{ marginVertical: 20 }}>
                Guardar cambios
              </Button>
              <Button onPress={() => setShowModal(false)}>Cancelar</Button>
            </>
          )}
        </ScrollView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  card: {
    marginVertical: 8,
    padding: 10,
    borderWidth: 1,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  illegal: {
    borderColor: 'red',
    borderWidth: 2,
    backgroundColor: '#ffe6e6',
  },
  illegalLabel: {
    color: 'red',
    fontWeight: 'bold',
    marginTop: 4,
  },
  commander: {
    borderColor: 'blue',
    borderWidth: 2,
    backgroundColor: '#e6f0ff',
  },
  image: {
    width: 100,
    height: 140,
    resizeMode: 'contain',
    marginBottom: 6,
    alignSelf: 'center',
  },
});
