import { Router, Request, Response } from 'express';
import { GameService } from '../services/game-service';
import { v4 as uuidv4 } from 'uuid';
import type {
  CreateSkillRequest,
  SelectSkillRequest,
  ApiResponse,
  AdventureNode,
  SkillVariant,
  CombatAction,
} from '@mindsea/shared';

export const apiRouter = Router();

const gameService = GameService.getInstance();

// ---- Adventure ----

apiRouter.post('/adventure/start', (_req: Request, res: Response) => {
  const playerId = `player_${uuidv4().slice(0, 8)}`;
  const { adventureId, state } = gameService.adventureEngine.startAdventure(playerId);

  const response: ApiResponse<{ adventureId: string; state: typeof state }> = {
    success: true,
    data: { adventureId, state },
  };
  res.json(response);
});

apiRouter.post('/adventure/proceed', (req: Request, res: Response) => {
  const { adventureId, nodeIndex } = req.body as { adventureId: string; nodeIndex: number };

  try {
    const node = gameService.adventureEngine.proceedToNode(adventureId, nodeIndex);
    const state = gameService.adventureEngine.getAdventure(adventureId);

    const response: ApiResponse<{ node: AdventureNode; state: typeof state }> = {
      success: true,
      data: { node, state },
    };
    res.json(response);
  } catch (error) {
    const errorResponse: ApiResponse<null> = {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
    res.status(400).json(errorResponse);
  }
});

apiRouter.post('/adventure/resolve', (req: Request, res: Response) => {
  const { adventureId, choiceId } = req.body as { adventureId: string; choiceId: string };

  try {
    const result = gameService.adventureEngine.resolveNode(adventureId, choiceId);
    const state = gameService.adventureEngine.getAdventure(adventureId);

    const response: ApiResponse<typeof result & { state: typeof state }> = {
      success: true,
      data: { ...result, state },
    };
    res.json(response);
  } catch (error) {
    const errorResponse: ApiResponse<null> = {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
    res.status(400).json(errorResponse);
  }
});

apiRouter.get('/adventure/:id', (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const state = gameService.adventureEngine.getAdventure(id);
    if (!state) {
      const errorResponse: ApiResponse<null> = {
        success: false,
        data: null,
        error: 'Adventure not found',
      };
      res.status(404).json(errorResponse);
      return;
    }

    const response: ApiResponse<typeof state> = { success: true, data: state };
    res.json(response);
  } catch (error) {
    const errorResponse: ApiResponse<null> = {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
    res.status(400).json(errorResponse);
  }
});

// ---- Skill ----

apiRouter.post('/skill/generate', (req: Request, res: Response) => {
  const body = req.body as CreateSkillRequest;

  try {
    const adventureId = body.adventureId;
    const session = gameService.adventureEngine.getSession(adventureId);
    if (!session) {
      const errorResponse: ApiResponse<null> = { success: false, data: null, error: 'Adventure not found' };
      res.status(400).json(errorResponse);
      return;
    }

    const fragmentInput = body.fragmentInput;
    const description = body.description || '';
    const constraints = body.constraints || [];

    gameService.creationEngine
      .generateSkillVariants(fragmentInput, description, constraints, session.state)
      .then((variants) => {
        const timeCost = Math.floor(Math.random() * 10) + 10;
        const spCost = Math.floor(Math.random() * 5) + 3;

        const response: ApiResponse<{ variants: SkillVariant[]; timeCost: number; spCost: number }> = {
          success: true,
          data: { variants, timeCost, spCost },
        };
        res.json(response);
      })
      .catch((error) => {
        const errorResponse: ApiResponse<null> = {
          success: false,
          data: null,
          error: error instanceof Error ? error.message : 'AI generation failed',
        };
        res.status(500).json(errorResponse);
      });
  } catch (error) {
    const errorResponse: ApiResponse<null> = {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
    res.status(400).json(errorResponse);
  }
});

apiRouter.post('/skill/select', (req: Request, res: Response) => {
  const body = req.body as SelectSkillRequest;

  try {
    const adventureId = body.adventureId;
    const session = gameService.adventureEngine.getSession(adventureId);
    if (!session) {
      const errorResponse: ApiResponse<null> = { success: false, data: null, error: 'Adventure not found' };
      res.status(400).json(errorResponse);
      return;
    }

    const skill = {
      ...body.selectedVariant,
      slotIndex: session.state.skills.length,
      createdAt: Date.now(),
    };

    gameService.adventureEngine.addSkill(adventureId, skill);
    gameService.adventureEngine.consumeTime(adventureId, body.timeCost || 10);

    const response: ApiResponse<{ skill: typeof skill; state: typeof session.state }> = {
      success: true,
      data: { skill, state: session.state },
    };
    res.json(response);
  } catch (error) {
    const errorResponse: ApiResponse<null> = {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
    res.status(400).json(errorResponse);
  }
});

apiRouter.post('/skill/retry', async (req: Request, res: Response) => {
  const body = req.body as CreateSkillRequest;

  try {
    const adventureId = body.adventureId;
    const session = gameService.adventureEngine.getSession(adventureId);
    if (!session) {
      const errorResponse: ApiResponse<null> = { success: false, data: null, error: 'Adventure not found' };
      res.status(400).json(errorResponse);
      return;
    }

    const fragmentInput = body.fragmentInput;
    const description = body.description || 'retry';
    const constraints = body.constraints || [];

    gameService.adventureEngine.consumeTime(adventureId, 5);

    const variants = await gameService.creationEngine.generateSkillVariants(
      fragmentInput,
      description,
      constraints,
      session.state,
    );

    const response: ApiResponse<{ variants: SkillVariant[]; timeCost: number; spCost: number }> = {
      success: true,
      data: { variants, timeCost: 13, spCost: 7 },
    };
    res.json(response);
  } catch (error) {
    const errorResponse: ApiResponse<null> = {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
    res.status(400).json(errorResponse);
  }
});

// ---- Combat ----

apiRouter.post('/combat/start', (req: Request, res: Response) => {
  const { adventureId, enemyLevel } = req.body as { adventureId: string; enemyLevel?: number };

  try {
    const session = gameService.adventureEngine.getSession(adventureId);
    if (!session) {
      const errorResponse: ApiResponse<null> = { success: false, data: null, error: 'Adventure not found' };
      res.status(400).json(errorResponse);
      return;
    }

    const level = enemyLevel || session.state.level;
    const enemy = gameService.aiClient.generateEnemy(level, uuidv4());

    enemy.then((enemyTemplate) => {
      const playerStr = session.state.attributes.str;
      const playerVit = session.state.attributes.vit;
      const combatState = gameService.combatEngine.startCombat(
        adventureId,
        enemyTemplate,
        playerStr,
        playerVit,
        session.state.skills,
        100,
        50,
      );

      const response: ApiResponse<typeof combatState> = { success: true, data: combatState };
      res.json(response);
    }).catch((error) => {
      const errorResponse: ApiResponse<null> = {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Enemy generation failed',
      };
      res.status(500).json(errorResponse);
    });
  } catch (error) {
    const errorResponse: ApiResponse<null> = {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
    res.status(400).json(errorResponse);
  }
});

apiRouter.post('/combat/action', (req: Request, res: Response) => {
  const { combatId, action } = req.body as { combatId: string; action: CombatAction };

  try {
    const combatState = gameService.combatEngine.processAction(combatId, action);

    const response: ApiResponse<typeof combatState> = { success: true, data: combatState };
    res.json(response);
  } catch (error) {
    const errorResponse: ApiResponse<null> = {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
    res.status(400).json(errorResponse);
  }
});

apiRouter.post('/combat/resolve', (req: Request, res: Response) => {
  const { combatId } = req.body as { combatId: string };

  try {
    const combatState = gameService.combatEngine.getCombat(combatId);
    if (!combatState) {
      const errorResponse: ApiResponse<null> = { success: false, data: null, error: 'Combat not found' };
      res.status(400).json(errorResponse);
      return;
    }

    const won = combatState.status === 'won';
    let expGained = 0;
    let fragmentsGained: string[] = [];

    if (won) {
      const nodeType = combatState.enemy.name === '首领' ? 'boss' : 'combat';
      if (nodeType === 'boss') {
        expGained = 100;
        fragmentsGained = ['frag_boss_1', 'frag_boss_2'];
      } else {
        expGained = 20;
        fragmentsGained = ['frag_combat_1'];
      }
    }

    const response: ApiResponse<{ won: boolean; expGained: number; fragmentsGained: string[] }> = {
      success: true,
      data: { won, expGained, fragmentsGained },
    };
    res.json(response);
  } catch (error) {
    const errorResponse: ApiResponse<null> = {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
    res.status(400).json(errorResponse);
  }
});
