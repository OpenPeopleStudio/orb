// packages/forge/src/mission-processor.ts
// Mission processing orchestrator that coordinates agents

import { buildPersonaBrief } from '@orb-system/core-luna';
import { buildActionPlan } from '@orb-system/core-mav';
import { OrbRole, createOrbContext } from '@orb-system/core-orb';
import { analyzeIntent } from '@orb-system/core-sol';
import { reflect } from '@orb-system/core-te';

import type {
  MissionPrompt,
  MissionState,
  MissionProcessingOptions,
  MissionResult,
  SolResponse,
  TeResponse,
  MavResponse,
  LunaResponse,
  OrbResponse,
} from './mission-types';

/**
 * Generate a unique ID for a mission
 */
const generateMissionId = (): string => {
  return `mission_${Date.now()}_${Math.random().toString(36).substring(7)}`;
};

/**
 * Sleep utility for simulating processing time
 */
const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Process mission with Sol (intent analysis)
 */
async function processSol(
  mission: MissionPrompt,
  state: MissionState
): Promise<SolResponse> {
  const context = createOrbContext(OrbRole.SOL, mission.sessionId, {
    userId: mission.userId,
  });

  try {
    // Simulate processing time
    await sleep(300);

    const insight = analyzeIntent(context, mission.prompt);

    // Build detailed analysis summary
    let details = `Intent: ${insight.intent} (${Math.round(insight.confidence * 100)}% confidence)`;
    if (insight.priority && insight.priority !== 'medium') {
      details += ` | Priority: ${insight.priority}`;
    }
    if (insight.entities?.when) {
      details += ` | Timeline: ${insight.entities.when.join(', ')}`;
    }
    if (insight.actionable) {
      details += ` | Actionable: Yes`;
    }
    if (insight.keywords && insight.keywords.length > 0) {
      details += ` | Keywords: ${insight.keywords.slice(0, 3).join(', ')}`;
    }

    state.timeline.push({
      timestamp: new Date().toISOString(),
      agent: OrbRole.SOL,
      event: 'Analysis complete',
      details,
    });

    return {
      role: OrbRole.SOL,
      status: 'complete',
      timestamp: new Date().toISOString(),
      data: insight,
    };
  } catch (error) {
    return {
      role: OrbRole.SOL,
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Process mission with Te (reflection)
 */
async function processTe(
  mission: MissionPrompt,
  state: MissionState,
  solInsight?: SolResponse
): Promise<TeResponse> {
  const context = createOrbContext(OrbRole.TE, mission.sessionId, {
    userId: mission.userId,
  });

  try {
    // Simulate processing time
    await sleep(400);

    // Build signals from mission and Sol's insight
    const signals = [mission.prompt];
    if (solInsight?.data) {
      signals.push(`Sol detected: ${solInsight.data.intent}`);
    }

    const reflection = reflect(context, signals);

    state.timeline.push({
      timestamp: new Date().toISOString(),
      agent: OrbRole.TE,
      event: 'Reflection complete',
      details: `Analyzed ${signals.length} signals, generated ${reflection.actions.length} considerations`,
    });

    return {
      role: OrbRole.TE,
      status: 'complete',
      timestamp: new Date().toISOString(),
      data: reflection,
    };
  } catch (error) {
    return {
      role: OrbRole.TE,
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Process mission with Mav (action planning)
 */
async function processMav(
  mission: MissionPrompt,
  state: MissionState,
  solInsight?: SolResponse,
  teReflection?: TeResponse
): Promise<MavResponse> {
  const context = createOrbContext(OrbRole.MAV, mission.sessionId, {
    userId: mission.userId,
  });

  try {
    // Simulate processing time
    await sleep(500);

    // Build goals from mission, Sol's insight, and Te's reflection
    const goals: string[] = [];

    // Parse goals from the mission prompt
    if (mission.prompt.toLowerCase().includes('ship') || mission.prompt.toLowerCase().includes('launch')) {
      goals.push('Finalize deliverables');
      goals.push('Run pre-launch checks');
      goals.push('Deploy to production');
    } else if (mission.prompt.toLowerCase().includes('design') || mission.prompt.toLowerCase().includes('persona')) {
      goals.push('Review current design system');
      goals.push('Prototype new persona variations');
      goals.push('Validate with user feedback');
    } else if (mission.prompt.toLowerCase().includes('debug') || mission.prompt.toLowerCase().includes('fix')) {
      goals.push('Reproduce the issue');
      goals.push('Identify root cause');
      goals.push('Implement and test fix');
    } else {
      // Generic goals based on intent
      if (solInsight?.data?.intent) {
        goals.push(`Address ${solInsight.data.intent} objective`);
      }
      if (teReflection?.data?.actions?.[0]) {
        goals.push(teReflection.data.actions[0]);
      }
      goals.push('Review progress and iterate');
    }

    const actionPlan = buildActionPlan(context, goals);

    state.timeline.push({
      timestamp: new Date().toISOString(),
      agent: OrbRole.MAV,
      event: 'Action plan created',
      details: `Generated ${actionPlan.actions.length} action items`,
    });

    return {
      role: OrbRole.MAV,
      status: 'complete',
      timestamp: new Date().toISOString(),
      data: actionPlan,
    };
  } catch (error) {
    return {
      role: OrbRole.MAV,
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Process mission with Luna (preferences adaptation)
 */
async function processLuna(
  mission: MissionPrompt,
  state: MissionState
): Promise<LunaResponse> {
  try {
    // Simulate processing time
    await sleep(300);

    // Determine mode based on mission characteristics
    let mode = 'default';
    let persona = 'balanced';

    if (mission.prompt.toLowerCase().includes('urgent') || mission.prompt.toLowerCase().includes('asap')) {
      mode = 'focus';
      persona = 'direct';
    } else if (mission.prompt.toLowerCase().includes('explore') || mission.prompt.toLowerCase().includes('research')) {
      mode = 'discovery';
      persona = 'curious';
    } else if (mission.prompt.toLowerCase().includes('design') || mission.prompt.toLowerCase().includes('ux')) {
      mode = 'design';
      persona = 'creative';
    }

    const personaBrief = buildPersonaBrief(OrbRole.LUNA, {
      userId: mission.userId,
      sessionId: mission.sessionId,
      mode,
      persona,
      principles: [
        'Adapt to mission context',
        'Optimize for user intent',
        'Balance speed and quality',
      ],
    });

    state.timeline.push({
      timestamp: new Date().toISOString(),
      agent: OrbRole.LUNA,
      event: 'Preferences adapted',
      details: `Mode: ${mode}, Persona: ${persona}`,
    });

    return {
      role: OrbRole.LUNA,
      status: 'complete',
      timestamp: new Date().toISOString(),
      data: personaBrief,
    };
  } catch (error) {
    return {
      role: OrbRole.LUNA,
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Process mission with Orb (coordination)
 */
async function processOrb(
  mission: MissionPrompt,
  state: MissionState,
  agentResponses: {
    sol?: SolResponse;
    te?: TeResponse;
    mav?: MavResponse;
    luna?: LunaResponse;
  }
): Promise<OrbResponse> {
  try {
    // Simulate processing time
    await sleep(200);

    const coordination = buildCoordination(mission, agentResponses);
    const nextSteps = extractNextSteps(agentResponses);
    const blockers = identifyBlockers(agentResponses);

    state.timeline.push({
      timestamp: new Date().toISOString(),
      agent: OrbRole.ORB,
      event: 'Coordination complete',
      details: `Next steps: ${nextSteps.length}, Blockers: ${blockers.length}`,
    });

    return {
      role: OrbRole.ORB,
      status: 'complete',
      timestamp: new Date().toISOString(),
      data: {
        coordination,
        nextSteps,
        blockers: blockers.length > 0 ? blockers : undefined,
      },
    };
  } catch (error) {
    return {
      role: OrbRole.ORB,
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Build coordination summary from agent responses
 */
function buildCoordination(
  mission: MissionPrompt,
  responses: {
    sol?: SolResponse;
    te?: TeResponse;
    mav?: MavResponse;
    luna?: LunaResponse;
  }
): string {
  const parts: string[] = [];

  if (responses.sol?.data) {
    parts.push(`Sol identified ${responses.sol.data.intent} intent with ${Math.round(responses.sol.data.confidence * 100)}% confidence.`);
  }

  if (responses.te?.data) {
    parts.push(`Te reflected on ${responses.te.data.actions.length} key considerations.`);
  }

  if (responses.mav?.data) {
    parts.push(`Mav created an action plan with ${responses.mav.data.actions.length} steps.`);
  }

  if (responses.luna?.data) {
    parts.push(`Luna adapted to ${responses.luna.data.mode || 'default'} mode.`);
  }

  return parts.join(' ');
}

/**
 * Extract next steps from agent responses
 */
function extractNextSteps(responses: {
  sol?: SolResponse;
  te?: TeResponse;
  mav?: MavResponse;
  luna?: LunaResponse;
}): string[] {
  const steps: string[] = [];

  if (responses.mav?.data?.actions) {
    // Take first 3 actions from Mav's plan
    responses.mav.data.actions.slice(0, 3).forEach((action) => {
      steps.push(action.summary);
    });
  }

  if (responses.te?.data?.actions && steps.length < 3) {
    // Add Te's considerations if we need more steps
    responses.te.data.actions.slice(0, 3 - steps.length).forEach((action) => {
      steps.push(action);
    });
  }

  return steps;
}

/**
 * Identify blockers from agent responses
 */
function identifyBlockers(responses: {
  sol?: SolResponse;
  te?: TeResponse;
  mav?: MavResponse;
  luna?: LunaResponse;
}): string[] {
  const blockers: string[] = [];

  // Check for low confidence from Sol
  if (responses.sol?.data && responses.sol.data.confidence < 0.7) {
    blockers.push('Low confidence in intent analysis - mission may need clarification');
  }

  // Check for errors
  Object.values(responses).forEach((response) => {
    if (response?.status === 'error' && response.error) {
      blockers.push(`${response.role} error: ${response.error}`);
    }
  });

  return blockers;
}

/**
 * Main mission processor
 */
export async function processMission(
  prompt: string,
  options: MissionProcessingOptions
): Promise<MissionResult> {
  const sessionId = options.sessionId || `session_${Date.now()}`;
  const mission: MissionPrompt = {
    id: generateMissionId(),
    prompt,
    userId: options.userId,
    sessionId,
    createdAt: new Date().toISOString(),
  };

  const state: MissionState = {
    mission,
    status: 'idle',
    agents: {},
    timeline: [],
    startedAt: new Date().toISOString(),
  };

  try {
    // Start processing
    state.status = 'analyzing';
    state.timeline.push({
      timestamp: new Date().toISOString(),
      agent: OrbRole.ORB,
      event: 'Mission started',
      details: prompt,
    });

    // Phase 1: Sol analyzes intent
    const solResponse = await processSol(mission, state);
    state.agents.sol = solResponse;

    if (solResponse.status === 'error') {
      throw new Error(`Sol failed: ${solResponse.error}`);
    }

    // Phase 2: Te reflects (can run parallel with Luna)
    state.status = 'reflecting';
    const [teResponse, lunaResponse] = await Promise.all([
      processTe(mission, state, solResponse),
      processLuna(mission, state),
    ]);

    state.agents.te = teResponse;
    state.agents.luna = lunaResponse;

    if (teResponse.status === 'error') {
      throw new Error(`Te failed: ${teResponse.error}`);
    }

    // Phase 3: Mav creates action plan
    state.status = 'planning';
    const mavResponse = await processMav(mission, state, solResponse, teResponse);
    state.agents.mav = mavResponse;

    if (mavResponse.status === 'error') {
      throw new Error(`Mav failed: ${mavResponse.error}`);
    }

    // Phase 4: Orb coordinates
    state.status = 'coordinating';
    const orbResponse = await processOrb(mission, state, {
      sol: solResponse,
      te: teResponse,
      mav: mavResponse,
      luna: lunaResponse,
    });
    state.agents.orb = orbResponse;

    // Complete
    state.status = 'ready';
    state.completedAt = new Date().toISOString();

    state.timeline.push({
      timestamp: new Date().toISOString(),
      agent: OrbRole.ORB,
      event: 'Mission ready',
      details: 'All agents have completed analysis',
    });

    return {
      mission,
      state,
      success: true,
    };
  } catch (error) {
    state.status = 'error';
    state.completedAt = new Date().toISOString();

    state.timeline.push({
      timestamp: new Date().toISOString(),
      agent: OrbRole.ORB,
      event: 'Mission failed',
      details: error instanceof Error ? error.message : 'Unknown error',
    });

    return {
      mission,
      state,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Create a streaming version that yields updates as agents process
 */
export async function* processMissionStream(
  prompt: string,
  options: MissionProcessingOptions
): AsyncGenerator<MissionState, MissionResult, unknown> {
  const sessionId = options.sessionId || `session_${Date.now()}`;
  const mission: MissionPrompt = {
    id: generateMissionId(),
    prompt,
    userId: options.userId,
    sessionId,
    createdAt: new Date().toISOString(),
  };

  const state: MissionState = {
    mission,
    status: 'idle',
    agents: {},
    timeline: [],
    startedAt: new Date().toISOString(),
  };

  try {
    // Start processing
    state.status = 'analyzing';
    state.timeline.push({
      timestamp: new Date().toISOString(),
      agent: OrbRole.ORB,
      event: 'Mission started',
      details: prompt,
    });
    yield state;

    // Phase 1: Sol
    const solResponse = await processSol(mission, state);
    state.agents.sol = solResponse;
    yield state;

    // Phase 2: Te & Luna (parallel)
    state.status = 'reflecting';
    const tePromise = processTe(mission, state, solResponse);
    const lunaPromise = processLuna(mission, state);

    state.agents.te = await tePromise;
    yield state;

    state.agents.luna = await lunaPromise;
    yield state;

    // Phase 3: Mav
    state.status = 'planning';
    const mavResponse = await processMav(mission, state, solResponse, state.agents.te);
    state.agents.mav = mavResponse;
    yield state;

    // Phase 4: Orb
    state.status = 'coordinating';
    const orbResponse = await processOrb(mission, state, state.agents);
    state.agents.orb = orbResponse;
    yield state;

    // Complete
    state.status = 'ready';
    state.completedAt = new Date().toISOString();
    state.timeline.push({
      timestamp: new Date().toISOString(),
      agent: OrbRole.ORB,
      event: 'Mission ready',
      details: 'All agents have completed analysis',
    });

    return {
      mission,
      state,
      success: true,
    };
  } catch (error) {
    state.status = 'error';
    state.completedAt = new Date().toISOString();

    return {
      mission,
      state,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

