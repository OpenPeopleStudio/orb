import { getDefaultConstraintSets } from './defaultSets';
import type { ConstraintSet, ConstraintStore } from './types';

class InMemoryConstraintStore implements ConstraintStore {
  private sets: Map<string, ConstraintSet>;

  constructor(initialSets: ConstraintSet[] = []) {
    this.sets = new Map(initialSets.map((set) => [set.id, set]));
  }

  async list(): Promise<ConstraintSet[]> {
    return Array.from(this.sets.values()).sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
  }

  async get(id: string): Promise<ConstraintSet | undefined> {
    return this.sets.get(id);
  }

  async save(set: ConstraintSet): Promise<void> {
    this.sets.set(set.id, set);
  }

  async delete(id: string): Promise<void> {
    this.sets.delete(id);
  }
}

let sharedStore: ConstraintStore = new InMemoryConstraintStore(getDefaultConstraintSets());

export function getConstraintStore(): ConstraintStore {
  return sharedStore;
}

export function seedConstraintStore(sets?: ConstraintSet[]): void {
  sharedStore = new InMemoryConstraintStore(sets ?? getDefaultConstraintSets());
}

export async function registerConstraintSet(set: ConstraintSet): Promise<void> {
  await sharedStore.save(set);
}

export async function removeConstraintSet(id: string): Promise<void> {
  await sharedStore.delete(id);
}


