import { v4 as uuidv4 } from 'uuid';
import type { CombatAction, EnemyTemplate, CombatLogEntry, Skill, SkillOp } from '@mindsea/shared';
import { BattleVM, type VMEntity } from './battle-vm';

interface CombatState {
  id: string;
  adventureId: string;
  player: VMEntity & { skills: Skill[] };
  enemy: VMEntity & { skills: EnemyVMSkill[] };
  turn: number;
  log: CombatLogEntry[];
  status: 'active' | 'won' | 'lost';
}

interface EnemyVMSkill {
  name: string;
  description: string;
  mpCost: number;
  ops: SkillOp[];
}

export class CombatEngine {
  private combats: Map<string, CombatState> = new Map();

  startCombat(
    adventureId: string,
    enemyTemplate: EnemyTemplate,
    playerAttack: number,
    playerDefense: number,
    playerSkills: Skill[],
    playerMaxHp: number = 100,
    playerMaxMp: number = 50,
  ): CombatState {
    const id = `combat_${uuidv4().slice(0, 8)}`;

    const enemySkills: EnemyVMSkill[] = enemyTemplate.skills.map((s) => ({
      name: s.name,
      description: s.description,
      mpCost: s.mpCost ?? 10,
      ops: [
        {
          op: 'add',
          target: 'enemy',
          path: 'hp',
          value: -s.power,
        },
      ],
    }));

    const state: CombatState = {
      id,
      adventureId,
      player: {
        name: '冒险者',
        hp: playerMaxHp,
        maxHp: playerMaxHp,
        mp: playerMaxMp,
        maxMp: playerMaxMp,
        attack: playerAttack,
        defense: playerDefense,
        speed: 10,
        stun: 0,
        modifiers: [],
        dot: {},
        shield: 0,
        skills: playerSkills,
      },
      enemy: {
        name: enemyTemplate.name,
        hp: enemyTemplate.hp,
        maxHp: enemyTemplate.hp,
        mp: 30,
        maxMp: 30,
        attack: enemyTemplate.attack,
        defense: enemyTemplate.defense,
        speed: 8,
        stun: 0,
        modifiers: [],
        dot: {},
        shield: 0,
        skills: enemySkills,
      },
      turn: 0,
      log: [],
      status: 'active',
    };

    this.combats.set(id, state);
    return state;
  }

  processAction(combatId: string, action: CombatAction): CombatState {
    const state = this.combats.get(combatId);
    if (!state) {
      throw new Error(`战斗 ${combatId} 不存在`);
    }

    if (state.status !== 'active') {
      throw new Error(`战斗已结束，状态: ${state.status}`);
    }

    const vm = this.createVM(state);
    state.turn++;

    // 回合开始：处理玩家持续效果
    vm.processTurnEffects('player');
    if (state.status !== 'active') return this.syncFromVM(state, vm);

    // 玩家行动
    if (vm.isStunned('player')) {
      state.log.push({
        turn: state.turn,
        actor: state.player.name,
        action: 'stunned',
        value: 0,
        description: `${state.player.name} 处于眩晕状态，无法行动！`,
      });
    } else {
      this.executePlayerAction(state, vm, action);
    }

    if (state.status !== 'active') return this.syncFromVM(state, vm);

    // 回合中：处理敌人持续效果
    vm.processTurnEffects('enemy');
    if (state.status !== 'active') return this.syncFromVM(state, vm);

    // 敌人行动
    if (action.type !== 'flee' && state.status === 'active') {
      if (vm.isStunned('enemy')) {
        state.log.push({
          turn: state.turn,
          actor: state.enemy.name,
          action: 'stunned',
          value: 0,
          description: `${state.enemy.name} 处于眩晕状态，无法行动！`,
        });
      } else {
        this.processEnemyTurn(state, vm);
      }
    }

    // 逃跑
    if (action.type === 'flee') {
      state.status = 'lost';
      state.log.push({
        turn: state.turn,
        actor: state.player.name,
        action: 'flee',
        value: 0,
        description: `${state.player.name} 逃离了战斗`,
      });
    }

    this.syncFromVM(state, vm);
    return state;
  }

  private createVM(state: CombatState): BattleVM {
    return new BattleVM({
      player: JSON.parse(JSON.stringify(state.player)),
      enemy: JSON.parse(JSON.stringify(state.enemy)),
      log: [...state.log],
      turn: state.turn,
      status: state.status,
      variables: {},
    });
  }

