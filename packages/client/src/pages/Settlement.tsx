import React from 'react';
import { useGame } from '../hooks/useGame';
import { useApi } from '../hooks/useApi';
import { startAdventure } from '../api/client';
import type { Settlement } from '@mindsea/shared';

const MOCK_SETTLEMENT: Settlement = {
  adventureId: 'adv_001',
  score: 2850,
  expEarned: 450,
  fragmentsEarned: 12,
  ancientFragmentsEarned: 2,
  timeSurvived: 1840,
  bossDefeated: true,
  turnCount: 47,
};

const SettlementPage: React.FC = () => {
  const { setGameState, navigateTo, setAdventureId } = useGame();
  const { execute: doStart, loading } = useApi(startAdventure);

  const settlement: Settlement = MOCK_SETTLEMENT;

  const handleNewAdventure = async () => {
    const result = await doStart();
    if (result.success && result.data) {
      setGameState(result.data);
      setAdventureId(result.data.nodes[0]?.id ?? 'unknown');
      navigateTo('adventure');
    }
  };

  const handleBackToPrologue = () => {
    setGameState(null);
    setAdventureId(null);
    navigateTo('prologue');
  };

  return (
    <div className="min-h-screen bg-gradient-main flex items-center justify-center px-4 py-12">
      <div className="max-w-lg w-full animate-fade-in">
        {/* 标题 */}
        <div className="text-center mb-8">
          <h1 className="page-title text-3xl mb-2">冒险结算</h1>
          <p className="text-mist-500 text-sm">本次冒险的完整报告</p>
        </div>

        {/* 得分 */}
        <div className="card-glow text-center mb-6">
          <div className="text-mist-400 text-sm mb-1">总评分</div>
          <div className="text-4xl font-bold font-mono text-gold-light text-shadow-glow">
            {settlement.score.toLocaleString()}
          </div>
        </div>

        {/* 统计数据 */}
        <div className="card mb-6">
          <div className="grid grid-cols-2 gap-4">
            <StatItem label="存活时间" value={`${Math.floor(settlement.timeSurvived / 60)}分${settlement.timeSurvived % 60}秒`} />
            <StatItem label="回合数" value={`${settlement.turnCount} 回合`} />
            <StatItem label="获得经验" value={`+${settlement.expEarned}`} color="text-purple-300" />
            <StatItem label="获得碎片" value={`+${settlement.fragmentsEarned}`} color="text-cyan" />
          </div>
        </div>

        {/* 额外奖励 */}
        <div className="card mb-8">
          <h3 className="text-sm text-mist-400 mb-3">特殊奖励</h3>
          <div className="space-y-2">
            {settlement.bossDefeated && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gold">&#9733;</span>
                <span className="text-gold-light">首领击败奖励</span>
              </div>
            )}
            {settlement.ancientFragmentsEarned > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-cyan">&#9670;</span>
                <span className="text-cyan">古代碎片 x{settlement.ancientFragmentsEarned}</span>
              </div>
            )}
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex flex-col gap-3">
          <button
            onClick={handleNewAdventure}
            disabled={loading}
            className="btn-primary py-4 text-base"
          >
            {loading ? '加载中...' : '再次启航'}
          </button>
          <button
            onClick={handleBackToPrologue}
            className="btn-secondary"
          >
            回到序章
          </button>
        </div>
      </div>
    </div>
  );
};

interface StatItemProps {
  label: string;
  value: string;
  color?: string;
}

const StatItem: React.FC<StatItemProps> = ({ label, value, color = 'text-mist-200' }) => (
  <div className="text-center">
    <div className="text-xs text-mist-500 mb-1">{label}</div>
    <div className={`text-lg font-semibold font-mono ${color}`}>{value}</div>
  </div>
);

export default SettlementPage;