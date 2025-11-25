import type { MissionState } from '@orb-system/forge';

import type { MissionStore } from './types';

/**
 * Lightweight in-memory persistence for mission states.
 * This is a placeholder until we wire up a database.
 */
export class MemoryMissionStore implements MissionStore {
  private missions = new Map<string, MissionState>();

  async save(state: MissionState) {
    this.missions.set(state.mission.id, { ...state });
  }

  async get(id: string): Promise<MissionState | undefined> {
    return this.missions.get(id);
  }

  async list(limit = 50): Promise<MissionState[]> {
    const missions = Array.from(this.missions.values()).sort((a, b) => {
      const aUpdated = new Date(a.completedAt ?? a.startedAt ?? Date.now()).getTime();
      const bUpdated = new Date(b.completedAt ?? b.startedAt ?? Date.now()).getTime();
      return bUpdated - aUpdated;
    });
    return missions.slice(0, limit);
  }
}



