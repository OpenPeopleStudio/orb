/**
 * Mission storage using localStorage
 * Stores mission history for retrieval and analysis
 */

import type { MissionState, MissionResult } from '@orb-system/forge';

const STORAGE_KEY = 'orb_mission_history';
const MAX_HISTORY_SIZE = 50; // Keep last 50 missions

export interface MissionHistoryEntry {
  id: string;
  prompt: string;
  result: MissionResult;
  timestamp: string;
}

/**
 * Get all mission history entries
 */
export function getMissionHistory(): MissionHistoryEntry[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    
    const history = JSON.parse(stored) as MissionHistoryEntry[];
    return history.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  } catch (error) {
    console.error('[MissionStorage] Error reading history:', error);
    return [];
  }
}

/**
 * Save a mission to history
 */
export function saveMission(result: MissionResult): void {
  try {
    const history = getMissionHistory();
    
    const entry: MissionHistoryEntry = {
      id: result.mission.id,
      prompt: result.mission.prompt,
      result,
      timestamp: new Date().toISOString(),
    };
    
    // Add to beginning and limit size
    history.unshift(entry);
    if (history.length > MAX_HISTORY_SIZE) {
      history.splice(MAX_HISTORY_SIZE);
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch (error) {
    console.error('[MissionStorage] Error saving mission:', error);
  }
}

/**
 * Get a specific mission by ID
 */
export function getMission(id: string): MissionHistoryEntry | null {
  const history = getMissionHistory();
  return history.find(entry => entry.id === id) || null;
}

/**
 * Delete a mission from history
 */
export function deleteMission(id: string): void {
  try {
    const history = getMissionHistory();
    const filtered = history.filter(entry => entry.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('[MissionStorage] Error deleting mission:', error);
  }
}

/**
 * Clear all mission history
 */
export function clearHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('[MissionStorage] Error clearing history:', error);
  }
}

/**
 * Get mission statistics
 */
export function getMissionStats(): {
  total: number;
  successful: number;
  failed: number;
  averageProcessingTime: number;
} {
  const history = getMissionHistory();
  
  const successful = history.filter(entry => entry.result.success).length;
  const failed = history.filter(entry => !entry.result.success).length;
  
  const processingTimes = history
    .filter(entry => entry.result.state.startedAt && entry.result.state.completedAt)
    .map(entry => {
      const start = new Date(entry.result.state.startedAt!).getTime();
      const end = new Date(entry.result.state.completedAt!).getTime();
      return end - start;
    });
  
  const averageProcessingTime = processingTimes.length > 0
    ? processingTimes.reduce((sum, time) => sum + time, 0) / processingTimes.length
    : 0;
  
  return {
    total: history.length,
    successful,
    failed,
    averageProcessingTime,
  };
}

/**
 * Search mission history by prompt text
 */
export function searchMissions(query: string): MissionHistoryEntry[] {
  const history = getMissionHistory();
  const lowerQuery = query.toLowerCase();
  
  return history.filter(entry =>
    entry.prompt.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Export mission history as JSON
 */
export function exportHistory(): string {
  const history = getMissionHistory();
  return JSON.stringify(history, null, 2);
}

/**
 * Import mission history from JSON
 */
export function importHistory(json: string): boolean {
  try {
    const imported = JSON.parse(json) as MissionHistoryEntry[];
    
    // Validate structure
    if (!Array.isArray(imported)) {
      throw new Error('Invalid format: expected array');
    }
    
    // Merge with existing history (newest first, remove duplicates by ID)
    const existing = getMissionHistory();
    const merged = [...imported, ...existing];
    const uniqueById = new Map<string, MissionHistoryEntry>();
    
    merged.forEach(entry => {
      if (!uniqueById.has(entry.id)) {
        uniqueById.set(entry.id, entry);
      }
    });
    
    const uniqueHistory = Array.from(uniqueById.values())
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, MAX_HISTORY_SIZE);
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(uniqueHistory));
    return true;
  } catch (error) {
    console.error('[MissionStorage] Error importing history:', error);
    return false;
  }
}

