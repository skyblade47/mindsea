import React, { useState } from 'react';
import { GameProvider, useGameContext } from './context/GameContext';
import Prologue from './pages/Prologue';
import Adventure from './pages/Adventure';
import Creation from './pages/Creation';
import Combat from './pages/Combat';
import Settlement from './pages/Settlement';
import Notebook from './pages/Notebook';
import type { PageName } from './context/GameContext';

const PageRouter: React.FC = () => {
  const { currentPage, setCurrentPage, gameState } = useGameContext();

  const renderPage = (): React.ReactNode => {
    switch (currentPage) {
      case 'prologue':
        return <Prologue />;
      case 'adventure':
        return <Adventure />;
      case 'creation':
        return <Creation />;
      case 'combat':
        return <Combat />;
      case 'settlement':
        return <Settlement />;
      default:
        return <Prologue />;
    }
  };

  return (
    <div className="min-h-screen bg-abyss text-mist-300">
      {/* 全局导航栏 */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-deep-900/80 backdrop-blur-md border-b border-mist-800/30 px-4 py-2">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={() => setCurrentPage('prologue')}
            className="text-gold font-serif text-sm tracking-wider hover:text-gold-light transition-colors"
          >
            心智界
          </button>

          <div className="flex items-center gap-3">
            {gameState && (
              <>
                <NavButton
                  label="冒险"
                  page="adventure"
                  currentPage={currentPage}
                  onClick={setCurrentPage}
                />
                <NavButton
                  label="工坊"
                  page="creation"
                  currentPage={currentPage}
                  onClick={setCurrentPage}
                />
              </>
            )}
            <button
              onClick={() => setCurrentPage(currentPage === 'prologue' ? 'prologue' : currentPage)}
              className="text-xs text-mist-500 hover:text-mist-300 transition-colors"
              title="航海日志（开发中）"
            >
              日志
            </button>
          </div>
        </div>
      </nav>

      {/* 页面内容 */}
      <main className="pt-12">
        {renderPage()}
      </main>
    </div>
  );
};

interface NavButtonProps {
  label: string;
  page: PageName;
  currentPage: PageName;
  onClick: (page: PageName) => void;
}

const NavButton: React.FC<NavButtonProps> = ({ label, page, currentPage, onClick }) => (
  <button
    onClick={() => onClick(page)}
    className={`text-xs px-3 py-1 rounded-full transition-all duration-200 ${
      currentPage === page
        ? 'bg-gold/15 text-gold-light border border-gold/30'
        : 'text-mist-400 hover:text-mist-200 border border-transparent'
    }`}
  >
    {label}
  </button>
);

const App: React.FC = () => {
  return (
    <GameProvider>
      <PageRouter />
    </GameProvider>
  );
};

export default App;