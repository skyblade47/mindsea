import React, { useState, useCallback, useMemo } from 'react';
import { useGame } from '../hooks/useGame';
import { useApi } from '../hooks/useApi';
import { createSkill, selectSkill, retryCreate } from '../api/client';
import SkillCard from '../components/SkillCard';
import type {
  FragmentQuality,
  FragmentElement,
  FragmentForm,
  FragmentMechanism,
  FragmentInput,
  SkillVariant,
  CreateSkillResponse,
} from '@mindsea/shared';
import { FRAGMENTS } from '@mindsea/shared';

const QUALITY_OPTIONS: FragmentQuality[] = ['iron_word', 'steel_word', 'silver_sentence', 'source_chapter', 'divine_codex'];
const ELEMENT_OPTIONS: FragmentElement[] = ['fire', 'ice', 'thunder', 'light', 'shadow', 'earth', 'wind'];
const FORM_OPTIONS: FragmentForm[] = ['single', 'aoe', 'chain', 'projectile', 'field', 'summon'];
const MECHANISM_OPTIONS: FragmentMechanism[] = ['life_steal', 'shield', 'purify', 'resonance', 'overload', 'echo'];

const QUALITY_LABELS: Record<FragmentQuality, string> = {
  iron_word: '铁言',
  steel_word: '钢言',
  silver_sentence: '银句',
  source_chapter: '源章',
  divine_codex: '神典',
};

