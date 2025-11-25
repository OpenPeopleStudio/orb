import { config } from '../config';

import { MemoryMissionStore } from './memory-mission-store';
import { PostgresMissionStore } from './postgres-mission-store';
import type { MissionStore } from './types';

let missionStore: MissionStore;

if (config.databaseUrl) {
  missionStore = new PostgresMissionStore(config.databaseUrl);
  console.log('[orb-service] Using Postgres mission store');
} else {
  missionStore = new MemoryMissionStore();
  console.warn('[orb-service] DATABASE_URL not set. Using in-memory mission store.');
}

export { missionStore };


