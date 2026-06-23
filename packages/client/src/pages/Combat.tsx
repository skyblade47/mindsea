import React, { useState, useCallback } from 'react';
import { useGame } from '../hooks/useGame';
import { useApi } from '../hooks/useApi';
import { combatAction } from '../api/client';
import ProgressBar from '../components/ProgressBar';
import type { CombatLogEntry, CombatAction } from '@mindsea/shared';

const MOCK_PLAYER = {
  name: '探索者',
  hp: 80,
  maxHp: 100,
  mp: 50,
  maxMp: 80,
};

const MOCK_ENEMY = {
  name: '深海畸变体',
  hp: 120,
  maxHp: 120,
};

const Combat: React.FC = () => {
  const { gameState, navigateTo } = useGame();
  const [combatLog, setCombatLog] = useState<CombatLogEntry[]>([
    { turn: 1, actor: '系统', action: '遭遇', value: 0, description: '一个扭曲的身影从暗影中浮现...' },
  ]);
  const [playerHp, setPlayerHp] = useState(MOCK_PLAYER.hp);
  const [playerMp, setPlayerMp] = useState(MOCK_PLAYER.mp);
  const [enemyHp, setEnemyHp] = useState(MOCK_ENEMY.hp);
  const [combatEnded, setCombatEnded] = useState<'won' | 'lost' | null>(null);
  const [turn, setTurn] = useState(1);
  const [selectedSkill, setSelectedSkill] = useState<number | null>(null);

  const actionApi = useApi(combatAction);

  const addLog = useCallback((entry: CombatLogEntry) => {
    setCombatLog(prev => [...prev, entry]);
  }, []);

  const handleAction = useCallback(
    async (actionType: CombatAction['type'], skillIndex?: number) => {
      if (!gameState) return;

      const action: CombatAction = { type: actionType, skillIndex };

      addLog({
        turn,
        actor: '玩家',
        action: actionType,
        value: 0,
        description: `你选择了 ${actionType === 'attack' ? '普通攻击' : actionType === 'defend' ? '防御' : actionType === 'flee' ? '逃跑' : `技能 #${(skillIndex ?? 0) + 1}`}`,
      });

      // 模拟敌人回合
      setTimeout(() => {
        const dmg = Math.floor(Math.random() * 15) + 5;
        setPlayerHp(prev => {
          const newHp = Math.max(0, prev - dmg);
          addLog({
            turn: turn + 1,
            actor: MOCK_ENEMY.name,
            action: 'attack',
            value: dmg,
            description: `${MOCK_ENEMY.name} 对你造成了 ${dmg} 点伤害`,
          });

          if (newHp <= 0) {
            setCombatEnded('lost');
          }

          return newHp;
        });
        setTurn(prev => prev + 1);
      }, 800);

      setTurn(prev => prev + 1);
      setSelectedSkill(null);
    },
    [gameState, turn, addLog],
  );

  const handleFlee = useCallback(() => {
    navigateTo('adventure');
  }, [navigateTo]);

  const handleEndCombat = useCallback(() => {
    if (combatEnded === 'won') {
      navigateTo('settlement');
    } else {
      navigateTo('adventure');
    }
  }, [combatEnded, navigateTo]);

  const skills = gameState?.skills ?? [];

  return (
    <div className="page-container">
      <div className="mb-6">
        <h1 className="page-title">战斗</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* 玩家状态 */}
        <div className="card col-span-1">
          <h3 className="text-mist-200 font-medium mb-3">{MOCK_PLAYER.name}</h3>
          <div className="space-y-3">
            <ProgressBar
              current={playerHp}
              max={MOCK_PLAYER.maxHp}
              color="hp"
              label="HP"
              size="md"
            />
            <ProgressBar
              current={playerMp}
              max={MOCK_PLAYER.maxMp}
              color="mp"
              label="MP"
              size="md"
            />
          </div>
        </div>

        {/* 敌人状态 */}
        <div className="card col-span-1 md:col-span-2">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-red-400 font-medium">{MOCK_ENEMY.name}</span>
            <span className="text-xs text-mist-500">Lv.?</span>
          </div>
          <ProgressBar
            current={enemyHp}
            max={MOCK_ENEMY.maxHp}
            color="hp"
            size="lg"
          />
        </div>
      </div>

      {/* 战斗日志 */}
      <div className="card mb-6 max-h-48 overflow-y-auto">
        <h3 className="text-sm text-mist-400 mb-3">战斗日志</h3>
        <div className="space-y-2">
          {combatLog.map((entry, idx) => (
            <div key={idx} className="text-sm flex gap-2">
              <span className="text-mist-500 font-mono shrink-0">[T{entry.turn}]</span>
              <span className={entry.actor === '玩家' ? 'text-cyan' : 'text-red-300'}>
                {entry.description}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 行动选择 */}
      {!combatEnded && (
        <div className="space-y-3">
          <h3 className="text-sm text-mist-400">行动</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button
              onClick={() => handleAction('attack')}
              disabled={actionApi.loading}
              className="btn-secondary text-center"
            >
              普通攻击
            </button>

            {skills.map((skill, idx) => (
              <button
                key={skill.id}
                onClick={() => {
                  setSelectedSkill(idx);
                  handleAction('skill', idx);
                }}
                disabled={actionApi.loading}
                className={`btn-secondary text-center ${
                  selectedSkill === idx ? 'border-gold/50 text-gold-light' : ''
                }`}
              >
                <div className="text-xs">{skill.name}</div>
                <div className="text-[10px] text-mist-500">MP {skill.mpPerUse}</div>
              </button>
            ))}

            <button
              onClick={() => handleAction('defend')}
              disabled={actionApi.loading}
              className="btn-secondary text-center"
            >
              防御
            </button>

            <button
              onClick={handleFlee}
              className="btn-danger text-center"
            >
              逃跑
            </button>
          </div>
        </div>
      )}

      {/* 战斗结果覆盖层 */}
      {combatEnded && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="card-glow max-w-md w-full mx-4 text-center p-8 animate-fade-in">
            <h2 className={`text-3xl font-bold font-serif mb-4 ${
              combatEnded === 'won' ? 'text-gold-light' : 'text-red-400'
            }`}>
              {combatEnded === 'won' ? '胜利' : '败北'}
            </h2>
            <p className="text-mist-300 mb-6">
              {combatEnded === 'won'
                ? '你成功击败了敌人，获得了经验和碎片。'
                : '你的意识被击溃，冒险在此终结。'}
            </p>
            <button onClick={handleEndCombat} className="btn-primary">
              {combatEnded === 'won' ? '继续冒险' : '查看结算'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Combat;