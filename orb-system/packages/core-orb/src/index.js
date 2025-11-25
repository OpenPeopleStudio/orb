/**
 * core-orb
 *
 * Shared types, identity, and configuration for Orb system.
 * Browser-safe exports only - Node.js modules excluded for web compatibility.
 */
// Core role types (browser-safe)
export * from './orbRoles';
// Identity types (browser-safe - pure types and enums)
export * from './identity/types';
// Persona + classification helpers (pure logic)
export * from './persona';
// Constraint system (evaluations + types)
export * from './constraints';
// Event bus + sinks (used by dev server APIs)
export * from './events';
// Learning/adaptation types for insights timeline
export * from './adaptation';
// Demo flow helpers (used by Orb console)
export * from './demoFlow';
//# sourceMappingURL=index.js.map