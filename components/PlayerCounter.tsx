import React from 'react';
import { View, Text, Button, StyleSheet, TouchableOpacity } from 'react-native';

type CommanderDamage = {
  [attackerId: string]: number;
};

type ExtraCounters = {
  poison: number;
  energy: number;
};

export type Player = {
  id: string;
  name: string;
  color: string;
  life: number;
  extra: ExtraCounters;
  commanderDamage: CommanderDamage;
};

type Props = {
  player: Player;
  onChange: (updated: Player) => void;
  allPlayers: Player[];
};

const PlayerCounter: React.FC<Props> = ({ player, onChange, allPlayers }) => (
  <View style={[styles.counter, { backgroundColor: player.color || '#ddd' }]}>
    <Text style={styles.name}>{player.name}</Text>
    <View style={styles.lifeRow}>
      <TouchableOpacity onPress={() => onChange({ ...player, life: player.life - 1 })}>
        <Text style={styles.lifeBtn}>-</Text>
      </TouchableOpacity>
      <Text style={styles.life}>{player.life}</Text>
      <TouchableOpacity onPress={() => onChange({ ...player, life: player.life + 1 })}>
        <Text style={styles.lifeBtn}>+</Text>
      </TouchableOpacity>
    </View>

    {/* Extra counters */}
    <View style={styles.counterRow}>
      <Text>Veneno: {player.extra.poison} </Text>
      <Button title="+" onPress={() => onChange({ ...player, extra: { ...player.extra, poison: player.extra.poison + 1 } })} />
      <Button title="-" onPress={() => onChange({ ...player, extra: { ...player.extra, poison: Math.max(0, player.extra.poison - 1) } })} />
    </View>
    <View style={styles.counterRow}>
      <Text>Energía: {player.extra.energy} </Text>
      <Button title="+" onPress={() => onChange({ ...player, extra: { ...player.extra, energy: player.extra.energy + 1 } })} />
      <Button title="-" onPress={() => onChange({ ...player, extra: { ...player.extra, energy: Math.max(0, player.extra.energy - 1) } })} />
    </View>

    {/* Daño de comandante */}
    <Text style={{ marginTop: 10, fontWeight: 'bold' }}>Daño de comandante recibido:</Text>
    {allPlayers.filter(p => p.id !== player.id).map(opponent => (
      <View key={opponent.id} style={styles.commanderRow}>
        <Text style={{ flex: 1 }}>{opponent.name}</Text>
        <Button
          title="-"
          onPress={() => {
            const prev = player.commanderDamage[opponent.id] || 0;
            onChange({
              ...player,
              commanderDamage: { ...player.commanderDamage, [opponent.id]: Math.max(prev - 1, 0) },
            });
          }}
        />
        <Text style={{ marginHorizontal: 8 }}>{player.commanderDamage[opponent.id] || 0}</Text>
        <Button
          title="+"
          onPress={() => {
            const prev = player.commanderDamage[opponent.id] || 0;
            onChange({
              ...player,
              commanderDamage: { ...player.commanderDamage, [opponent.id]: prev + 1 },
            });
          }}
        />
      </View>
    ))}
  </View>
);

export default PlayerCounter;

const styles = StyleSheet.create({
  counter: {
    flex: 1,
    margin: 10,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 2,
  },
  name: { fontWeight: 'bold', fontSize: 18, marginBottom: 10 },
  lifeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  life: { fontSize: 44, marginHorizontal: 18 },
  lifeBtn: { fontSize: 38, color: '#444', paddingHorizontal: 8 },
  counterRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 2 },
  commanderRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 4 },
});
