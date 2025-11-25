import { OrbRole } from './orbRoles';
import { evaluateActionWithDefaults, } from '@orb-system/core-luna';
import { runTaskWithDefaults, } from '@orb-system/core-mav';
import { createTeReflection, evaluateRun, } from '@orb-system/core-te';
import { createDefaultLunaStore, createDefaultTeStore } from './storeFactories';
import { getEventBus } from './events/bus';
import { OrbEventType } from './events/types';
import { OrbMode } from './identity';
import { initializeEventSinks } from './events/initializeSinks';
// Initialize event sinks on module load (only once)
let sinksInitialized = false;
function ensureSinksInitialized() {
    if (!sinksInitialized) {
        initializeEventSinks();
        sinksInitialized = true;
    }
}
/**
 * NOTE: core-sol is currently a stub. Replace this with the real orchestrator once available.
 */
const mockSolGenerate = async (prompt) => {
    return `Mock Sol Response: ${prompt.toUpperCase()} :: synthesized`;
};
/**
 * Helper to map mode string to OrbMode enum
 */
function mapModeToOrbMode(mode) {
    switch (mode) {
        case 'restaurant':
            return OrbMode.RESTAURANT;
        case 'real_estate':
            return OrbMode.REAL_ESTATE;
        case 'builder':
            return OrbMode.BUILDER;
        case 'explorer':
            return OrbMode.EXPLORER;
        case 'forge':
            return OrbMode.FORGE;
        default:
            return OrbMode.DEFAULT;
    }
}
/**
 * Helper to generate a unique ID
 */
