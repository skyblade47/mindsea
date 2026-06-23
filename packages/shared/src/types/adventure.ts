export interface AttributeStats {
  str: number;
  agi: number;
  int: number;
  vit: number;
  mnd: number;
  per: number;
}

export type AdventureNodeType =
  | 'combat'
  | 'event'
  | 'forge'
  | 'rest'
  | 'elite'
  | 'boss'
  | 'treasure';

export interface NodeRewards {
  exp: number;
  fragments: number;
  timeCost: number;
}

export interface Choice {
  id: string;
  text: string;
  nodeType: AdventureNodeType;
  rewards?: Partial<NodeRewards>;
}

export interface AdventureNode {
  id: string;
  type: AdventureNodeType;
  title: string;
  description: string;
  choices: Choice[];
  enemyTemplate?: string;
}

export interface StoryEntry {
  turn: number;
  text: string;
  type: 'narrative' | 'combat' | 'creation' | 'system';
}

export type AdventureStatus = 'active' | 'completed' | 'failed';