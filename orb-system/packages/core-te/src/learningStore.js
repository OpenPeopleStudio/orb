/**
 * Learning Store
 *
 * Phase 6: Learning Loop - Pattern Persistence
 *
 * Stores patterns, insights, and learning actions.
 * Supports in-memory, file, and SQL backends.
 */
import { promises as fs } from 'node:fs';
import * as path from 'node:path';
/**
 * In-Memory Learning Store
 */
export class InMemoryLearningStore {
    constructor() {
        this.patterns = new Map();
        this.insights = new Map();
        this.actions = new Map();
    }
    async savePattern(pattern) {
        this.patterns.set(pattern.id, pattern);
    }
    async getPatterns(filter) {
        let results = Array.from(this.patterns.values());
        // Apply filters
        if (filter?.type) {
            const types = Array.isArray(filter.type) ? filter.type : [filter.type];
            results = results.filter(p => types.includes(p.type));
        }
        if (filter?.status) {
            const statuses = Array.isArray(filter.status) ? filter.status : [filter.status];
            results = results.filter(p => statuses.includes(p.status));
        }
        if (filter?.minConfidence) {
            results = results.filter(p => p.confidence >= filter.minConfidence);
        }
        if (filter?.dateFrom) {
            results = results.filter(p => p.detectedAt >= filter.dateFrom);
        }
        if (filter?.dateTo) {
            results = results.filter(p => p.detectedAt <= filter.dateTo);
        }
        // Sort by detectedAt descending
        results.sort((a, b) => new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime());
        if (filter?.limit) {
            results = results.slice(0, filter.limit);
        }
        return results;
    }
    async saveInsight(insight) {
        this.insights.set(insight.id, insight);
    }
    async getInsights(filter) {
        let results = Array.from(this.insights.values());
        if (filter?.patternId) {
            results = results.filter(i => i.patternId === filter.patternId);
        }
        if (filter?.status) {
            results = results.filter(i => i.userFeedback === filter.status);
        }
        if (filter?.minConfidence) {
            results = results.filter(i => i.confidence >= filter.minConfidence);
        }
        if (filter?.dateFrom) {
            results = results.filter(i => i.generatedAt >= filter.dateFrom);
        }
        if (filter?.dateTo) {
            results = results.filter(i => i.generatedAt <= filter.dateTo);
        }
        // Sort by generatedAt descending
        results.sort((a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime());
        if (filter?.limit) {
            results = results.slice(0, filter.limit);
        }
        return results;
    }
    async saveLearningAction(action) {
        this.actions.set(action.id, action);
    }
    async getLearningActions(filter) {
        let results = Array.from(this.actions.values());
        if (filter?.insightId) {
            results = results.filter(a => a.insightId === filter.insightId);
        }
        if (filter?.type) {
            const types = Array.isArray(filter.type) ? filter.type : [filter.type];
            results = results.filter(a => types.includes(a.type));
        }
        if (filter?.status) {
            const statuses = Array.isArray(filter.status) ? filter.status : [filter.status];
            results = results.filter(a => statuses.includes(a.status));
        }
        if (filter?.dateFrom && results[0]?.appliedAt) {
            results = results.filter(a => a.appliedAt && a.appliedAt >= filter.dateFrom);
        }
        if (filter?.dateTo && results[0]?.appliedAt) {
            results = results.filter(a => a.appliedAt && a.appliedAt <= filter.dateTo);
        }
        if (filter?.limit) {
            results = results.slice(0, filter.limit);
        }
        return results;
    }
}
/**
 * File-based Learning Store
 */
export class FileLearningStore {
    constructor(dataDir) {
        this.dataDir = '.orb-data/te';
        if (dataDir) {
            this.dataDir = dataDir;
        }
        this.patternsFile = path.join(this.dataDir, 'patterns.json');
        this.insightsFile = path.join(this.dataDir, 'insights.json');
        this.actionsFile = path.join(this.dataDir, 'actions.json');
    }
    async ensureDir() {
        await fs.mkdir(this.dataDir, { recursive: true });
    }
    async readFile(filePath) {
        try {
            const content = await fs.readFile(filePath, 'utf-8');
            return JSON.parse(content);
        }
        catch (err) {
            return [];
        }
    }
    async writeFile(filePath, data) {
        await this.ensureDir();
        await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
    }
    async savePattern(pattern) {
        const patterns = await this.readFile(this.patternsFile);
        // Update or append
        const index = patterns.findIndex(p => p.id === pattern.id);
        if (index >= 0) {
            patterns[index] = pattern;
        }
        else {
            patterns.push(pattern);
        }
        // Keep last 1000 patterns
        const trimmed = patterns.slice(-1000);
        await this.writeFile(this.patternsFile, trimmed);
    }
    async getPatterns(filter) {
        let patterns = await this.readFile(this.patternsFile);
        // Apply same filtering logic as InMemoryLearningStore
        if (filter?.type) {
            const types = Array.isArray(filter.type) ? filter.type : [filter.type];
            patterns = patterns.filter(p => types.includes(p.type));
        }
        if (filter?.status) {
            const statuses = Array.isArray(filter.status) ? filter.status : [filter.status];
            patterns = patterns.filter(p => statuses.includes(p.status));
        }
        if (filter?.minConfidence) {
            patterns = patterns.filter(p => p.confidence >= filter.minConfidence);
        }
        patterns.sort((a, b) => new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime());
        if (filter?.limit) {
            patterns = patterns.slice(0, filter.limit);
        }
        return patterns;
    }
    async saveInsight(insight) {
        const insights = await this.readFile(this.insightsFile);
        const index = insights.findIndex(i => i.id === insight.id);
        if (index >= 0) {
            insights[index] = insight;
        }
        else {
            insights.push(insight);
        }
        const trimmed = insights.slice(-1000);
        await this.writeFile(this.insightsFile, trimmed);
    }
    async getInsights(filter) {
        let insights = await this.readFile(this.insightsFile);
        if (filter?.patternId) {
            insights = insights.filter(i => i.patternId === filter.patternId);
        }
        if (filter?.minConfidence) {
            insights = insights.filter(i => i.confidence >= filter.minConfidence);
        }
        insights.sort((a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime());
        if (filter?.limit) {
            insights = insights.slice(0, filter.limit);
        }
        return insights;
    }
    async saveLearningAction(action) {
        const actions = await this.readFile(this.actionsFile);
        const index = actions.findIndex(a => a.id === action.id);
        if (index >= 0) {
            actions[index] = action;
        }
        else {
            actions.push(action);
        }
        const trimmed = actions.slice(-1000);
        await this.writeFile(this.actionsFile, trimmed);
    }
    async getLearningActions(filter) {
        let actions = await this.readFile(this.actionsFile);
        if (filter?.insightId) {
            actions = actions.filter(a => a.insightId === filter.insightId);
        }
        if (filter?.type) {
            const types = Array.isArray(filter.type) ? filter.type : [filter.type];
            actions = actions.filter(a => types.includes(a.type));
        }
        if (filter?.status) {
            const statuses = Array.isArray(filter.status) ? filter.status : [filter.status];
            actions = actions.filter(a => statuses.includes(a.status));
        }
        if (filter?.limit) {
            actions = actions.slice(0, filter.limit);
        }
        return actions;
    }
}
/**
 * SQL Learning Store
 */
export class SqlLearningStore {
    constructor(db) {
        this.db = db;
        this.initSchema();
    }
    initSchema() {
        // Create patterns table
        this.db.exec(`
      CREATE TABLE IF NOT EXISTS patterns (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        detected_at TEXT NOT NULL,
        confidence REAL NOT NULL,
        data JSON NOT NULL,
        event_ids JSON NOT NULL,
        event_count INTEGER NOT NULL,
        status TEXT NOT NULL,
        metadata JSON
      )
    `);
        // Create insights table
        this.db.exec(`
      CREATE TABLE IF NOT EXISTS insights (
        id TEXT PRIMARY KEY,
        pattern_id TEXT NOT NULL,
        generated_at TEXT NOT NULL,
        confidence REAL NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        recommendation TEXT NOT NULL,
        user_feedback TEXT,
        applied_at TEXT,
        metadata JSON,
        FOREIGN KEY (pattern_id) REFERENCES patterns(id)
      )
    `);
        // Create learning_actions table
        this.db.exec(`
      CREATE TABLE IF NOT EXISTS learning_actions (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        insight_id TEXT NOT NULL,
        confidence REAL NOT NULL,
        target TEXT NOT NULL,
        current_value JSON,
        suggested_value JSON,
        reason TEXT NOT NULL,
        status TEXT NOT NULL,
        applied_at TEXT,
        metadata JSON,
        FOREIGN KEY (insight_id) REFERENCES insights(id)
      )
    `);
    }
    async savePattern(pattern) {
        const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO patterns 
      (id, type, detected_at, confidence, data, event_ids, event_count, status, metadata)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
        stmt.run(pattern.id, pattern.type, pattern.detectedAt, pattern.confidence, JSON.stringify(pattern.data), JSON.stringify(pattern.eventIds), pattern.eventCount, pattern.status, JSON.stringify(pattern.metadata || {}));
    }
    async getPatterns(filter) {
        let query = 'SELECT * FROM patterns WHERE 1=1';
        const params = [];
        if (filter?.type) {
            const types = Array.isArray(filter.type) ? filter.type : [filter.type];
            query += ` AND type IN (${types.map(() => '?').join(',')})`;
            params.push(...types);
        }
        if (filter?.minConfidence) {
            query += ' AND confidence >= ?';
            params.push(filter.minConfidence);
        }
        query += ' ORDER BY detected_at DESC';
        if (filter?.limit) {
            query += ' LIMIT ?';
            params.push(filter.limit);
        }
        const rows = this.db.prepare(query).all(...params);
        return rows.map((row) => ({
            id: row.id,
            type: row.type,
            detectedAt: row.detected_at,
            confidence: row.confidence,
            data: JSON.parse(row.data),
            eventIds: JSON.parse(row.event_ids),
            eventCount: row.event_count,
            status: row.status,
            metadata: JSON.parse(row.metadata || '{}'),
        }));
    }
    async saveInsight(insight) {
        const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO insights 
      (id, pattern_id, generated_at, confidence, title, description, recommendation, 
       user_feedback, applied_at, metadata)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
        stmt.run(insight.id, insight.patternId, insight.generatedAt, insight.confidence, insight.title, insight.description, insight.recommendation, insight.userFeedback || null, insight.appliedAt || null, JSON.stringify(insight.metadata || {}));
    }
    async getInsights(filter) {
        let query = 'SELECT * FROM insights WHERE 1=1';
        const params = [];
        if (filter?.patternId) {
            query += ' AND pattern_id = ?';
            params.push(filter.patternId);
        }
        if (filter?.minConfidence) {
            query += ' AND confidence >= ?';
            params.push(filter.minConfidence);
        }
        query += ' ORDER BY generated_at DESC';
        if (filter?.limit) {
            query += ' LIMIT ?';
            params.push(filter.limit);
        }
        const rows = this.db.prepare(query).all(...params);
        return rows.map((row) => ({
            id: row.id,
            patternId: row.pattern_id,
            generatedAt: row.generated_at,
            confidence: row.confidence,
            title: row.title,
            description: row.description,
            recommendation: row.recommendation,
            suggestedActions: [], // Not stored in DB for now
            userFeedback: row.user_feedback || undefined,
            appliedAt: row.applied_at || undefined,
            metadata: JSON.parse(row.metadata || '{}'),
        }));
    }
    async saveLearningAction(action) {
        const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO learning_actions 
      (id, type, insight_id, confidence, target, current_value, suggested_value, 
       reason, status, applied_at, metadata)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
        stmt.run(action.id, action.type, action.insightId, action.confidence, action.target, JSON.stringify(action.currentValue), JSON.stringify(action.suggestedValue), action.reason, action.status, action.appliedAt || null, JSON.stringify(action.metadata || {}));
    }
    async getLearningActions(filter) {
        let query = 'SELECT * FROM learning_actions WHERE 1=1';
        const params = [];
        if (filter?.insightId) {
            query += ' AND insight_id = ?';
            params.push(filter.insightId);
        }
        if (filter?.type) {
            const types = Array.isArray(filter.type) ? filter.type : [filter.type];
            query += ` AND type IN (${types.map(() => '?').join(',')})`;
            params.push(...types);
        }
        if (filter?.limit) {
            query += ' LIMIT ?';
            params.push(filter.limit);
        }
        const rows = this.db.prepare(query).all(...params);
        return rows.map((row) => ({
            id: row.id,
            type: row.type,
            insightId: row.insight_id,
            confidence: row.confidence,
            target: row.target,
            currentValue: JSON.parse(row.current_value),
            suggestedValue: JSON.parse(row.suggested_value),
            reason: row.reason,
            status: row.status,
            appliedAt: row.applied_at || undefined,
            metadata: JSON.parse(row.metadata || '{}'),
        }));
    }
}
/**
 * Factory function to create learning store
 */
export function createLearningStore(backend, dbOrPath) {
    switch (backend) {
        case 'memory':
            return new InMemoryLearningStore();
        case 'file':
            return new FileLearningStore(dbOrPath);
        case 'sql':
            return new SqlLearningStore(dbOrPath);
    }
}
//# sourceMappingURL=learningStore.js.map