function generateId() {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
/**
 * Helper to create and emit an event
 */
async function emitEvent(type, context, mode, payload, metadata) {
    try {
        const eventBus = getEventBus();
        const event = {
            id: generateId(),
            type,
            timestamp: new Date().toISOString(),
            userId: context.userId,
            sessionId: context.sessionId,
            deviceId: context.deviceId,
            mode: mapModeToOrbMode(mode),
            persona: context.persona,
            role: context.role,
            payload,
            metadata,
        };
        await eventBus.emit(event);
    }
    catch (error) {
        // Don't fail the flow if event emission fails
        console.error('[demoFlow] Failed to emit event:', error);
    }
}
/**
 * Runs a minimal Orb flow:
 * - Build OrbContext and ask Luna if we can run a mock tool call
 * - If allowed, call Sol, execute a mock Mav task, and record Te evaluation
 */
export const runDemoFlow = async (input) => {
    // Ensure event sinks are initialized
    ensureSinksInitialized();
    const context = {
        role: OrbRole.MAV,
        userId: input.userId,
        sessionId: input.sessionId,
    };
    // Set mode if provided (for Luna)
    const mode = (input.mode || 'default');
    const lunaStore = createDefaultLunaStore();
    await lunaStore.setActiveMode(input.userId, mode);
    // Emit: User input event
    await emitEvent(OrbEventType.USER_INPUT, context, mode, { prompt: input.prompt }, { flow: 'demo' });
    // Emit: Mode change event
    await emitEvent(OrbEventType.MODE_CHANGE, context, mode, { mode, previousMode: 'default' }, { userId: input.userId });
    // Create Mav task first to evaluate it with Luna
    const mavTask = {
        id: `task-${Date.now()}`,
        label: 'Tool Execution',
        actions: [
            {
                id: 'action-1',
                kind: 'file_write',
                toolId: 'file_log',
                params: { input: input.prompt, mode },
                metadata: { executor: 'file', prompt: input.prompt },
            },
        ],
        metadata: { prompt: input.prompt, mode },
    };
    // Evaluate each Mav action with Luna before execution
    const lunaContext = { ...context, role: OrbRole.LUNA, mode, deviceId: context.deviceId };
    const actionEvaluations = [];
    for (const action of mavTask.actions) {
        // Map Mav action to Luna action descriptor
        const actionDescriptor = {
            id: action.id,
            role: OrbRole.MAV,
            kind: action.kind === 'file_write' ? 'file_write' :
                action.kind === 'file_read' ? 'file_read' :
                    action.kind === 'tool_call' ? 'tool_call' : 'other',
            toolId: action.toolId,
            estimatedRisk: action.kind === 'file_write' ? 'medium' : 'low', // Assess risk based on action type
            description: `Execute ${action.kind} action: ${action.toolId || 'unknown tool'}`,
        };
        const lunaDecision = await evaluateActionWithDefaults(lunaContext, actionDescriptor);
        actionEvaluations.push({ action, decision: lunaDecision });
        // Emit: Luna decision event for each action
        await emitEvent(OrbEventType.LUNA_DECISION, lunaContext, mode, {
            decisionType: lunaDecision.type,
            reasons: lunaDecision.reasons,
            effectiveRisk: lunaDecision.effectiveRisk,
            triggeredConstraints: lunaDecision.triggeredConstraints,
            actionId: actionDescriptor.id,
        }, { action: actionDescriptor, decision: lunaDecision });
        // Emit: Specific Luna decision type
        if (lunaDecision.type === 'allow') {
            await emitEvent(OrbEventType.LUNA_ALLOW, lunaContext, mode, {
                actionId: actionDescriptor.id,
                reasons: lunaDecision.reasons,
                effectiveRisk: lunaDecision.effectiveRisk,
            });
        }
        else if (lunaDecision.type === 'deny') {
            await emitEvent(OrbEventType.LUNA_DENY, lunaContext, mode, {
                actionId: actionDescriptor.id,
                reasons: lunaDecision.reasons,
                triggeredConstraints: lunaDecision.triggeredConstraints,
            });
            // If any action is denied, stop the flow
            return {
                context,
                mode,
                lunaDecision: {
                    type: 'deny',
                    reasons: [`Action ${actionDescriptor.id} was denied: ${lunaDecision.reasons.join(', ')}`],
                    triggeredConstraints: lunaDecision.triggeredConstraints,
                    effectiveRisk: lunaDecision.effectiveRisk,
                    context: lunaDecision.context,
                },
            };
        }
        else if (lunaDecision.type === 'require_confirmation') {
            await emitEvent(OrbEventType.LUNA_REQUIRE_CONFIRMATION, lunaContext, mode, {
                actionId: actionDescriptor.id,
                reasons: lunaDecision.reasons,
                effectiveRisk: lunaDecision.effectiveRisk,
            });
            // For now, we'll proceed but log the requirement
            // In a real system, this would pause and wait for user confirmation
            console.warn(`[LUNA] Action ${actionDescriptor.id} requires confirmation: ${lunaDecision.reasons.join(', ')}`);
        }
    }
    // Use the first action's decision as the overall decision (or combine them)
    const lunaDecision = actionEvaluations[0]?.decision || {
        type: 'allow',
        reasons: ['No actions to evaluate'],
        triggeredConstraints: [],
        effectiveRisk: 'low',
        context: {
            userId: context.userId,
            sessionId: context.sessionId,
        },
    };
    // Only proceed if Luna allowed the actions
    const solOutput = await mockSolGenerate(input.prompt);
    // Update task actions with Sol output now that we have it
    mavTask.actions[0].params = {
        ...mavTask.actions[0].params,
        output: solOutput
    };
    // Emit: Task run event
    await emitEvent(OrbEventType.TASK_RUN, { ...context, role: OrbRole.MAV }, mode, {
        taskId: mavTask.id,
        taskLabel: mavTask.label,
        actionCount: mavTask.actions.length,
    }, { task: mavTask });
    const mavTaskResult = await runTaskWithDefaults({ ...context, role: OrbRole.MAV }, mavTask);
    // Emit: Task completion event
    if (mavTaskResult.status === 'completed') {
        await emitEvent(OrbEventType.TASK_COMPLETE, { ...context, role: OrbRole.MAV }, mode, {
            taskId: mavTaskResult.taskId,
            actionsCompleted: mavTaskResult.actionsCompleted,
            actionsTotal: mavTaskResult.actionsTotal,
            filesTouched: mavTaskResult.metadata?.filesTouched,
        }, { result: mavTaskResult });
    }
    else {
        await emitEvent(OrbEventType.TASK_FAIL, { ...context, role: OrbRole.MAV }, mode, {
            taskId: mavTaskResult.taskId,
            status: mavTaskResult.status,
            error: mavTaskResult.error,
            actionsCompleted: mavTaskResult.actionsCompleted,
            actionsTotal: mavTaskResult.actionsTotal,
        }, { result: mavTaskResult });
    }
    // Emit: Mav action events for file operations
    if (mavTaskResult.metadata?.filesTouched) {
        const filesTouched = mavTaskResult.metadata.filesTouched;
        for (const file of filesTouched) {
            await emitEvent(OrbEventType.FILE_WRITE, { ...context, role: OrbRole.MAV }, mode, { filePath: file, taskId: mavTaskResult.taskId }, { executor: 'file_system' });
        }
    }
    const reflection = createTeReflection({ ...context, role: OrbRole.TE }, {
        input: input.prompt,
        output: solOutput,
        tags: mavTaskResult.status === 'completed' ? ['success'] : ['failure'],
        notes: `Task status: ${mavTaskResult.status}`,
    });
    // Save reflection persistently
    const teStore = createDefaultTeStore();
    await teStore.saveReflection(reflection, input.userId, input.sessionId);
    // Emit: Te reflection event
    await emitEvent(OrbEventType.TE_REFLECTION, { ...context, role: OrbRole.TE }, mode, {
        reflectionId: reflection.id,
        tags: reflection.tags,
        notes: reflection.notes,
    }, { reflection });
    const teEvaluation = await evaluateRun({ ...context, role: OrbRole.TE }, {
        input: reflection.input,
        output: reflection.output,
        metadata: mavTaskResult.metadata,
    });
    // Emit: Te evaluation event
    await emitEvent(OrbEventType.TE_EVALUATION, { ...context, role: OrbRole.TE }, mode, {
        score: teEvaluation.score,
        tags: teEvaluation.tags,
        recommendations: teEvaluation.recommendations,
        summary: teEvaluation.summary,
        reflectionId: reflection.id,
    }, { evaluation: teEvaluation });
    // Run adaptation engine periodically (every 10th run or so)
    // This allows the system to learn and adjust defaults
    try {
        const { getAdaptationEngine } = await import('./adaptation');
        const adaptationEngine = getAdaptationEngine();
        // Only run adaptation analysis occasionally to avoid performance impact
        const shouldRunAdaptation = Math.random() < 0.1; // 10% chance
        if (shouldRunAdaptation) {
            await adaptationEngine.computeAndApplyAdjustments({
                userId: input.userId,
                sessionId: input.sessionId,
            });
        }
    }
    catch (error) {
        // Don't fail the flow if adaptation fails
        console.error('[demoFlow] Adaptation engine error:', error);
    }
    return {
        context,
        mode,
        lunaDecision,
        solOutput,
        mavTaskResult,
        teEvaluation,
    };
};
//# sourceMappingURL=demoFlow.js.map