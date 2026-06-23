import React from 'react';
import type { Skill } from '@mindsea/shared';
import { ANCIENT_LEXICON } from '@mindsea/shared';

interface NotebookProps {
  skills?: Skill[];
}

const Notebook: React.FC<NotebookProps> = ({ skills = [] }) => {
  const collectedLexicon = ANCIENT_LEXICON.slice(0, 1); // 模拟已收集的古代提示词

  return (
    <div className="page-container">
      <div className="mb-6">
        <h1 className="page-title">航海日志</h1>
        <p className="page-subtitle">记录你在潜意识海中的一切发现</p>
      </div>

      {/* 古代提示词收集进度 */}
      <div className="card mb-6">
        <h2 className="text-gold-light font-semibold mb-4">古代提示词收集</h2>
        <div className="flex items-center gap-2 mb-4">
          <div className="flex-1 h-2 bg-deep-900 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-gold-dark to-gold-light rounded-full transition-all duration-500"
              style={{ width: `${(collectedLexicon.length / ANCIENT_LEXICON.length) * 100}%` }}
            />
          </div>
          <span className="text-xs text-mist-400 font-mono">
            {collectedLexicon.length}/{ANCIENT_LEXICON.length}
          </span>
        </div>

        <div className="space-y-3">
          {ANCIENT_LEXICON.map((entry) => {
            const isCollected = collectedLexicon.some((c) => c.id === entry.id);
            return (
              <div
                key={entry.id}
                className={`p-3 rounded-lg border transition-all duration-300 ${
                  isCollected
                    ? 'bg-deep-700/50 border-gold/30'
                    : 'bg-deep-900/50 border-mist-800 opacity-40'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`font-medium text-sm ${isCollected ? 'text-gold-light' : 'text-mist-500'}`}>
                        {isCollected ? entry.name : '???'}
                      </span>
                      {!isCollected && (
                        <span className="text-xs text-mist-600">未发现</span>
                      )}
                    </div>
                    {isCollected && (
                      <>
                        <p className="text-xs text-mist-400 mt-1">
                          出处: {entry.source} | 碎片: {entry.fragment}
                        </p>
                        <p className="text-xs text-mist-500 mt-1">{entry.effect}</p>
                        <div className="flex gap-1 mt-1">
                          {entry.requiredPieces.map((piece) => (
                            <span
                              key={piece}
                              className="text-[10px] px-1.5 py-0.5 rounded bg-deep-800 text-mist-400 border border-mist-700"
                            >
                              {piece}
                            </span>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 技能图鉴 */}
      <div className="card">
        <h2 className="text-gold-light font-semibold mb-4">技能图鉴</h2>
        {skills.length === 0 ? (
          <p className="text-mist-500 text-sm text-center py-8">
            尚未铸造任何技能。开始冒险并铸造你的第一个技能吧。
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {skills.map((skill) => (
              <div
                key={skill.id}
                className="p-3 rounded-lg bg-deep-700/50 border border-mist-700/50"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-gold-light text-sm font-medium">{skill.name}</span>
                  <span className="text-xs text-mist-500">槽位 #{skill.slotIndex + 1}</span>
                </div>
                <p className="text-xs text-mist-400 mb-2">{skill.description}</p>
                <div className="flex gap-2 text-[10px] text-mist-500">
                  <span>威力 {skill.basePower}</span>
                  <span>MP {skill.mpPerUse}</span>
                  <span>使用 {skill.usageCount}次</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notebook;