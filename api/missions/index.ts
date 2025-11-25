import type { VercelRequest, VercelResponse } from '@vercel/node';
import { missionStore } from '../../../apps/orb-service/src/store';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const missions = await missionStore.list();
    return res.status(200).json({ missions });
  } catch (error) {
    console.error('[api/missions] Failed to list missions', error);
    return res.status(500).json({ error: 'Failed to list missions' });
  }
}


