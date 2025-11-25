import type { VercelRequest, VercelResponse } from '@vercel/node';
import { missionStore } from '../../../apps/orb-service/src/store';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Mission id is required' });
  }

  try {
    const mission = await missionStore.get(id);
    if (!mission) {
      return res.status(404).json({ error: 'Mission not found' });
    }
    return res.status(200).json({ mission });
  } catch (error) {
    console.error(`[api/missions/${id}] Failed to fetch mission`, error);
    return res.status(500).json({ error: 'Failed to fetch mission' });
  }
}


