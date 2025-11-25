import { Pool } from 'pg';

import type { MissionState } from '@orb-system/forge';

import type { MissionStore } from './types';

const DEFAULT_LIMIT = 50;

export class PostgresMissionStore implements MissionStore {
  private pool: Pool;
  private ready: Promise<void>;

  constructor(connectionString: string) {
    this.pool = new Pool({ connectionString });
    this.ready = this.pool
      .query(`
        CREATE TABLE IF NOT EXISTS missions (
          id TEXT PRIMARY KEY,
          payload JSONB NOT NULL,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `)
      .then(() => {});
  }

  private async ensureReady() {
    await this.ready;
  }

  async save(state: MissionState): Promise<void> {
    await this.ensureReady();
    await this.pool.query(
      `
        INSERT INTO missions (id, payload, updated_at)
        VALUES ($1, $2, NOW())
        ON CONFLICT (id) DO UPDATE SET
          payload = EXCLUDED.payload,
          updated_at = NOW();
      `,
      [state.mission.id, state]
    );
  }

  async get(id: string): Promise<MissionState | undefined> {
    await this.ensureReady();
    const result = await this.pool.query<{ payload: MissionState }>(
      `SELECT payload FROM missions WHERE id = $1 LIMIT 1`,
      [id]
    );
    return result.rows[0]?.payload;
  }

  async list(limit = DEFAULT_LIMIT): Promise<MissionState[]> {
    await this.ensureReady();
    const result = await this.pool.query<{ payload: MissionState }>(
      `SELECT payload FROM missions ORDER BY updated_at DESC LIMIT $1`,
      [limit]
    );
    return result.rows.map((row) => row.payload);
  }
}


