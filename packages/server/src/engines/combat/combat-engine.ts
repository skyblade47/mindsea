import { v4 as uuidv4 } from 'uuid';
import type { CombatAction, EnemyTemplate, CombatLogEntry, CombatResult } from '@mindsea/shared';

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
  };
  enemy: {
    name: string;
    hp: number;
    maxHp: number;
    attack: number;
    defense: number;
  };
  turn: number;
  log: CombatLogEntry[];
  status: 'active' | 'won' | 'lost';
}

export class CombatEngine {
  private combats: Map<string, CombatState> = new Map();

  startCombat(adventureId: string, enemyTemplate: EnemyTemplate, playerAttack: number, playerDefense: number): CombatState {
    const id = `combat_${uuidv4().slice(0, 8)}`;
    const state: CombatState = {
      id,
      adventureId,
      player: {
        name: '冒险者',
        hp: 100,
        maxHp: 100,
        mp: 50,
        maxMp: 50,
        attack: playerAttack,
        defense: playerDefense,
      },
      enemy: {
        name: enemyTemplate.name,
        hp: enemyTemplate.hp,
        maxHp: enemyTemplate.hp,
        attack: enemyTemplate.attack,
        defense: enemyTemplate.defense,
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
    const playerDamage = this.calculateDamage(
      state.player.attack,
      state.enemy.defense,
      action.type === 'skill' ? 1.5 : action.type === 'defend' ? 0.5 : 1.0,
    );

    state.enemy.hp = Math.max(0, state.enemy.hp - playerDamage);

    state.log.push({
      turn: state.turn,
      actor: state.player.name,
      action: action.type,
      value: playerDamage,
      description: `${state.player.name} 执行了 ${action.type}，造成 ${playerDamage} 点伤害`,
    });

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

    // Enemy counterattack (skip if player defended)
    if (action.type !== 'flee') {
      const enemyDamage = this.calculateDamage(
        state.enemy.attack,
        state.player.defense,
        action.type === 'defend' ? 0.5 : 1.0,
      );

      state.player.hp = Math.max(0, state.player.hp - enemyDamage);

      state.log.push({
        turn: state.turn,
        actor: state.enemy.name,
        action: 'counterattack',
        value: enemyDamage,
        description: `${state.enemy.name} 反击，造成 ${enemyDamage} 点伤害`,
      });

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
        return state;
      }
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

  private calculateDamage(attackPower: number, defense: number, multiplier: number): number {
    const baseDamage = Math.max(1, attackPower - defense);
    return Math.round(baseDamage * multiplier);
  }

  getCombat(id: string): CombatState | undefined {
    return this.combats.get(id);
  }
}