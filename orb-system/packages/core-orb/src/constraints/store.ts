// Re-export constraint store functions from storage module
export { 
  getConstraintStore, 
  initializeConstraintStore, 
  resetConstraintStore,
  type ConstraintStore,
  InMemoryConstraintStore
} from './storage';

// For backwards compatibility
import { getConstraintStore } from './storage';
import type { ConstraintSet } from './types';

export async function registerConstraintSet(set: ConstraintSet): Promise<void> {
  const store = getConstraintStore();
  await store.saveConstraintSet(set);
}

export async function removeConstraintSet(id: string): Promise<void> {
  const store = getConstraintStore();
  await store.deleteConstraintSet(id);
}


