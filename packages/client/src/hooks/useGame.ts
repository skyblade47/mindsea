import { useGameContext } from '../context/GameContext';

export function useGame() {
  const {
    gameState,
    setGameState,
    currentPage,
    navigateTo,
    adventureId,
    setAdventureId,
  } = useGameContext();

  return {
    gameState,
    setGameState,
    currentPage,
    navigateTo,
    adventureId,
    setAdventureId,
  };
}