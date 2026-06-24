import React from 'react';
import { useGame } from '../hooks/useGame';
import { useApi } from '../hooks/useApi';
import { startAdventure } from '../api/client';
import NarrativeText from '../components/NarrativeText';
import type { AdventureState } from '@mindsea/shared';

const PROLOGUE_TEXT = `在这片被称为"心智界"的领域中，每一丝意识都是沧海一粟。

你站在潜意识海的边缘，面前是无尽的深蓝。海面之下，沉睡着无数被遗忘的思想、被压抑的情感、被封存的记忆——它们构成了这个世界的基石。

传说，在这片海域的最深处，有一块名为"西西弗斯之石"的远古遗物。它承载着人类文明的全部智慧与愚昧，被永恒的浪潮推动着，循环往复，永无止境。

而你，一个新的探索者，将要踏上这片神秘的海域。

你的武器，不是刀剑与魔法，而是语言本身——那些被岁月打磨过的词语碎片，那些在文明长河中沉淀下来的古老句式。

铸造你的技能，征服潜意识海。`;

const Prologue: React.FC = () => {
  const { setGameState, navigateTo, setAdventureId } = useGame();
  const { execute: doStart, loading } = useApi(startAdventure);

  const handleStart = async () => {
    const result = await doStart();
    if (result.success && result.data) {
      const { adventureId: advId, state } = result.data;
      setGameState(state);
      setAdventureId(advId);
      navigateTo('adventure');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-main flex flex-col items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full">
        {/* 标题 */}
        <div className="text-center mb-10 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold font-serif text-gold-light text-shadow-glow mb-3">
            潜意识海
          </h1>
          <p className="text-mist-400 text-sm tracking-widest uppercase">
            心智界 · 序章
          </p>
        </div>

        {/* 叙事 */}
        <div className="card-glow mb-10 animate-slide-up">
          <NarrativeText
            text={PROLOGUE_TEXT}
            speed={35}
            className="text-mist-200 leading-relaxed"
          />
        </div>

        {/* 世界观关键词 */}
        <div className="grid grid-cols-3 gap-4 mb-10 animate-fade-in">
          {[
            { title: '心智界', desc: '意识构成的维度' },
            { title: '潜意识海', desc: '无尽的思想深渊' },
            { title: '西西弗斯之石', desc: '远古文明的遗物' },
          ].map((item) => (
            <div
              key={item.title}
              className="card text-center hover:border-gold/30 transition-all duration-300"
            >
              <h3 className="text-gold text-sm font-semibold mb-1">{item.title}</h3>
              <p className="text-mist-500 text-xs">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* 开始按钮 */}
        <div className="text-center animate-slide-up">
          <button
            onClick={handleStart}
            disabled={loading}
            className="btn-primary px-12 py-4 text-lg tracking-wider animate-pulse-glow"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="inline-block w-4 h-4 border-2 border-deep-900 border-t-transparent rounded-full animate-spin" />
                潜入中...
              </span>
            ) : (
              '开始冒险'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Prologue;