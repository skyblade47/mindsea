import type { AttributeStats } from './adventure';

export type CombatStatus = 'active' | 'won' | 'lost';

export interface Combatant {
  name: string;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  attributes: AttributeStats;
}

export interface EnemySkill {
  name: string;
  description: string;
  power: number;
  type: 'physical' | 'magical' | 'special';
}

export interface EnemyPhase {
  hpThreshold: number;
  name: string;
  description: string;
}

export interface EnemyTemplate {
  id: string;
  name: string;
  description: string;
  hp: number;
  attack: number;
  defense: number;
  speed: number;
  skills: EnemySkill[];
  phases?: EnemyPhase[];
}

export interface CombatLogEntry {
  turn: number;
  actor: string;
  action: string;
  value: number;
  description: string;
}

export interface CombatAction {
  type: 'attack' | 'skill' | 'defend' | 'item' | 'flee';
  skillIndex?: number;
}

export interface CombatResult {
  won: boolean;
  expGained: number;
  fragmentsGained: string[];
  narrative: string;
}