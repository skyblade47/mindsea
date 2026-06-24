import { v4 as uuidv4 } from 'uuid';
import type { CombatAction, EnemyTemplate, CombatLogEntry } from '@mindsea/shared';
import type { Skill } from '@mindsea/shared';

// CombatState is not exported from shared, define locally
interface CombatState {
  id: string;
  adventureId: string;
  player: {
    name: string;
    hp: number;
    maxHp: number;
    mp: number;
    maxMp: number;
    attack: number;
    defense: number;
    skills: Skill[];
  };
  enemy: {
    name: string;
    hp: number;
    maxHp: number;
    attack: number;
    defense: number;
    skills: EnemySkill[];
  };
  turn: number;
  log: CombatLogEntry[];
  status: 'active' | 'won' | 'lost';
}

interface EnemySkill {
  name: string;
  description: string;
  power: number;
  type: 'physical' | 'magical' | 'special';
  mpCost?: number;
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
        skills: playerSkills,
      },
      enemy: {
        name: enemyTemplate.name,
        hp: enemyTemplate.hp,
        maxHp: enemyTemplate.hp,
        attack: enemyTemplate.attack,
        defense: enemyTemplate.defense,
        skills: enemyTemplate.skills,
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

    state.turn++;

    // Player turn
    if (action.type === 'skill' && action.skillIndex !== undefined) {
      // Find the skill by index
      const skill = state.player.skills[action.skillIndex];
      if (!skill) {
        throw new Error(`技能索引 ${action.skillIndex} 无效`);
      }

      // Check MP
      if (state.player.mp < skill.mpPerUse) {
        state.log.push({
          turn: state.turn,
          actor: state.player.name,
          action: 'skill',
          value: 0,
          description: `MP 不足，无法使用 ${skill.name}！`,
        });
        return state;
      }

      // Check usage
      if (skill.usageCount <= 0) {
        state.log.push({
          turn: state.turn,
          actor: state.player.name,
          action: 'skill',
          value: 0,
          description: `${skill.name} 已达使用次数上限！`,
        });
        return state;
      }

      // Calculate and apply damage
      const isMagical = skill.type === 'magical';
      const attackPower = isMagical ? Math.floor(state.player.attack * 1.2) : state.player.attack;
      const damage = this.calculateSkillDamage(
        skill.perUsePower,
        attackPower,
        state.enemy.defense,
      );

      state.player.mp -= skill.mpPerUse;
      state.log.push({
        turn: state.turn,
        actor: state.player.name,
        action: 'skill',
        value: damage,
        description: `${state.player.name} 使用了 ${skill.name}，造成 ${damage} 点${isMagical ? '魔法' : '物理'}伤害！`,
      });

      state.enemy.hp = Math.max(0, state.enemy.hp - damage);
    } else if (action.type === 'attack') {
      const damage = this.calculateDamage(
        state.player.attack,
        state.enemy.defense,
        1.0,
      );
      state.enemy.hp = Math.max(0, state.enemy.hp - damage);
      state.log.push({
        turn: state.turn,
        actor: state.player.name,
        action: 'attack',
        value: damage,
        description: `${state.player.name} 发动攻击，造成 ${damage} 点伤害`,
      });
    } else if (action.type === 'defend') {
      state.log.push({
        turn: state.turn,
        actor: state.player.name,
        action: 'defend',
        value: 0,
        description: `${state.player.name} 进入防御姿态`,
      });
    }

    // Check victory
    if (state.enemy.hp <= 0) {
      state.status = 'won';
      state.log.push({
        turn: state.turn,
        actor: '系统',
        action: 'defeat',
        value: 0,
        description: `${state.enemy.name} 被击败了！`,
      });
      return state;
    }

    // Enemy turn
    if (action.type !== 'flee') {
      this.processEnemyTurn(state);
    }

    // Flee
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

    return state;
  }

  private processEnemyTurn(state: CombatState): void {
    // Pick a random enemy skill or basic attack
    const usableSkills = state.enemy.skills.filter((s) => !s.mpCost || s.mpCost <= 20);
    const useSkill = usableSkills.length > 0 && Math.random() > 0.4;

    if (useSkill) {
      const skill = usableSkills[Math.floor(Math.random() * usableSkills.length)];
      const damage = this.calculateSkillDamage(
        skill.power,
        state.enemy.attack,
        state.player.defense,
        skill.type === 'magical',
      );

      state.player.hp = Math.max(0, state.player.hp - damage);
      state.log.push({
        turn: state.turn,
        actor: state.enemy.name,
        action: 'skill',
        value: damage,
        description: `${state.enemy.name} 使用了 ${skill.name}，造成 ${damage} 点伤害！`,
      });
    } else {
      const damage = this.calculateDamage(
        state.enemy.attack,
        state.player.defense,
        1.0,
      );
      state.player.hp = Math.max(0, state.player.hp - damage);
      state.log.push({
        turn: state.turn,
        actor: state.enemy.name,
        action: 'counterattack',
        value: damage,
        description: `${state.enemy.name} 发动攻击，造成 ${damage} 点伤害`,
      });
    }

    // Check defeat
    if (state.player.hp <= 0) {
      state.status = 'lost';
      state.log.push({
        turn: state.turn,
        actor: '系统',
        action: 'defeat',
        value: 0,
        description: `${state.player.name} 被击败了...`,
      });
    }
  }

  private calculateDamage(attackPower: number, defense: number, multiplier: number): number {
    const baseDamage = Math.max(1, attackPower - defense);
    return Math.round(baseDamage * multiplier);
  }

  private calculateSkillDamage(
    skillPower: number,
    attackPower: number,
    defense: number,
    isMagical: boolean = false,
  ): number {
    const powerBonus = isMagical ? 1.2 : 1.0;
    const baseDamage = Math.max(1, Math.floor(skillPower * powerBonus + attackPower * 0.5) - defense);
    return Math.round(baseDamage);
  }

  getCombat(id: string): CombatState | undefined {
    return this.combats.get(id);
  }
}
