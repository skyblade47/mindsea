import { v4 as uuidv4 } from 'uuid';
import type { AdventureState, AdventureNode, Choice, AdventureNodeType } from '@mindsea/shared';
import { calculateSlotLimit } from '@mindsea/shared';

export class AdventureEngine {
  private adventures: Map<string, AdventureState> = new Map();

  startAdventure(playerId: string): AdventureState {
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
      fragmentInventory: [],
    };

    this.adventures.set(playerId, state);
    return state;
  }

  proceedToNode(adventureId: string, nodeIndex: number): AdventureNode {
    const state = this.adventures.get(adventureId);
    if (!state) {
      throw new Error(`冒险 ${adventureId} 不存在`);
    }

    if (nodeIndex < 0 || nodeIndex >= state.nodes.length) {
      throw new Error(`节点索引 ${nodeIndex} 超出范围`);
    }

    state.currentNode = nodeIndex;
    state.completedNodes.push(state.nodes[nodeIndex].id);

    const node = state.nodes[nodeIndex];
    this.consumeTime(adventureId, 5);

    return node;
  }

  consumeTime(adventureId: string, amount: number): void {
    const state = this.adventures.get(adventureId);
    if (!state) {
      throw new Error(`冒险 ${adventureId} 不存在`);
    }

    state.timeRemaining = Math.max(0, state.timeRemaining - amount);

    if (state.timeRemaining <= 0) {
      state.status = 'completed';
    }
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

  getAdventure(id: string): AdventureState | undefined {
    return this.adventures.get(id);
  }
}