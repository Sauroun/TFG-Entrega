import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal, Button, ScrollView, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";

// Colores y etiquetas
const PLAYER_COLORS = ["#4066d6", "#b31632", "#369146", "#e5bb44", "#8e44ad", "#f39c12"];
const PLAYER_LABELS = [
  "JUGADOR 1", "JUGADOR 2", "JUGADOR 3", "JUGADOR 4", "JUGADOR 5", "JUGADOR 6"
];

// Rotación para cada posición en la fila: izquierda/derecha/centro
function getRotation(index: number, rowIndex: number, colIndex: number, row: number[], numRows: number) {
  // Solo uno en la fila (centro): 180deg para la primera, 0deg para la última fila
  if (row.length === 1) {
    if (rowIndex === 0) return "180deg"; // fila de arriba
    if (rowIndex === numRows - 1) return "0deg"; // fila de abajo
    return "0deg";
  }
  // Izquierda o derecha
  if (rowIndex === 0) return colIndex === 0 ? "180deg" : "180deg";
  if (rowIndex === numRows - 1) return colIndex === 0 ? "0deg" : "0deg";
  // Filas intermedias: izquierda (90), derecha (-90)
  return colIndex === 0 ? "90deg" : "-90deg";
}

// Calcula el layout en filas de máximo 2 paneles/fila
function getRows(numPlayers: number): number[][] {
  const rows: number[][] = [];
  let i = 0;
  // Si impar, la primera fila tiene 1 panel
  if (numPlayers % 2 === 1) {
    rows.push([i++]);
  }
  // El resto, en filas de 2
  while (i < numPlayers) {
    rows.push([i, i + 1].filter(j => j < numPlayers));
    i += 2;
  }
  return rows;
}

