import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'mtg_decks';

export const saveDecks = async (decks: any[]) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(decks));
  } catch (error) {
    console.error('Error guardando mazos:', error);
  }
};

export const loadDecks = async (): Promise<any[]> => {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEY);
    return json ? JSON.parse(json) : [];
  } catch (error) {
    console.error('Error cargando mazos:', error);
    return [];
  }
};
