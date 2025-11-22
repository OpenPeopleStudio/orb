/**
 * Te Reflection Helpers
 * 
 * Types and utilities for Te reflections.
 */

import { OrbRole, type OrbContext } from '@orb-system/core-orb';

/**
 * Te Reflection - represents a reflection on a run/action
 */
export interface TeReflection {
  id: string;
  input: string;
  output: string;
  tags: string[];
  notes?: string;
  createdAt: Date;
}

/**
 * Create a Te reflection from context and data
 */
export function createTeReflection(
  context: OrbContext,
  data: {
    input: string;
    output: string;
    tags: string[];
    notes?: string;
  }
): TeReflection {
  return {
    id: crypto.randomUUID(),
    input: data.input,
    output: data.output,
    tags: data.tags,
    notes: data.notes,
    createdAt: new Date(),
  };
}

