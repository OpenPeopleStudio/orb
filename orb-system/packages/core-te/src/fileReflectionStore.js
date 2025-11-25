/**
 * File-backed Te Reflection Store
 *
 * Role: OrbRole.TE (reflection/memory)
 *
 * File-based persistent storage for Te reflections using JSON files.
 */
import { readJson, writeJson } from '@orb-system/core-orb';
export class FileTeReflectionStore {
    constructor() {
        this.filePath = 'te/reflections.json';
    }
    async getData() {
        return readJson(this.filePath, {
            sessions: {},
            userSessions: {},
        });
    }
    async saveData(data) {
        await writeJson(this.filePath, data);
    }
    async saveReflection(reflection, userId, sessionId) {
        const data = await this.getData();
        const sid = sessionId || 'default';
        // Initialize session array if needed
        if (!data.sessions[sid]) {
            data.sessions[sid] = [];
        }
        // Append reflection (most recent last)
        data.sessions[sid].push(reflection);
        // Update user sessions index
        if (!data.userSessions[userId]) {
            data.userSessions[userId] = [];
        }
        if (!data.userSessions[userId].includes(sid)) {
            data.userSessions[userId].push(sid);
        }
        await this.saveData(data);
    }
    async getReflections(userId, limit = 100) {
        const data = await this.getData();
        const sessionIds = data.userSessions[userId] || [];
        // Collect all reflections from user's sessions
        const allReflections = [];
        for (const sessionId of sessionIds) {
            const sessionReflections = data.sessions[sessionId] || [];
            allReflections.push(...sessionReflections);
        }
        // Sort by createdAt (most recent first) and limit
        allReflections.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        return allReflections.slice(0, limit);
    }
    async getReflectionsBySession(sessionId, limit = 100) {
        const data = await this.getData();
        const reflections = data.sessions[sessionId] || [];
        // Return most recent reflections (they're stored with most recent last)
        return reflections.slice(-limit).reverse();
    }
}
//# sourceMappingURL=fileReflectionStore.js.map