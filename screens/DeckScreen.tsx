import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const DeckScreen = () => {
  return (
    <View style={styles.container}>
      <Text>Aquí irá la gestión de mazos</Text>
    </View>
  );
};

export default DeckScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  }
});
