/**
 * Flow Executor
 *
 * Migrated from repo: forge-node, path: src/agent-orchestrator/flow-executor.ts
 * Date: 2025-11-22
 * Role: OrbRole.MAV (actions/tools)
 *
 * Executes flows by running modules in dependency order.
 */
import { OrbContext } from '@orb-system/core-orb';
export interface FlowRun {
    id: string;
    flow_id: string;
    status: string;
}
export interface Flow {
    id: string;
    name: string;
    module_ids: string[];
    dependencies: Record<string, string[]>;
}
export interface Module {
    id: string;
    name: string;
    description?: string;
    input_schema?: any;
    output_schema?: any;
}
/**
 * Execute a flow
 */
export declare function executeFlow(ctx: OrbContext, flow: Flow, flowRunId: string): Promise<void>;
//# sourceMappingURL=flowExecutor.d.ts.map