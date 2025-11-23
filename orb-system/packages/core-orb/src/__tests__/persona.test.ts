import { describe, it, expect, beforeEach } from '@jest/globals';

import {
  classifyPersona,
  setPersonaOverride,
  clearPersonaOverrides,
} from '../persona';
import { OrbDevice, OrbPersona } from '../identity/types';

describe('persona classification', () => {
  beforeEach(() => {
    clearPersonaOverrides();
  });

  it('classifies SWL persona when operating on Mars device', () => {
    const result = classifyPersona({
      userId: 'persona-1',
      device: OrbDevice.MARS,
    });

    expect(result.persona).toBe(OrbPersona.SWL);
    expect(result.source).toBe('rule');
  });

  it('honors explicit overrides', () => {
    setPersonaOverride('persona-2', OrbPersona.OPEN_PEOPLE);

    const result = classifyPersona({
      userId: 'persona-2',
      device: OrbDevice.SOL,
    });

    expect(result.persona).toBe(OrbPersona.OPEN_PEOPLE);
    expect(result.source).toBe('override');
  });
});


