import { OrbDevice, OrbMode, OrbPersona } from '../identity/types';
import { ConstraintSet, ActionContext } from './types';

export function getDefaultConstraintSets(): ConstraintSet[] {
  const systemSafety: ConstraintSet = {
    id: 'system.safety',
    label: 'System Guard Rails',
    description: 'Baseline guard rails that keep cross-role actions safe.',
    scope: 'system',
    priority: 10,
    tags: ['safety', 'defaults'],
    constraints: [
      {
        id: 'require-forge-for-high-risk',
        label: 'High-Risk Actions Require Forge/Builder',
        description:
          'High-risk file or tool actions may only run while Forge or Builder mode is active.',
        severity: 'block',
        appliesTo: {
          actions: ['file_write', 'tool_call', 'task'],
        },
        evaluate: (context: ActionContext) => {
          if (!context.action) {
            return { status: 'pass' };
          }
          const risk = context.action.risk ?? 'low';
          if (risk !== 'high') {
            return { status: 'pass' };
          }
          if (context.mode === OrbMode.FORGE || context.mode === OrbMode.BUILDER) {
            return { status: 'pass' };
          }
          return {
            status: 'block',
            reason: 'High-risk actions are limited to Forge or Builder mode.',
          };
        },
      },
      {
        id: 'warn-personal-file-writes',
        label: 'Warn on File Writes in Personal Modes',
        description: 'Surface a warning when editing files while Personal/Earth context is active.',
        severity: 'warn',
        appliesTo: {
          actions: ['file_write'],
          modes: [OrbMode.EARTH, OrbMode.DEFAULT],
        },
        evaluate: (context: ActionContext) => {
          if (!context.action) {
            return { status: 'pass' };
          }
          return {
            status: 'warn',
            reason:
              'File writes in personal contexts require extra attention. Consider switching to Forge mode.',
          };
        },
      },
    ],
  };

  const restaurantOps: ConstraintSet = {
    id: 'mode.restaurant',
    label: 'Restaurant Ops',
    description:
      'Constraints tied to the restaurant/mars modes sourced from the SomaOS porting plan.',
    scope: 'mode',
    constraints: [
      {
        id: 'restaurant-persona-required',
        label: 'Restaurant persona required',
        severity: 'block',
        appliesTo: {
          actions: ['mode_transition'],
          modes: [OrbMode.RESTAURANT, OrbMode.MARS],
        },
        evaluate: (context: ActionContext) => {
          if (context.persona === OrbPersona.SWL) {
            return { status: 'pass' };
          }
          return {
            status: 'block',
            reason: 'Restaurant/Mars mode is only available when the SWL persona is active.',
          };
        },
      },
      {
        id: 'restaurant-device-check',
        label: 'Restaurant device alignment',
        severity: 'warn',
        appliesTo: {
          actions: ['mode_transition'],
          modes: [OrbMode.RESTAURANT],
        },
        evaluate: (context: ActionContext) => {
          if (!context.device || context.device === OrbDevice.MARS) {
            return { status: 'pass' };
          }
          return {
            status: 'warn',
            reason: 'Restaurant mode expects the Mars device. Confirm context before switching.',
          };
        },
      },
    ],
  };

  const realEstateOps: ConstraintSet = {
    id: 'mode.real_estate',
    label: 'Real Estate Ops',
    scope: 'mode',
    constraints: [
      {
        id: 'real-estate-device-check',
        label: 'Device scoped for Real Estate mode',
        description: 'Real Estate mode is optimized for Mars or Earth devices.',
        severity: 'block',
        appliesTo: {
          actions: ['mode_transition'],
          modes: [OrbMode.REAL_ESTATE],
        },
        evaluate: (context: ActionContext) => {
          if (!context.device) {
            return {
              status: 'warn',
              reason: 'Device is unknown. Confirm before enabling Real Estate mode.',
            };
          }
          if (context.device === OrbDevice.MARS || context.device === OrbDevice.EARTH) {
            return { status: 'pass' };
          }
          return {
            status: 'block',
            reason: 'Real Estate mode requires the Mars or Earth device profile.',
          };
        },
      },
    ],
  };

  const personaDefaults: ConstraintSet = {
    id: 'persona.defaults',
    label: 'Persona Defaults',
    scope: 'persona',
    constraints: [
      {
        id: 'open-people-low-risk',
        label: 'Open People discourages high-risk actions',
        severity: 'warn',
        appliesTo: {
          personas: [OrbPersona.OPEN_PEOPLE],
          actions: ['file_write', 'tool_call', 'task'],
        },
        evaluate: (context: ActionContext) => {
          if (context.action?.risk === 'high') {
            return {
              status: 'warn',
              reason: 'Open People persona prefers calm contexts; defer high-risk actions.',
            };
          }
          return { status: 'pass' };
        },
      },
    ],
  };

  return [systemSafety, restaurantOps, realEstateOps, personaDefaults];
}


