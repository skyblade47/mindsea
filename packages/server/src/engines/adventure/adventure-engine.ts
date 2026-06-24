import { v4 as uuidv4 } from 'uuid';
import type { AdventureState, AdventureNode, Choice, AdventureNodeType, StoryEntry, NodeRewards } from '@mindsea/shared';
import {
  calculateSlotLimit,
  calculateLevelUpExp,
} from '@mindsea/shared';
import type { Fragment, Skill } from '@mindsea/shared';
import { FRAGMENTS } from '@mindsea/shared';

interface AdventureSession {
  id: string;
  playerId: string;
  state: AdventureState;
}

export class AdventureEngine {
  private sessions: Map<string, AdventureSession> = new Map();

  startAdventure(playerId: string): { adventureId: string; state: AdventureState } {
    const adventureId = `adv_${uuidv4().slice(0, 8)}`;

    // Create initial fragments for the player
    const initialFragments: Fragment[] = [
      { ...FRAGMENTS.quality[0], id: `frag_${uuidv4().slice(0, 8)}` }, // iron_word
      { ...FRAGMENTS.element[0], id: `frag_${uuidv4().slice(0, 8)}` }, // fire element
      { ...FRAGMENTS.form[0], id: `frag_${uuidv4().slice(0, 8)}` },   // single target
    ];

    const state: AdventureState = {
      timeRemaining: 100,
      skillPoints: 10,
      level: 1,
      exp: 0,
      attributes: { str: 1, agi: 1, int: 1, vit: 1, mnd: 1, per: 1 },
      attrExp: { str: 0, agi: 0, int: 0, vit: 0, mnd: 0, per: 0 },
      skills: [],
      skillSlotLimit: calculateSlotLimit(1),
      currentNode: 0,
      nodes: this.generateNodes(playerId),
      completedNodes: [],
      storyLog: [],
      status: 'active',
      materials: [],
      fragmentInventory: initialFragments,
    };

    this.sessions.set(adventureId, { id: adventureId, playerId, state });
    return { adventureId, state };
  }

  getSession(adventureId: string): AdventureSession | undefined {
    return this.sessions.get(adventureId);
  }

  getAdventure(adventureId: string): AdventureState | undefined {
    return this.sessions.get(adventureId)?.state;
  }

  proceedToNode(adventureId: string, nodeIndex: number): AdventureNode {
    const session = this.sessions.get(adventureId);
    if (!session) {
      throw new Error(`冒险 ${adventureId} 不存在`);
    }
    const { state } = session;

    if (nodeIndex < 0 || nodeIndex >= state.nodes.length) {
      throw new Error(`节点索引 ${nodeIndex} 超出范围`);
    }

    state.currentNode = nodeIndex;
    state.completedNodes.push(state.nodes[nodeIndex].id);

    const node = state.nodes[nodeIndex];
    this.consumeTime(adventureId, 5);

    return node;
  }

  resolveNode(
    adventureId: string,
    choiceId: string,
  ): { rewards: NodeRewards; leveledUp: boolean; newExp: number; newLevel: number } {
    const session = this.sessions.get(adventureId);
    if (!session) {
      throw new Error(`冒险 ${adventureId} 不存在`);
    }
    const { state } = session;

    const currentNode = state.nodes[state.currentNode];
    if (!currentNode) {
      throw new Error('当前节点不存在');
    }

    const choice = currentNode.choices.find((c) => c.id === choiceId);
    if (!choice) {
      throw new Error(`选项 ${choiceId} 不存在`);
    }

    // Calculate rewards based on node type
    const nodeRewards = this.calculateNodeRewards(currentNode.type);
    state.exp += nodeRewards.exp;

    // Check level up
    const expNeeded = calculateLevelUpExp(state.level);
    let leveledUp = false;
    while (state.exp >= expNeeded) {
      state.exp -= expNeeded;
      state.level++;
      state.skillSlotLimit = calculateSlotLimit(state.level);
      // Increase attributes on level up
      state.attributes.str += 1;
      state.attributes.agi += 1;
      state.attributes.int += 1;
      state.attributes.vit += 1;
      state.attributes.mnd += 1;
      state.attributes.per += 1;
      leveledUp = true;
    }

    // Apply node-specific effects
    if (currentNode.type === 'rest') {
      // Rest node - restore HP/MP conceptually (tracked in combat state)
      // For now just log it
      state.storyLog.push({
        turn: state.storyLog.length,
        text: '你在休息点恢复了体力。',
        type: 'system',
      });
    } else if (currentNode.type === 'treasure') {
      // Treasure gives fragments
      state.fragmentInventory.push({
        ...FRAGMENTS.element[Math.floor(Math.random() * FRAGMENTS.element.length)],
        id: `frag_${uuidv4().slice(0, 8)}`,
      });
      state.storyLog.push({
        turn: state.storyLog.length,
        text: `你获得了 ${nodeRewards.fragments} 个碎片！`,
        type: 'system',
      });
    }

    state.storyLog.push({
      turn: state.storyLog.length,
      text: `经历了 ${currentNode.title}，你获得了 ${nodeRewards.exp} 经验。`,
      type: 'narrative',
    });

    return {
      rewards: nodeRewards,
      leveledUp,
      newExp: state.exp,
      newLevel: state.level,
    };
  }

