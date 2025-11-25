import type { MissionState } from '@orb-system/forge';

export interface MissionStore {
  save(state: MissionState): Promise<void>;
  get(id: string): Promise<MissionState | undefined>;
  list(limit?: number): Promise<MissionState[]>;
}


