import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './screens/HomeScreen';
import SearchScreen from './screens/SearchScreen';
import CardDetailScreen from './screens/CardDetailScreen';
import { RootStackParamList } from './types/navigation';
import DeckListScreen from './screens/DeckListScreen';
import CreateDeckScreen from './screens/CreateDeckScreen';
import { DeckProvider } from './context/DeckContext';
import DeckDetailScreen from './screens/DeckDetailScreen';
import LifeCounterScreen from './screens/LifeCounterScreen'; // ← Importa la nueva pantalla
import 'react-native-get-random-values'; import LifeSetupScreen from './screens/LifeSetupScreen';



const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <DeckProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Home">
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Search" component={SearchScreen} />
          <Stack.Screen name="CardDetail" component={CardDetailScreen} />
          <Stack.Screen name="Decks" component={DeckListScreen} />
          <Stack.Screen name="CreateDeck" component={CreateDeckScreen} />
          <Stack.Screen name="DeckDetail" component={DeckDetailScreen} />
          <Stack.Screen name="LifeSetup" component={LifeSetupScreen} options={{ title: 'Contador de vidas' }}/>
          <Stack.Screen name="LifeCounter" component={LifeCounterScreen}  />
        </Stack.Navigator>
      </NavigationContainer>
    </DeckProvider>
  );
}
