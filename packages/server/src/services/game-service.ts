import { AdventureEngine } from '../engines/adventure/adventure-engine';
import { CombatEngine } from '../engines/combat/combat-engine';
import { CreationEngine } from '../engines/creation/creation-engine';
import { MockAIClient } from '../ai/mock-client';

export class GameService {
  private static instance: GameService;

  public adventureEngine: AdventureEngine;
  public combatEngine: CombatEngine;
  public creationEngine: CreationEngine;
  public aiClient: MockAIClient;

  private constructor() {
    this.aiClient = new MockAIClient();
    this.adventureEngine = new AdventureEngine();
    this.combatEngine = new CombatEngine();
    this.creationEngine = new CreationEngine(this.aiClient);
  }

  static getInstance(): GameService {
    if (!GameService.instance) {
      GameService.instance = new GameService();
    }
    return GameService.instance;
  }
}
