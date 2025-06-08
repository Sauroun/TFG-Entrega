// screens/LifeSetupScreen.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';

const FORMATS = ['Commander', 'Standard', 'Modern', 'Legacy'];
const LIFE_OPTIONS = [20, 25, 30, 40, 50, 60];
const PLAYER_OPTIONS = [1, 2, 3, 4, 5, 6];
const ORIENTATIONS = [
  { key: '2x2', label: '2x2' },
  { key: 'vertical', label: 'Vertical' },
  { key: 'horizontal', label: 'Horizontal' },
];

export default function LifeSetupScreen({ navigation }: any) {
  const [format, setFormat] = useState('Commander');
  const [startingLife, setStartingLife] = useState(40);
  const [players, setPlayers] = useState(4);
  const [orientation, setOrientation] = useState('2x2');

  // Dummy nav function (pon la navegación real si la tienes)
  const handleStart = () => {
    navigation.navigate('LifeCounter', {
      format,
      startingLife,
      players,
      orientation,
    });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#12132e' }}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>CONTADOR DE VIDAS</Text>
        <Text style={styles.menuIcon}>≡</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Selector de formato */}
        <Text style={styles.sectionTitle}>FORMATO</Text>
        <View style={styles.row}>
          {FORMATS.map(f => (
            <TouchableOpacity
              key={f}
              style={[
                styles.selectButton,
                format === f && styles.activeButtonBlue,
              ]}
              onPress={() => setFormat(f)}
            >
              <Text
                style={[
                  styles.buttonText,
                  format === f && styles.activeButtonText,
                ]}
              >
                {f}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Vida inicial */}
        <Text style={styles.sectionTitle}>TOTAL DE VIDAS INICIAL</Text>
        <View style={styles.row}>
          {LIFE_OPTIONS.map(life => (
            <TouchableOpacity
              key={life}
              style={[
                styles.selectButton,
                startingLife === life && styles.activeButtonRed,
              ]}
              onPress={() => setStartingLife(life)}
            >
              <Text
                style={[
                  styles.buttonText,
                  startingLife === life && styles.activeButtonText,
                ]}
              >
                {life}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Jugadores */}
        <Text style={styles.sectionTitle}>TOTAL DE JUGADORES</Text>
        <View style={styles.row}>
          {PLAYER_OPTIONS.map(p => (
            <TouchableOpacity
              key={p}
              style={[
                styles.selectButton,
                players === p && styles.activeButtonBlue,
              ]}
              onPress={() => setPlayers(p)}
            >
              <Text
                style={[
                  styles.buttonText,
                  players === p && styles.activeButtonText,
                ]}
              >
                {p}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Orientación */}
        <Text style={styles.sectionTitle}>ORIENTACIÓN</Text>
        <View style={styles.row}>
          {ORIENTATIONS.map(opt => (
            <TouchableOpacity
              key={opt.key}
              style={[
                styles.orientationButton,
                orientation === opt.key && styles.activeButtonRed,
              ]}
              onPress={() => setOrientation(opt.key)}
            >
              <Text
                style={[
                  styles.buttonText,
                  orientation === opt.key && styles.activeButtonText,
                ]}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Botón de iniciar */}
        <TouchableOpacity style={styles.startButton} onPress={handleStart}>
          <Text style={styles.startButtonText}>Iniciar juego</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#0d0e22',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  headerTitle: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  menuIcon: {
    color: 'white',
    fontSize: 28,
  },
  content: {
    padding: 18,
    alignItems: 'center',
  },
  sectionTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 18,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 6,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  selectButton: {
    borderColor: '#444',
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    margin: 3,
    backgroundColor: '#1a1b36',
    minWidth: 52,
    alignItems: 'center',
  },
  orientationButton: {
    borderColor: '#444',
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 18,
    margin: 3,
    backgroundColor: '#1a1b36',
    minWidth: 70,
    alignItems: 'center',
  },
  activeButtonBlue: {
    backgroundColor: '#2456E5',
    borderColor: '#2456E5',
  },
  activeButtonRed: {
    backgroundColor: '#D63447',
    borderColor: '#D63447',
  },
  activeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  buttonText: {
    color: '#B0B2CF',
    fontSize: 16,
  },
  startButton: {
    backgroundColor: '#FF7000',
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 60,
    marginTop: 28,
    marginBottom: 15,
    alignSelf: 'center',
  },
  startButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 20,
    letterSpacing: 0.5,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#191B2B',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderColor: '#232342',
  },
  navItem: {
    color: '#A6A6B9',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  navItemActive: {
    color: '#FF7000',
  },
});
