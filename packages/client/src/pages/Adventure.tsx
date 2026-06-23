import React, { useCallback } from 'react';
import { useGame } from '../hooks/useGame';
import type { Choice, AdventureNode, StoryEntry } from '@mindsea/shared';
import StatusBar from '../components/StatusBar';
import NarrativeText from '../components/NarrativeText';
import ChoiceButton from '../components/ChoiceButton';

const Adventure: React.FC = () => {
  const { gameState, navigateTo } = useGame();

  const handleChoice = useCallback(
    (choice: Choice) => {
      if (choice.nodeType === 'combat' || choice.nodeType === 'elite' || choice.nodeType === 'boss') {
        navigateTo('combat');
      } else if (choice.nodeType === 'forge') {
        navigateTo('creation');
      } else {
        // 普通事件节点处理
        console.log('Choice selected:', choice.id);
      }
    },
    [navigateTo],
  );

  const openCreation = useCallback(() => {
    navigateTo('creation');
  }, [navigateTo]);

  if (!gameState) {
    return (
      <div className="page-container flex items-center justify-center">
        <p className="text-mist-500">加载冒险中...</p>
      </div>
    );
  }

  const currentNode: AdventureNode | undefined = gameState.nodes[gameState.currentNode];
  const recentStory: StoryEntry[] = gameState.storyLog.slice(-5);

  return (
    <div className="min-h-screen bg-gradient-main flex flex-col">
      {/* 顶部状态栏 */}
      <StatusBar
        timeRemaining={gameState.timeRemaining}
        level={gameState.level}
        skillPoints={gameState.skillPoints}
        maxSlots={gameState.skillSlotLimit}
        currentSkills={gameState.skills}
      />

      {/* 主要内容区 */}
      <div className="flex-1 page-container flex flex-col gap-6 pb-24">
        {/* 当前节点叙事 */}
        {currentNode && (
          <div className="card-glow animate-fade-in" key={currentNode.id}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs px-2 py-0.5 rounded bg-deep-700 text-mist-400 border border-mist-700">
                {currentNode.type}
              </span>
              <h2 className="text-gold-light font-semibold">{currentNode.title}</h2>
            </div>
            <NarrativeText
              text={currentNode.description}
              speed={30}
              className="text-mist-200"
            />
          </div>
        )}

        {/* 故事日志 */}
        {recentStory.length > 0 && (
          <div className="card space-y-3">
            <h3 className="text-sm text-mist-400 font-medium">故事日志</h3>
            {recentStory.map((entry, idx) => (
              <div
                key={`${entry.turn}-${idx}`}
                className={`text-sm pl-3 border-l-2 ${
                  entry.type === 'narrative'
                    ? 'border-mist-600 text-mist-300'
                    : entry.type === 'combat'
                      ? 'border-red-700 text-red-300'
                      : entry.type === 'creation'
                        ? 'border-gold-dark text-gold-light'
                        : 'border-cyan-dark text-cyan'
                }`}
              >
                {entry.text}
              </div>
            ))}
          </div>
        )}

        {/* 选项区 */}
        {currentNode && currentNode.choices.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm text-mist-400 font-medium">选择你的行动</h3>
            {currentNode.choices.map((choice) => (
              <ChoiceButton
                key={choice.id}
                choice={choice}
                onClick={handleChoice}
              />
            ))}
          </div>
        )}
      </div>

      {/* 右下浮动创建按钮 */}
      <button
        onClick={openCreation}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full
                   bg-gradient-to-br from-gold-dark via-gold to-gold-light
                   text-deep-900 shadow-lg shadow-gold/30
                   hover:shadow-gold/50 hover:scale-105
                   active:scale-95 transition-all duration-300
                   flex items-center justify-center
                   text-2xl font-bold"
        aria-label="打开创作界面"
        title="铸造技能"
      >
        +
      </button>
    </div>
  );
};

export default Adventure;