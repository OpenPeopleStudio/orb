/**
 * Flow Executor
 *
 * Migrated from repo: forge-node, path: src/agent-orchestrator/flow-executor.ts
 * Date: 2025-11-22
 * Role: OrbRole.MAV (actions/tools)
 *
 * Executes flows by running modules in dependency order.
 */
import { OrbRole } from '@orb-system/core-orb';
/**
 * Topological sort to determine execution order
 */
function topologicalSort(moduleIds, dependencies) {
    const sorted = [];
    const visited = new Set();
    const visiting = new Set();
    function visit(moduleId) {
        if (visiting.has(moduleId)) {
            throw new Error(`Circular dependency detected: ${moduleId}`);
        }
        if (visited.has(moduleId)) {
            return;
        }
        visiting.add(moduleId);
        const deps = dependencies[moduleId] || [];
        for (const dep of deps) {
            visit(dep);
        }
        visiting.delete(moduleId);
        visited.add(moduleId);
        sorted.push(moduleId);
    }
    for (const moduleId of moduleIds) {
        if (!visited.has(moduleId)) {
            visit(moduleId);
        }
    }
    return sorted;
}
/**
 * Execute a single module
 */
async function executeModule(ctx, module, flowRunId, stepOrder, prerequisiteStepIds) {
    if (ctx.role !== OrbRole.MAV) {
        console.warn(`executeModule called with role ${ctx.role}, expected MAV`);
    }
    // Create flow step record
    const stepId = crypto.randomUUID();
    console.log(`[MAV] Executing module ${module.name} (step ${stepOrder})`);
    // In production, this would:
    // 1. Create flow step record in database
    // 2. Execute the module's logic
    // 3. Update step status and output
    // 4. Return step ID
    return stepId;
}
/**
 * Execute a flow
 */
export async function executeFlow(ctx, flow, flowRunId) {
    if (ctx.role !== OrbRole.MAV) {
        console.warn(`executeFlow called with role ${ctx.role}, expected MAV`);
    }
    // Determine execution order using topological sort
    const executionOrder = topologicalSort(flow.module_ids, flow.dependencies);
    console.log(`[MAV] Executing flow ${flow.name} with ${executionOrder.length} modules`);
    const executedSteps = [];
    // Execute modules in order
    for (let i = 0; i < executionOrder.length; i++) {
        const moduleId = executionOrder[i];
        // Find module (would come from database)
        const module = {
            id: moduleId,
            name: `Module ${moduleId}`,
        };
        // Get prerequisite step IDs
        const prerequisites = flow.dependencies[moduleId] || [];
        const prerequisiteStepIds = prerequisites
            .map(depId => executedSteps[executionOrder.indexOf(depId)])
            .filter(id => id !== undefined);
        // Execute module
        const stepId = await executeModule(ctx, module, flowRunId, i + 1, prerequisiteStepIds);
        executedSteps.push(stepId);
    }
    console.log(`[MAV] Flow ${flow.name} execution completed`);
}
//# sourceMappingURL=flowExecutor.js.map