import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  Button,
  Modal,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { useDecks } from '../context/DeckContext';

type Props = NativeStackScreenProps<RootStackParamList, 'CardDetail'>;

export default function CardDetailScreen({ route }: Props) {
  const { card } = route.params;
  const [showLegalModal, setShowLegalModal] = useState(false);
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [showPrintsModal, setShowPrintsModal] = useState(false);
  const [rulings, setRulings] = useState<any[]>([]);
  const [loadingRules, setLoadingRules] = useState(false);
  const [prints, setPrints] = useState<any[]>([]);
  const [loadingPrints, setLoadingPrints] = useState(false);
  const [selectedCard, setSelectedCard] = useState(card);

  const { activeDeckId, addCardToDeck } = useDecks();

  // Cargar rulings
  const fetchRulings = async () => {
    if (!selectedCard.rulings_uri) return;
    setLoadingRules(true);
    try {
      const res = await fetch(selectedCard.rulings_uri);
      const data = await res.json();
      setRulings(data.data || []);
    } catch (err) {
      console.error('Error al cargar rulings:', err);
    } finally {
      setLoadingRules(false);
    }
  };

  // Cargar ediciones/prints
  const fetchPrints = async () => {
    if (!selectedCard.prints_search_uri) return;
    setLoadingPrints(true);
    try {
      const res = await fetch(selectedCard.prints_search_uri);
      const data = await res.json();
      setPrints(data.data || []);
    } catch (err) {
      console.error('Error al cargar ediciones:', err);
    } finally {
      setLoadingPrints(false);
    }
  };

  useEffect(() => {
    if (showRulesModal) {
      fetchRulings();
    }
  }, [showRulesModal]);

  useEffect(() => {
    if (showPrintsModal) {
      fetchPrints();
    }
  }, [showPrintsModal]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{selectedCard.name}</Text>
      <Image source={{ uri: selectedCard.image_uris?.normal }} style={styles.image} />
      <Text style={styles.text}>{selectedCard.type_line}</Text>
      {selectedCard.oracle_text && <Text style={styles.text}>{selectedCard.oracle_text}</Text>}

      <Button title="LEGALIDAD" onPress={() => setShowLegalModal(true)} />
      <Button title="REGLAS" onPress={() => setShowRulesModal(true)} />
      <Button title="CAMBIAR EDICIÓN" onPress={() => setShowPrintsModal(true)} />
      {activeDeckId && (
        <Button
          title="Añadir esta edición al mazo"
          onPress={() => {
            addCardToDeck(selectedCard);
            alert(`Carta añadida: ${selectedCard.name}`);
          }}
        />
      )}

      {/* Modal Legalidades */}
      <Modal visible={showLegalModal} animationType="slide">
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Legalidad en formatos</Text>
          <ScrollView>
            {Object.entries(selectedCard.legalities || {}).map(([format, status]) => {
              const statusStr = String(status).toUpperCase();
              return (
                <View key={format} style={styles.legalRow}>
                  <Text style={styles.legalFormat}>{format.toUpperCase()}</Text>
                  <Text style={[styles.legalStatus, statusStr !== 'LEGAL' && styles.illegal]}>
                    {statusStr}
                  </Text>
                </View>
              );
            })}
          </ScrollView>
          <Button title="Cerrar" onPress={() => setShowLegalModal(false)} />
        </View>
      </Modal>

      {/* Modal Rulings */}
      <Modal visible={showRulesModal} animationType="slide">
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Reglas / Rulings</Text>
          {loadingRules ? (
            <ActivityIndicator size="large" />
          ) : (
            <ScrollView>
              {rulings.length === 0 ? (
                <Text>No hay rulings disponibles para esta carta.</Text>
              ) : (
                rulings.map((ruling, index) => (
                  <View key={index} style={styles.ruleRow}>
                    <Text style={styles.ruleDate}>{ruling.published_at}</Text>
                    <Text>{ruling.comment}</Text>
                  </View>
                ))
              )}
            </ScrollView>
          )}
          <Button title="Cerrar" onPress={() => setShowRulesModal(false)} />
        </View>
      </Modal>

      {/* Modal Ediciones */}
      <Modal visible={showPrintsModal} animationType="slide">
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Seleccionar edición</Text>
          {loadingPrints ? (
            <ActivityIndicator size="large" />
          ) : (
            <ScrollView>
              {prints.map((p) => (
                <TouchableOpacity key={p.id} onPress={() => {
                  setSelectedCard(p);
                  setShowPrintsModal(false);
                }}>
                  <Image source={{ uri: p.image_uris?.normal }} style={styles.image} />
                  <Text style={{ textAlign: 'center' }}>{p.set_name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
          <Button title="Cerrar" onPress={() => setShowPrintsModal(false)} />
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  image: { width: 250, height: 350, marginBottom: 10 },
  text: { fontSize: 16, textAlign: 'center', marginBottom: 10 },
  modalContent: { flex: 1, padding: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  legalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  legalFormat: { fontWeight: 'bold' },
  legalStatus: { textTransform: 'uppercase' },
  illegal: { color: 'red' },
  ruleRow: {
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  ruleDate: { fontWeight: 'bold', marginBottom: 4 },
});
