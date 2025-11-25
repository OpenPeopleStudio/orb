/**
 * In-Memory Te Reflection Store
 *
 * Role: OrbRole.TE (reflection/memory)
 *
 * In-memory storage for Te reflections (useful for tests and ephemeral sessions).
 */
export class InMemoryTeReflectionStore {
    constructor() {
        // Map: userId -> Map: sessionId -> TeReflection[]
        this.reflections = new Map();
    }
    async saveReflection(reflection, userId, sessionId) {
        const sid = sessionId || 'default';
        // Get or create user's reflection map
        let userReflections = this.reflections.get(userId);
        if (!userReflections) {
            userReflections = new Map();
            this.reflections.set(userId, userReflections);
        }
        // Get or create session array
        let sessionReflections = userReflections.get(sid);
        if (!sessionReflections) {
            sessionReflections = [];
            userReflections.set(sid, sessionReflections);
        }
        // Append reflection (most recent last)
        sessionReflections.push(reflection);
    }
    async getReflections(userId, limit = 100) {
        const userReflections = this.reflections.get(userId);
        if (!userReflections) {
            return [];
        }
        // Collect all reflections from all sessions
        const allReflections = [];
        for (const sessionReflections of userReflections.values()) {
            allReflections.push(...sessionReflections);
        }
        // Sort by createdAt (most recent first) and limit
        allReflections.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        return allReflections.slice(0, limit);
    }
    async getReflectionsBySession(sessionId, limit = 100) {
        // Search across all users for this session
        const allSessionReflections = [];
        for (const userReflections of this.reflections.values()) {
            const sessionReflections = userReflections.get(sessionId);
            if (sessionReflections) {
                allSessionReflections.push(...sessionReflections);
            }
        }
        // Sort by createdAt (most recent first) and limit
        allSessionReflections.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        return allSessionReflections.slice(0, limit);
    }
    /**
     * Clear all reflections (useful for testing)
     */
    clear() {
        this.reflections.clear();
    }
    /**
     * Get total reflection count (useful for testing/debugging)
     */
    getTotalCount() {
        let count = 0;
        for (const userReflections of this.reflections.values()) {
            for (const sessionReflections of userReflections.values()) {
                count += sessionReflections.length;
            }
        }
        return count;
    }
}
//# sourceMappingURL=inMemoryReflectionStore.js.map