export default function LifeCounterScreen() {
  const [numPlayers, setNumPlayers] = useState(4);
  const [life, setLife] = useState(Array(numPlayers).fill(40));
  const [tax, setTax] = useState(Array(numPlayers).fill(0));
  const [showSettings, setShowSettings] = useState(Array(numPlayers).fill(false));

  useEffect(() => {
    setLife(Array(numPlayers).fill(40));
    setTax(Array(numPlayers).fill(0));
    setShowSettings(Array(numPlayers).fill(false));
  }, [numPlayers]);

  const changeLife = (index: number, delta: number) => {
    setLife((prev) => {
      const copy = [...prev];
      copy[index] = Math.max(0, copy[index] + delta);
      return copy;
    });
  };

  const changeTax = (index: number, delta: number) => {
    setTax((prev) => {
      const copy = [...prev];
      copy[index] = Math.max(0, copy[index] + delta);
      return copy;
    });
  };

  const renderPanel = (i: number, rowIndex: number, colIndex: number, row: number[], numRows: number) => (
    <View key={i} style={[styles.playerPanel, { backgroundColor: PLAYER_COLORS[i % PLAYER_COLORS.length] }]}>
      <View style={{ transform: [{ rotate: getRotation(i, rowIndex, colIndex, row, numRows) }], flex: 1, justifyContent: "center" }}>
        {/* Botón ajustes */}
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => {
            setShowSettings((prev) => {
              const copy = [...prev];
              copy[i] = true;
              return copy;
            });
          }}
        >
          <Ionicons name="settings" size={28} color="#fff" />
        </TouchableOpacity>
        {/* Etiqueta jugador */}
        <View style={styles.labelBox}>
          <Text style={styles.labelText}>{PLAYER_LABELS[i]}</Text>
        </View>
        {/* Contador de vidas */}
        <View style={styles.lifeRow}>
          <TouchableOpacity onPress={() => changeLife(i, -1)}>
            <Text style={styles.plusMinus}>-</Text>
          </TouchableOpacity>
          <Text style={styles.lifeText}>{life[i]}</Text>
          <TouchableOpacity onPress={() => changeLife(i, +1)}>
            <Text style={styles.plusMinus}>+</Text>
          </TouchableOpacity>
        </View>
        {/* Contador extra: impuesto */}
        <View style={styles.counterRow}>
          <Text style={styles.counterLabel}>Impuesto</Text>
          <TouchableOpacity style={styles.counterBtn} onPress={() => changeTax(i, -1)}>
            <Text style={styles.counterBtnText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.counterValue}>{tax[i]}</Text>
          <TouchableOpacity style={styles.counterBtn} onPress={() => changeTax(i, +1)}>
            <Text style={styles.counterBtnText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
      {/* Modal de ajustes */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showSettings[i]}
        onRequestClose={() => {
          setShowSettings((prev) => {
            const copy = [...prev];
            copy[i] = false;
            return copy;
          });
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 20 }}>Ajustes jugador {i + 1}</Text>
            <Button title="Cerrar" onPress={() => {
              setShowSettings((prev) => {
                const copy = [...prev];
                copy[i] = false;
                return copy;
              });
            }} />
          </View>
        </View>
      </Modal>
    </View>
  );

  // --- SCROLL PARA SELECCIÓN DE NÚMERO DE JUGADORES ---
  const playerOptions = [2, 3, 4, 5, 6];
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        {getRows(numPlayers).map((row, rowIndex, rowsArr) => (
          <View key={rowIndex} style={{ flex: 1, flexDirection: "row" }}>
            {row.map((i, colIndex) =>
              <View key={i} style={{ flex: 1 }}>
                {renderPanel(i, rowIndex, colIndex, row, rowsArr.length)}
              </View>
            )}
            {/* Si fila impar de uno solo, ocupa todo el ancho */}
            {row.length === 1 && <View style={{ flex: 1 }} />}
          </View>
        ))}
      </ScrollView>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ margin: 10 }}
        contentContainerStyle={{ flexDirection: "row", alignItems: "center" }}
      >
        {playerOptions.map((n) => (
          <TouchableOpacity key={n} style={[styles.selectorBtn, numPlayers === n && { backgroundColor: "#222" }]} onPress={() => setNumPlayers(n)}>
            <Text style={{ color: "#fff", fontWeight: "bold" }}>{n} jugadores</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#181828", justifyContent: "center" },
  playerPanel: {
    flex: 1,
    margin: 6,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: "#fff",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 170,
    minWidth: 100,
  },
  labelBox: {
    borderWidth: 2,
    borderColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 7,
    marginBottom: 10,
    marginTop: 10,
    backgroundColor: "rgba(0,0,0,0.15)",
    alignSelf: "center",
  },
  labelText: { color: "#fff", fontWeight: "bold", fontSize: 21, textAlign: "center" },
  lifeRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 4,
  },
  plusMinus: { fontSize: 36, color: "#fff", fontWeight: "bold", marginHorizontal: 14 },
  lifeText: {
    fontSize: 42,
    color: "#fff",
    fontWeight: "bold",
    marginHorizontal: 10,
    textShadowColor: "#000", textShadowOffset: { width: 2, height: 2 }, textShadowRadius: 2,
  },
  counterRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    alignSelf: "center",
    backgroundColor: "rgba(0,0,0,0.11)",
    borderRadius: 12,
    padding: 7,
  },
  counterLabel: { color: "#fff", fontSize: 15, marginRight: 10 },
  counterBtn: {
    backgroundColor: "#222",
    marginHorizontal: 4,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  counterBtnText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  counterValue: { color: "#fff", fontSize: 17, fontWeight: "bold", marginHorizontal: 8 },
  settingsButton: {
    position: "absolute",
    top: 8,
    right: 12,
    zIndex: 10,
    backgroundColor: "#222",
    borderRadius: 22,
    padding: 2,
  },
  modalOverlay: {
    flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.45)",
  },
  modalContent: {
    backgroundColor: "#fff", padding: 22, borderRadius: 16, width: "80%", alignItems: "center",
  },
  selectorBtn: {
    backgroundColor: "#444", margin: 6, borderRadius: 14, paddingVertical: 10, paddingHorizontal: 14
  }
});
