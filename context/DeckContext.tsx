import React, { createContext, useContext, useState, useEffect } from 'react';
import { loadDecks, saveDecks } from '../utils/storage';
import { Alert } from 'react-native';

export type DeckFormat = 'standard' | 'modern' | 'commander' | 'legacy' | 'vintage' | 'pioneer';

export type DeckCard = {
  card: any;
  quantity: number;
  sideboard?: boolean;
};

type Deck = {
  id: string;
  name: string;
  format: DeckFormat;
  cards: DeckCard[];
  commanderId?: string | null;
  colorIdentity?: string[];
};

type DeckContextType = {
  decks: Deck[];
  addDeck: (deck: Deck) => void;
  activeDeckId: string | null;
  setActiveDeck: (id: string) => void;
  addCardToDeck: (card: any, sideboard?: boolean) => void;
  removeCardFromDeck: (deckId: string, cardId: string) => void;
  removeDeck: (deckId: string) => void;
  renameDeck: (deckId: string, newName: string) => void;
  updateCardInDeck: (deckId: string, updatedCard: DeckCard, originalSideboard?: boolean) => void;
  setCommander: (deckId: string, cardId: string | null) => void;
};

const DeckContext = createContext<DeckContextType | undefined>(undefined);

function isBasicLand(card: any) {
  return card.type_line && card.type_line.toLowerCase().includes('basic land');
}

export const DeckProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [activeDeckId, setActiveDeckId] = useState<string | null>(null);

  useEffect(() => {
    loadDecks().then(setDecks);
  }, []);

  const addDeck = (deck: Deck) => {
    const updated = [...decks, deck];
    setDecks(updated);
    saveDecks(updated);
  };

  const setActiveDeck = (id: string) => {
    setActiveDeckId(id);
  };

  const addCardToDeck = (card: any, sideboard = false) => {
    if (!activeDeckId) return;

    const updatedDecks = decks.map((deck) => {
      if (deck.id === activeDeckId) {
        // --------- VALIDACIÓN COMMANDER --------------
        if (deck.format === 'commander' && !sideboard && deck.commanderId) {
          const commander = deck.cards.find(c => c.card.id === deck.commanderId)?.card;
          const colorIdentity = commander?.color_identity || [];
          const cardColors = card.color_identity || [];
          const allowed =
            cardColors.length === 0 ||
            cardColors.every((c: string) => colorIdentity.includes(c));
          if (!allowed) {
            Alert.alert(
              'Carta ilegal',
              'Esta carta no es legal en tu deck de Commander por su color identity.'
            );
            return deck;
          }
          // Solo 1 copia salvo básicas
          const existing = deck.cards.find(
            (c) => c.card.id === card.id && !!c.sideboard === sideboard
          );
          if (existing && !isBasicLand(card)) {
            Alert.alert(
              'Carta duplicada',
              'Solo puedes añadir una copia de cada carta (salvo tierras básicas) en Commander.'
            );
            return deck;
          }
          // Máximo 99 cartas en main deck
          const mainCount = deck.cards.filter(c => !c.sideboard).reduce((sum, c) => sum + c.quantity, 0);
          if (mainCount >= 99 && (!existing || isBasicLand(card))) {
            Alert.alert(
              'Límite alcanzado',
              'No puedes tener más de 99 cartas en el mazo principal (además del comandante).'
            );
            return deck;
          }
        }
        // --------------------------------------------

        const existing = deck.cards.find(
          (c) => c.card.id === card.id && !!c.sideboard === sideboard
        );
        if (existing) {
          return {
            ...deck,
            cards: deck.cards.map((c) =>
              c.card.id === card.id && !!c.sideboard === sideboard
                ? { ...c, quantity: c.quantity + 1 }
                : c
            ),
          };
        } else {
          return {
            ...deck,
            cards: [...deck.cards, { card, quantity: 1, sideboard }],
          };
        }
      }
      return deck;
    });

    setDecks(updatedDecks);
    saveDecks(updatedDecks);
  };

  const removeCardFromDeck = (deckId: string, cardId: string) => {
    const updatedDecks = decks.map((deck) => {
      if (deck.id === deckId) {
        return {
          ...deck,
          cards: deck.cards.filter((c) => c.card.id !== cardId),
        };
      }
      return deck;
    });
    setDecks(updatedDecks);
    saveDecks(updatedDecks);
  };

  const removeDeck = (deckId: string) => {
    const updatedDecks = decks.filter((deck) => deck.id !== deckId);
    setDecks(updatedDecks);
    saveDecks(updatedDecks);
    if (activeDeckId === deckId) setActiveDeckId(null);
  };

  const renameDeck = (deckId: string, newName: string) => {
    const updatedDecks = decks.map((deck) =>
      deck.id === deckId ? { ...deck, name: newName } : deck
    );
    setDecks(updatedDecks);
    saveDecks(updatedDecks);
  };

  const updateCardInDeck = (
    deckId: string,
    updatedCard: DeckCard,
    originalSideboard?: boolean
  ) => {
    const updatedDecks = decks.map((deck) => {
      if (deck.id === deckId) {
        return {
          ...deck,
          cards: deck.cards
            .filter(
              (c) =>
                !(
                  c.card.id === updatedCard.card.id &&
                  (typeof originalSideboard === 'boolean'
                    ? !!c.sideboard === !!originalSideboard
                    : true)
                )
            )
            .concat([updatedCard]),
        };
      }
      return deck;
    });
    setDecks(updatedDecks);
    saveDecks(updatedDecks);
  };

  // --- MARCAR O QUITAR COMANDANTE, y guardar colorIdentity para validaciones rápidas
  const setCommander = (deckId: string, cardId: string | null) => {
    const updatedDecks = decks.map(deck => {
      if (deck.id !== deckId) return deck;

      let colorIdentity: string[] | undefined = undefined;
      let cards = [...deck.cards];
      let cardData: any = undefined;

      // Busca la carta en el mazo (en main o sideboard)
      cardData = cards.find(
        c => c.card.id === cardId
      )?.card;

      if (cardId) {
        // Buscar si ya está en el mazo principal
        const existsMain = cards.find(
          c => c.card.id === cardId && (c.sideboard === false || c.sideboard === undefined)
        );
        // Si no está, añadirla al main
        if (!existsMain && cardData) {
          cards = [
            ...cards,
            { card: cardData, quantity: 1, sideboard: false },
          ];
        }
        // Si está en sideboard, la pasamos al main
        const existsSide = cards.find(
          c => c.card.id === cardId && c.sideboard === true
        );
        if (existsSide) {
          cards = cards
            .filter(
              c => !(c.card.id === cardId && c.sideboard === true)
            )
            .concat([{ ...existsSide, sideboard: false }]);
        }

        colorIdentity = (cardData?.color_identity) ||
          cards.find(c => c.card.id === cardId)?.card.color_identity || [];
      }

      return {
        ...deck,
        commanderId: cardId,
        colorIdentity,
        cards,
      };
    });
    setDecks(updatedDecks);
    saveDecks(updatedDecks);
  };

  return (
    <DeckContext.Provider
      value={{
        decks,
        addDeck,
        activeDeckId,
        setActiveDeck,
        addCardToDeck,
        removeCardFromDeck,
        removeDeck,
        renameDeck,
        updateCardInDeck,
        setCommander,
      }}
    >
      {children}
    </DeckContext.Provider>
  );
};

export const useDecks = () => {
  const context = useContext(DeckContext);
  if (!context) throw new Error('useDecks debe usarse dentro de un DeckProvider');
  return context;
};
