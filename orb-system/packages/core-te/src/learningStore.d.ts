/**
 * Learning Store
 *
 * Phase 6: Learning Loop - Pattern Persistence
 *
 * Stores patterns, insights, and learning actions.
 * Supports in-memory, file, and SQL backends.
 */
import type { Pattern, Insight, LearningAction, PatternFilter, InsightFilter, LearningActionFilter, LearningStore as ILearningStore } from '@orb-system/core-orb';
/**
 * In-Memory Learning Store
 */
export declare class InMemoryLearningStore implements ILearningStore {
    private patterns;
    private insights;
    private actions;
    savePattern(pattern: Pattern): Promise<void>;
    getPatterns(filter?: PatternFilter): Promise<Pattern[]>;
    saveInsight(insight: Insight): Promise<void>;
    getInsights(filter?: InsightFilter): Promise<Insight[]>;
    saveLearningAction(action: LearningAction): Promise<void>;
    getLearningActions(filter?: LearningActionFilter): Promise<LearningAction[]>;
}
/**
 * File-based Learning Store
 */
export declare class FileLearningStore implements ILearningStore {
    private dataDir;
    private patternsFile;
    private insightsFile;
    private actionsFile;
    constructor(dataDir?: string);
    private ensureDir;
    private readFile;
    private writeFile;
    savePattern(pattern: Pattern): Promise<void>;
    getPatterns(filter?: PatternFilter): Promise<Pattern[]>;
    saveInsight(insight: Insight): Promise<void>;
    getInsights(filter?: InsightFilter): Promise<Insight[]>;
    saveLearningAction(action: LearningAction): Promise<void>;
    getLearningActions(filter?: LearningActionFilter): Promise<LearningAction[]>;
}
/**
 * SQL Learning Store
 */
export declare class SqlLearningStore implements ILearningStore {
    private db;
    constructor(db: any);
    private initSchema;
    savePattern(pattern: Pattern): Promise<void>;
    getPatterns(filter?: PatternFilter): Promise<Pattern[]>;
    saveInsight(insight: Insight): Promise<void>;
    getInsights(filter?: InsightFilter): Promise<Insight[]>;
    saveLearningAction(action: LearningAction): Promise<void>;
    getLearningActions(filter?: LearningActionFilter): Promise<LearningAction[]>;
}
/**
 * Factory function to create learning store
 */
export declare function createLearningStore(backend: 'memory' | 'file' | 'sql', dbOrPath?: any): ILearningStore;
//# sourceMappingURL=learningStore.d.ts.map