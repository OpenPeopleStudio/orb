/**
 * Validation Schemas
 * 
 * Schemas and validators for stored data structures
 */

import type { LunaProfile, LunaModeId } from '@orb-system/core-luna';
import type { TeReflection } from '@orb-system/core-te';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validate Luna profile structure
 */
export function validateLunaProfile(profile: any): ValidationResult {
  const errors: string[] = [];

  if (!profile) {
    return { valid: false, errors: ['Profile is null or undefined'] };
  }

  if (typeof profile.userId !== 'string' || !profile.userId) {
    errors.push('userId must be a non-empty string');
  }

  if (typeof profile.modeId !== 'string' || !profile.modeId) {
    errors.push('modeId must be a non-empty string');
  }

  if (!Array.isArray(profile.preferences)) {
    errors.push('preferences must be an array');
  } else {
    profile.preferences.forEach((pref: any, index: number) => {
      if (typeof pref !== 'string') {
        errors.push(`preferences[${index}] must be a string`);
      }
    });
  }

  if (!Array.isArray(profile.constraints)) {
    errors.push('constraints must be an array');
  } else {
    profile.constraints.forEach((constraint: any, index: number) => {
      if (typeof constraint !== 'string') {
        errors.push(`constraints[${index}] must be a string`);
      }
    });
  }

  if (typeof profile.updatedAt !== 'string' || !profile.updatedAt) {
    errors.push('updatedAt must be a non-empty ISO timestamp string');
  } else {
    // Validate ISO timestamp
    const date = new Date(profile.updatedAt);
    if (isNaN(date.getTime())) {
      errors.push('updatedAt must be a valid ISO timestamp');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate Te reflection structure
 */
export function validateTeReflection(reflection: any): ValidationResult {
  const errors: string[] = [];

  if (!reflection) {
    return { valid: false, errors: ['Reflection is null or undefined'] };
  }

  if (typeof reflection.id !== 'string' || !reflection.id) {
    errors.push('id must be a non-empty string');
  }

  if (typeof reflection.input !== 'string') {
    errors.push('input must be a string');
  }

  if (typeof reflection.output !== 'string') {
    errors.push('output must be a string');
  }

  if (!Array.isArray(reflection.tags)) {
    errors.push('tags must be an array');
  } else {
    reflection.tags.forEach((tag: any, index: number) => {
      if (typeof tag !== 'string') {
        errors.push(`tags[${index}] must be a string`);
      }
    });
  }

  if (reflection.notes !== undefined && typeof reflection.notes !== 'string') {
    errors.push('notes must be a string or undefined');
  }

  if (!(reflection.createdAt instanceof Date)) {
    if (typeof reflection.createdAt === 'string') {
      const date = new Date(reflection.createdAt);
      if (isNaN(date.getTime())) {
        errors.push('createdAt must be a valid Date or ISO timestamp string');
      }
    } else {
      errors.push('createdAt must be a Date or ISO timestamp string');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate Luna file data structure
 */
export function validateLunaFileData(data: any): ValidationResult {
  const errors: string[] = [];

  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Data must be an object'] };
  }

  for (const userId in data) {
    const userData = data[userId];
    
    if (!userData || typeof userData !== 'object') {
      errors.push(`User ${userId}: data must be an object`);
      continue;
    }

    if (typeof userData.activeMode !== 'string') {
      errors.push(`User ${userId}: activeMode must be a string`);
    }

    if (!userData.profiles || typeof userData.profiles !== 'object') {
      errors.push(`User ${userId}: profiles must be an object`);
      continue;
    }

    for (const modeId in userData.profiles) {
      const profileResult = validateLunaProfile(userData.profiles[modeId]);
      if (!profileResult.valid) {
        errors.push(`User ${userId}, Mode ${modeId}: ${profileResult.errors.join(', ')}`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate Te file data structure
 */
export function validateTeFileData(data: any): ValidationResult {
  const errors: string[] = [];

  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Data must be an object'] };
  }

  if (!data.sessions || typeof data.sessions !== 'object') {
    errors.push('sessions must be an object');
  } else {
    for (const sessionId in data.sessions) {
      const reflections = data.sessions[sessionId];
      if (!Array.isArray(reflections)) {
        errors.push(`Session ${sessionId}: reflections must be an array`);
        continue;
      }

      reflections.forEach((reflection: any, index: number) => {
        const reflectionResult = validateTeReflection(reflection);
        if (!reflectionResult.valid) {
          errors.push(`Session ${sessionId}, Reflection ${index}: ${reflectionResult.errors.join(', ')}`);
        }
      });
    }
  }

  if (!data.userSessions || typeof data.userSessions !== 'object') {
    errors.push('userSessions must be an object');
  } else {
    for (const userId in data.userSessions) {
      const sessionIds = data.userSessions[userId];
      if (!Array.isArray(sessionIds)) {
        errors.push(`User ${userId}: sessionIds must be an array`);
      } else {
        sessionIds.forEach((sid: any, index: number) => {
          if (typeof sid !== 'string') {
            errors.push(`User ${userId}, SessionId[${index}]: must be a string`);
          }
        });
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Sanitize Luna profile (fix common issues)
 */
export function sanitizeLunaProfile(profile: any): LunaProfile | null {
  if (!profile || typeof profile !== 'object') {
    return null;
  }

  return {
    userId: String(profile.userId || ''),
    modeId: String(profile.modeId || 'default'),
    preferences: Array.isArray(profile.preferences) 
      ? profile.preferences.filter((p: any) => typeof p === 'string')
      : [],
    constraints: Array.isArray(profile.constraints)
      ? profile.constraints.filter((c: any) => typeof c === 'string')
      : [],
    updatedAt: typeof profile.updatedAt === 'string' 
      ? profile.updatedAt 
      : new Date().toISOString(),
  };
}

/**
 * Sanitize Te reflection (fix common issues)
 */
export function sanitizeTeReflection(reflection: any): TeReflection | null {
  if (!reflection || typeof reflection !== 'object') {
    return null;
  }

  let createdAt: Date;
  if (reflection.createdAt instanceof Date) {
    createdAt = reflection.createdAt;
  } else if (typeof reflection.createdAt === 'string') {
    createdAt = new Date(reflection.createdAt);
    if (isNaN(createdAt.getTime())) {
      createdAt = new Date();
    }
  } else {
    createdAt = new Date();
  }

  return {
    id: String(reflection.id || crypto.randomUUID()),
    input: String(reflection.input || ''),
    output: String(reflection.output || ''),
    tags: Array.isArray(reflection.tags)
      ? reflection.tags.filter((t: any) => typeof t === 'string')
      : [],
    notes: reflection.notes !== undefined ? String(reflection.notes) : undefined,
    createdAt,
  };
}

