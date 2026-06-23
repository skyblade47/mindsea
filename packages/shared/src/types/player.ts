import type { AttributeStats, AdventureStatus, StoryEntry, AdventureNode } from './adventure';
import type { Skill } from './skill';
import type { Fragment } from './fragment';

export interface PlayerProfile {
  id: string;
  username: string;
  totalAdventures: number;
  highestScore: number;
  creatorLevel: number;
  creatorExp: number;
  unlockedFeatures: string[];
  ancientFragments: string[];
  createdAt: number;
}

export interface AdventureState {
  timeRemaining: number;
  skillPoints: number;
  level: number;
  exp: number;
  attributes: AttributeStats;
  attrExp: AttributeStats;
  skills: Skill[];
  skillSlotLimit: number;
  currentNode: number;
  nodes: AdventureNode[];
  completedNodes: string[];
  storyLog: StoryEntry[];
  status: AdventureStatus;
  materials: string[];
  fragmentInventory: Fragment[];
}

export interface Settlement {
  adventureId: string;
  score: number;
  expEarned: number;
  fragmentsEarned: number;
  ancientFragmentsEarned: number;
  timeSurvived: number;
  bossDefeated: boolean;
  turnCount: number;
}