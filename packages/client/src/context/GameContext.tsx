import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { AdventureState } from '@mindsea/shared';

export type PageName = 'prologue' | 'adventure' | 'creation' | 'combat' | 'settlement';

export interface GameContextValue {
  gameState: AdventureState | null;
  setGameState: (state: AdventureState | null) => void;
  currentPage: PageName;
  setCurrentPage: (page: PageName) => void;
  navigateTo: (page: PageName) => void;
  adventureId: string | null;
  setAdventureId: (id: string | null) => void;
}

const GameContext = createContext<GameContextValue | null>(null);

export interface GameProviderProps {
  children: ReactNode;
}

export const GameProvider: React.FC<GameProviderProps> = ({ children }) => {
  const [gameState, setGameState] = useState<AdventureState | null>(null);
  const [currentPage, setCurrentPage] = useState<PageName>('prologue');
  const [adventureId, setAdventureId] = useState<string | null>(null);

  const navigateTo = useCallback((page: PageName) => {
    setCurrentPage(page);
  }, []);

  const value: GameContextValue = {
    gameState,
    setGameState,
    currentPage,
    setCurrentPage,
    navigateTo,
    adventureId,
    setAdventureId,
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};

export function useGameContext(): GameContextValue {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGameContext must be used within a GameProvider');
  }
  return context;
}

export default GameContext;