/**
 * Playground / Alien Domain
 *
 * Source: SomaOS ALIEN_EVOLUTION_QUICK_START.md and emotional reflection modules.
 *
 * The Playground domain captures the evolving "Alien" state plus reflection
 * events that Te can learn from. Implementation will live in future packages;
 * for now we define the shared types so other layers can reason about them.
 */

export enum PlaygroundEmotion {
  CALM = 'calm',
  CURIOUS = 'curious',
  EXCITED = 'excited',
  OVERWHELMED = 'overwhelmed',
  STRESSED = 'stressed',
  ELATED = 'elated',
}

export interface AlienEvolutionStage {
  id: string;
  label: string;
  description: string;
  dominantEmotion: PlaygroundEmotion;
  unlockedAt: string; // ISO timestamp
  metadata?: Record<string, unknown>;
}

export interface PlaygroundReflection {
  id: string;
  userId: string;
  input: string;
  emotion: PlaygroundEmotion;
  intensity: number; // 0 - 1
  createdAt: string; // ISO timestamp
  tags?: string[];
  actions?: string[];
  metadata?: Record<string, unknown>;
}

export interface PlaygroundState {
  userId: string;
  currentStage: AlienEvolutionStage;
  reflections: PlaygroundReflection[];
  lastUpdatedAt: string; // ISO timestamp
  moodTrend?: PlaygroundEmotion[];
  metadata?: Record<string, unknown>;
}

export interface PlaygroundEvent {
  id: string;
  type: 'reflection' | 'stage_change' | 'insight';
  payload: PlaygroundReflection | AlienEvolutionStage | Record<string, unknown>;
  createdAt: string; // ISO timestamp
}

