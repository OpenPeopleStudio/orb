import { Router } from 'express';

import type { MissionResult, MissionState } from '@orb-system/forge';
import { processMissionStream } from '@orb-system/forge';

import { missionStore } from '../store';

interface StreamRequestBody {
  prompt: string;
  userId?: string;
  sessionId?: string;
}

const DEFAULT_USER_ID = 'demo-user';

export const missionsRouter = Router();

missionsRouter.get('/', async (_req, res) => {
  const missions = await missionStore.list();
  res.json({ missions });
});

missionsRouter.get('/:id', async (req, res) => {
  const mission = await missionStore.get(req.params.id);
  if (!mission) {
    return res.status(404).json({ error: 'Mission not found' });
  }
  return res.json(mission);
});

missionsRouter.post('/stream', async (req, res) => {
  const { prompt, userId }: StreamRequestBody = req.body ?? {};

  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  const abortController = new AbortController();
  req.on('close', () => abortController.abort());

  try {
    const iterator = processMissionStream(prompt, {
      userId: userId ?? DEFAULT_USER_ID,
      sessionId: req.body?.sessionId,
    });

    let finalResult: MissionResult | null = null;

    while (true) {
      const { value, done } = await iterator.next();
      if (done) {
        finalResult = value ?? null;
        break;
      }

      const state = value as MissionState;
      await missionStore.save(state);
      res.write(`data: ${JSON.stringify(state)}\n\n`);
    }

    if (finalResult) {
      await missionStore.save(finalResult.state);
      res.write(`event: result\ndata: ${JSON.stringify(finalResult)}\n\n`);
    }

    res.write('event: end\n\n');
    res.end();
  } catch (error) {
    res.write(
      `event: error\ndata: ${JSON.stringify({
        message: error instanceof Error ? error.message : 'Mission processing failed',
      })}\n\n`
    );
    res.end();
  }
});