  private calculateNodeRewards(nodeType: AdventureNodeType): NodeRewards {
    switch (nodeType) {
      case 'combat':
        return { exp: 20, fragments: 1, timeCost: 5 };
      case 'elite':
        return { exp: 50, fragments: 2, timeCost: 5 };
      case 'boss':
        return { exp: 100, fragments: 3, timeCost: 5 };
      case 'event':
        return { exp: 10, fragments: 1, timeCost: 5 };
      case 'treasure':
        return { exp: 5, fragments: 2, timeCost: 5 };
      case 'rest':
        return { exp: 0, fragments: 0, timeCost: 5 };
      case 'forge':
        return { exp: 0, fragments: 0, timeCost: 5 };
      default:
        return { exp: 10, fragments: 1, timeCost: 5 };
    }
  }

  consumeTime(adventureId: string, amount: number): void {
    const session = this.sessions.get(adventureId);
    if (!session) {
      throw new Error(`冒险 ${adventureId} 不存在`);
    }

    session.state.timeRemaining = Math.max(0, session.state.timeRemaining - amount);

    if (session.state.timeRemaining <= 0) {
      session.state.status = 'completed';
    }
  }

  addSkill(adventureId: string, skill: Skill): void {
    const session = this.sessions.get(adventureId);
    if (!session) {
      throw new Error(`冒险 ${adventureId} 不存在`);
    }
    session.state.skills.push(skill);
  }

  generateNodes(_seed: string): AdventureNode[] {
    const nodeCount = Math.floor(Math.random() * 4) + 5; // 5-8 nodes
    const nodeTypes: AdventureNodeType[] = ['combat', 'event', 'forge', 'rest', 'treasure', 'elite'];
    const nodes: AdventureNode[] = [];

    for (let i = 0; i < nodeCount - 1; i++) {
      const type = nodeTypes[Math.floor(Math.random() * nodeTypes.length)];
      nodes.push(this.createNode(type, i));
    }

    // Last node is boss
    nodes.push(this.createNode('boss', nodeCount - 1));

    return nodes;
  }

  private createNode(type: AdventureNodeType, index: number): AdventureNode {
    const id = `node_${uuidv4().slice(0, 8)}`;

    const nodeTemplates: Record<AdventureNodeType, { title: string; description: string }> = {
      combat: { title: '战斗', description: '前方出现敌人，准备战斗！' },
      event: { title: '事件', description: '你发现了一些不寻常的事物...' },
      forge: { title: '铸造', description: '你找到了一处安静的场所，可以铸造技能。' },
      rest: { title: '休息', description: '这是一个安全的休息点，可以恢复体力。' },
      treasure: { title: '宝箱', description: '你发现了一个闪闪发光的宝箱！' },
      elite: { title: '精英战', description: '一股强大的气息扑面而来...' },
      boss: { title: '首领战', description: '最终的首领就在前方！' },
    };

    const template = nodeTemplates[type];

    const choices: Choice[] = [
      { id: `choice_${index}_a`, text: '前进', nodeType: type },
      { id: `choice_${index}_b`, text: '谨慎探索', nodeType: 'event' },
    ];

    return {
      id,
      type,
      title: template.title,
      description: template.description,
      choices,
    };
  }
}