const Creation: React.FC = () => {
  const { adventureId, gameState, setGameState } = useGame();

  // 碎片选择
  const [quality, setQuality] = useState<FragmentQuality>('steel_word');
  const [selectedElements, setSelectedElements] = useState<FragmentElement[]>([]);
  const [selectedForms, setSelectedForms] = useState<FragmentForm[]>([]);
  const [selectedMechanisms, setSelectedMechanisms] = useState<FragmentMechanism[]>([]);
  const [description, setDescription] = useState('');
  const [constraints, setConstraints] = useState<string>('');

  // API 状态
  const createApi = useApi(adventureId ? createSkill : (() => Promise.resolve({ success: false, error: 'No adventure' })) as any);
  const selectApi = useApi(adventureId ? selectSkill : (() => Promise.resolve({ success: false, error: 'No adventure' })) as any);
  const retryApi = useApi(adventureId ? retryCreate : (() => Promise.resolve({ success: false, error: 'No adventure' })) as any);

  const [variants, setVariants] = useState<SkillVariant[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [timeCost, setTimeCost] = useState(0);
  const [spCost, setSpCost] = useState(0);

  const fragmentInput: FragmentInput = useMemo(() => ({
    quality,
    elements: selectedElements,
    forms: selectedForms,
    mechanisms: selectedMechanisms,
  }), [quality, selectedElements, selectedForms, selectedMechanisms]);

  const toggleElement = useCallback((elem: FragmentElement) => {
    setSelectedElements(prev =>
      prev.includes(elem) ? prev.filter(e => e !== elem) : [...prev, elem],
    );
  }, []);

  const toggleForm = useCallback((form: FragmentForm) => {
    setSelectedForms(prev =>
      prev.includes(form) ? prev.filter(f => f !== form) : [...prev, form],
    );
  }, []);

  const toggleMechanism = useCallback((mech: FragmentMechanism) => {
    setSelectedMechanisms(prev =>
      prev.includes(mech) ? prev.filter(m => m !== mech) : [...prev, mech],
    );
  }, []);

  const handleCreate = useCallback(async () => {
    if (!adventureId) return;
    setSelectedIndex(null);
    const result = await (createApi.execute as (...args: any[]) => any)(adventureId, fragmentInput, description, constraints ? constraints.split(',').map(s => s.trim()).filter(Boolean) : undefined);
    if (result.success && result.data) {
      const data = result.data as CreateSkillResponse;
      setVariants(data.variants);
      setTimeCost(data.timeCost);
      setSpCost(data.spCost);
    }
  }, [adventureId, fragmentInput, description, constraints, createApi]);

  const handleSelect = useCallback(async (variantIndex: number) => {
    if (!adventureId) return;
    const result = await (selectApi.execute as (...args: any[]) => any)(adventureId, variantIndex);
    if (result.success && result.data) {
      setGameState(result.data);
      setSelectedIndex(variantIndex);
      setVariants([]);
    }
  }, [adventureId, selectApi, setGameState]);

  const handleRetry = useCallback(async () => {
    if (!adventureId) return;
    setSelectedIndex(null);
    const result = await (retryApi.execute as (...args: any[]) => any)(adventureId, fragmentInput, description, constraints ? constraints.split(',').map(s => s.trim()).filter(Boolean) : undefined);
    if (result.success && result.data) {
      const data = result.data as CreateSkillResponse;
      setVariants(data.variants);
      setTimeCost(data.timeCost);
      setSpCost(data.spCost);
    }
  }, [adventureId, fragmentInput, description, constraints, retryApi]);

  const currentLoading = createApi.loading || retryApi.loading;

  return (
    <div className="page-container">
      <div className="mb-6">
        <h1 className="page-title">铸造工坊</h1>
        <p className="page-subtitle">选择碎片，描述你的技能，铸造新的力量</p>
      </div>

      {/* 碎片选择 */}
      <div className="space-y-6">
        {/* 品质选择 */}
        <div className="card">
          <label className="block text-sm text-mist-400 mb-3">碎片品质</label>
          <div className="flex flex-wrap gap-2">
            {QUALITY_OPTIONS.map((q) => (
              <button
                key={q}
                onClick={() => setQuality(q)}
                className={`px-3 py-1.5 rounded-lg text-sm transition-all duration-200 ${
                  quality === q
                    ? 'bg-gold/20 border border-gold/50 text-gold-light'
                    : 'bg-deep-700 border border-mist-700 text-mist-400 hover:border-mist-500'
                }`}
              >
                {QUALITY_LABELS[q]}
              </button>
            ))}
          </div>
        </div>

        {/* 元素选择 */}
        <div className="card">
          <label className="block text-sm text-mist-400 mb-3">元素碎片</label>
          <div className="flex flex-wrap gap-2">
            {ELEMENT_OPTIONS.map((elem) => {
              const isSelected = selectedElements.includes(elem);
              return (
                <button
                  key={elem}
                  onClick={() => toggleElement(elem)}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-all duration-200 ${
                    isSelected
                      ? 'bg-red-900/30 border border-red-500/50 text-red-300'
                      : 'bg-deep-700 border border-mist-700 text-mist-400 hover:border-mist-500'
                  }`}
                >
                  {FRAGMENTS.element.find(f => f.subType === elem)?.name ?? elem}
                </button>
              );
            })}
          </div>
        </div>

        {/* 形态选择 */}
        <div className="card">
          <label className="block text-sm text-mist-400 mb-3">形态碎片</label>
          <div className="flex flex-wrap gap-2">
            {FORM_OPTIONS.map((form) => {
              const isSelected = selectedForms.includes(form);
              return (
                <button
                  key={form}
                  onClick={() => toggleForm(form)}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-all duration-200 ${
                    isSelected
                      ? 'bg-purple-900/30 border border-purple-500/50 text-purple-300'
                      : 'bg-deep-700 border border-mist-700 text-mist-400 hover:border-mist-500'
                  }`}
                >
                  {FRAGMENTS.form.find(f => f.subType === form)?.name ?? form}
                </button>
              );
            })}
          </div>
        </div>

        {/* 机制选择 */}
        <div className="card">
          <label className="block text-sm text-mist-400 mb-3">机制碎片</label>
          <div className="flex flex-wrap gap-2">
            {MECHANISM_OPTIONS.map((mech) => {
              const isSelected = selectedMechanisms.includes(mech);
              return (
                <button
                  key={mech}
                  onClick={() => toggleMechanism(mech)}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-all duration-200 ${
                    isSelected
                      ? 'bg-cyan-dark/30 border border-cyan/50 text-cyan'
                      : 'bg-deep-700 border border-mist-700 text-mist-400 hover:border-mist-500'
                  }`}
                >
                  {FRAGMENTS.mechanism.find(f => f.subType === mech)?.name ?? mech}
                </button>
              );
            })}
          </div>
        </div>

        {/* 描述输入 */}
        <div className="card">
          <label className="block text-sm text-mist-400 mb-2">技能描述</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="描述你的技能..."
            className="input-field min-h-[100px] resize-y"
            maxLength={500}
          />
          <div className="text-right text-xs text-mist-500 mt-1">{description.length}/500</div>
        </div>

        {/* 约束标签 */}
        <div className="card">
          <label className="block text-sm text-mist-400 mb-2">约束标签（逗号分隔）</label>
          <input
            type="text"
            value={constraints}
            onChange={(e) => setConstraints(e.target.value)}
            placeholder="如：远程, 群攻, 低消耗"
            className="input-field"
          />
        </div>

        {/* 铸造按钮 */}
        <div className="flex gap-3">
          <button
            onClick={handleCreate}
            disabled={currentLoading || !adventureId}
            className="btn-primary flex-1"
          >
            {currentLoading ? '铸造中...' : '铸造'}
          </button>
        </div>
      </div>

      {/* 3选1展示区 */}
      {variants.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-gold-light font-semibold text-lg">选择你的技能</h2>
            <div className="text-xs text-mist-400">
              时间: -{timeCost}s | SP: -{spCost}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {variants.map((variant, index) => (
              <SkillCard
                key={variant.id}
                skill={variant}
                selected={selectedIndex === index}
                disabled={selectApi.loading}
                onSelect={() => handleSelect(index)}
              />
            ))}
          </div>
          <div className="mt-4 text-center">
            <button
              onClick={handleRetry}
              disabled={retryApi.loading}
              className="btn-secondary"
            >
              {retryApi.loading ? '重新铸造中...' : '不满意？重新铸造'}
            </button>
          </div>
        </div>
      )}

      {/* 错误提示 */}
      {(createApi.error || selectApi.error || retryApi.error) && (
        <div className="mt-4 p-3 rounded-lg bg-red-950/50 border border-red-800/50 text-red-300 text-sm">
          {createApi.error || selectApi.error || retryApi.error}
        </div>
      )}
    </div>
  );
};

export default Creation;