  private syncFromVM(state: CombatState, vm: BattleVM): CombatState {
    const vmState = vm.getState();

    state.player.hp = vmState.player.hp;
    state.player.mp = vmState.player.mp;
    state.player.maxHp = vmState.player.maxHp;
    state.player.maxMp = vmState.player.maxMp;
    state.player.attack = vmState.player.attack;
    state.player.defense = vmState.player.defense;
    state.player.speed = vmState.player.speed;
    state.player.stun = vmState.player.stun;
    state.player.modifiers = vmState.player.modifiers;
    state.player.dot = vmState.player.dot;
    state.player.shield = vmState.player.shield;

    state.enemy.hp = vmState.enemy.hp;
    state.enemy.mp = vmState.enemy.mp;
    state.enemy.maxHp = vmState.enemy.maxHp;
    state.enemy.maxMp = vmState.enemy.maxMp;
    state.enemy.attack = vmState.enemy.attack;
    state.enemy.defense = vmState.enemy.defense;
    state.enemy.speed = vmState.enemy.speed;
    state.enemy.stun = vmState.enemy.stun;
    state.enemy.modifiers = vmState.enemy.modifiers;
    state.enemy.dot = vmState.enemy.dot;
    state.enemy.shield = vmState.enemy.shield;

    state.log = vmState.log;
    state.status = vmState.status;

    return state;
  }

  private executePlayerAction(state: CombatState, vm: BattleVM, action: CombatAction): void {
    if (action.type === 'skill' && action.skillIndex !== undefined) {
      const skill = state.player.skills[action.skillIndex];
      if (!skill) {
        state.log.push({
          turn: state.turn,
          actor: state.player.name,
          action: 'skill',
          value: 0,
          description: `技能不存在！`,
        });
        return;
      }

      if (state.player.mp < skill.mpPerUse) {
        state.log.push({
          turn: state.turn,
          actor: state.player.name,
          action: 'skill',
          value: 0,
          description: `精神力不足，无法使用 ${skill.name}！`,
        });
        return;
      }

      if (skill.usageCount <= 0) {
        state.log.push({
          turn: state.turn,
          actor: state.player.name,
          action: 'skill',
          value: 0,
          description: `${skill.name} 已达使用次数上限！`,
        });
        return;
      }

      state.player.mp -= skill.mpPerUse;
      skill.usageCount--;

      state.log.push({
        turn: state.turn,
        actor: state.player.name,
        action: 'skill',
        value: 0,
        description: `${state.player.name} 使用了 ${skill.name}！`,
      });

      if (skill.onCast && skill.onCast.length > 0) {
        vm.executeOps(skill.onCast, 'player');
      }

      if (skill.ops && skill.ops.length > 0) {
        vm.executeOps(skill.ops, 'player');
      } else {
        const fallbackOp: SkillOp = {
          op: 'add',
          target: 'enemy',
          path: 'hp',
          value: -skill.perUsePower,
        };
        vm.executeOps([fallbackOp], 'player');
      }

      if (skill.onHit && skill.onHit.length > 0) {
        vm.executeOps(skill.onHit, 'player');
      }
    } else if (action.type === 'attack') {
      vm.executeOps(
        [
          {
            op: 'add',
            target: 'enemy',
            path: 'hp',
            value: -state.player.attack,
          },
        ],
        'player',
      );
    } else if (action.type === 'defend') {
      const shieldGain = Math.floor(state.player.defense * 0.5);
      state.player.shield += shieldGain;
      state.log.push({
        turn: state.turn,
        actor: state.player.name,
        action: 'defend',
        value: shieldGain,
        description: `${state.player.name} 进入防御姿态，获得 ${shieldGain} 点护盾`,
      });
    }
  }

  private processEnemyTurn(state: CombatState, vm: BattleVM): void {
    const usableSkills = state.enemy.skills.filter((s) => s.mpCost <= state.enemy.mp);
    const useSkill = usableSkills.length > 0 && Math.random() > 0.4;

    if (useSkill) {
      const skill = usableSkills[Math.floor(Math.random() * usableSkills.length)];
      state.enemy.mp = Math.max(0, state.enemy.mp - skill.mpCost);

      state.log.push({
        turn: state.turn,
        actor: state.enemy.name,
        action: 'skill',
        value: 0,
        description: `${state.enemy.name} 使用了 ${skill.name}！`,
      });

      vm.executeOps(skill.ops, 'enemy');
    } else {
      vm.executeOps(
        [
          {
            op: 'add',
            target: 'enemy',
            path: 'hp',
            value: -state.enemy.attack,
          },
        ],
        'enemy',
      );
    }
  }

  getCombat(id: string): CombatState | undefined {
    return this.combats.get(id);
  }
}

export type { CombatState, EnemyVMSkill };
