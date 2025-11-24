/**
 * Pattern Detector
 * 
 * Phase 6: Learning Loop - Pattern Detection
 * 
 * Analyzes event streams to find usage patterns.
 * Implements all 6 pattern types: frequent_action, time_based_routine,
 * mode_preference, error_pattern, efficiency_gain, risk_threshold.
 */

import type { OrbEvent } from '@orb-system/core-orb';
import type { Pattern, DetectionOptions } from '@orb-system/core-orb';
import { OrbEventType, OrbMode } from '@orb-system/core-orb';

export class PatternDetector {
  /**
   * Detect all patterns in events
   */
  async detectPatterns(
    events: OrbEvent[],
    options?: DetectionOptions
  ): Promise<Pattern[]> {
    const patterns: Pattern[] = [];
    
    // Filter by pattern types if specified
    const types = options?.patternTypes || [
      'frequent_action',
      'time_based_routine',
      'mode_preference',
      'error_pattern',
      'efficiency_gain',
      'risk_threshold',
    ];
    
    // Run requested detectors
    if (types.includes('frequent_action')) {
      patterns.push(...await this.detectFrequentActions(events, options));
    }
    if (types.includes('time_based_routine')) {
      patterns.push(...await this.detectTimeRoutines(events, options));
    }
    if (types.includes('mode_preference')) {
      patterns.push(...await this.detectModePreferences(events, options));
    }
    if (types.includes('error_pattern')) {
      patterns.push(...await this.detectErrorPatterns(events, options));
    }
    if (types.includes('efficiency_gain')) {
      patterns.push(...await this.detectEfficiencyGains(events, options));
    }
    if (types.includes('risk_threshold')) {
      patterns.push(...await this.detectRiskThresholds(events, options));
    }
    
    // Filter by minimum confidence
    const minConfidence = options?.minConfidence ?? 0.5;
    const filtered = patterns.filter(p => p.confidence >= minConfidence);
    
    // Sort by confidence descending
    filtered.sort((a, b) => b.confidence - a.confidence);
    
    return filtered;
  }
  
  /**
   * Detect frequent actions
   */
  async detectFrequentActions(
    events: OrbEvent[],
    options?: DetectionOptions
  ): Promise<Pattern[]> {
    const actionCounts: Map<string, {
      count: number;
      eventIds: string[];
      timestamps: string[];
    }> = new Map();
    
    // Count actions
    for (const event of events) {
      if (event.type === OrbEventType.ACTION_COMPLETED || 
          event.type === OrbEventType.TASK_COMPLETE) {
        const action = (event.payload.actionType as string) ||
                      (event.payload.taskLabel as string) ||
                      'unknown';
        
        const data = actionCounts.get(action) || { 
          count: 0, 
          eventIds: [], 
          timestamps: [] 
        };
        
        data.count++;
        data.eventIds.push(event.id);
        data.timestamps.push(event.timestamp);
        
        actionCounts.set(action, data);
      }
    }
    
    // Find frequent actions (threshold: 10 occurrences)
    const patterns: Pattern[] = [];
    
    for (const [action, data] of actionCounts.entries()) {
      if (data.count >= 10) {
        // Calculate confidence based on frequency
        const confidence = Math.min(1.0, data.count / 20);
        
        // Calculate average frequency per day
        const timeSpan = this.calculateTimeSpan(data.timestamps);
        const avgPerDay = timeSpan > 0 ? data.count / timeSpan : data.count;
        
        patterns.push({
          id: `pattern-frequent-${action}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: 'frequent_action',
          detectedAt: new Date().toISOString(),
          confidence,
          data: {
            actions: [action],
            frequency: data.count,
            avgPerDay,
          },
          eventIds: data.eventIds,
          eventCount: data.count,
          status: 'detected',
        });
      }
    }
    
    return patterns;
  }
  
  /**
   * Detect time-based routines
   */
  async detectTimeRoutines(
    events: OrbEvent[],
    options?: DetectionOptions
  ): Promise<Pattern[]> {
    const actionHours: Map<string, { hours: number[]; eventIds: string[] }> = new Map();
    
    for (const event of events) {
      if (event.type === OrbEventType.ACTION_COMPLETED) {
        const action = (event.payload.actionType as string) || 'unknown';
        const hour = new Date(event.timestamp).getHours();
        
        const data = actionHours.get(action) || { hours: [], eventIds: [] };
        data.hours.push(hour);
        data.eventIds.push(event.id);
        actionHours.set(action, data);
      }
    }
    
    const patterns: Pattern[] = [];
    
    for (const [action, data] of actionHours.entries()) {
      if (data.hours.length < 5) continue; // Need at least 5 occurrences
      
      // Find most common hour
      const hourCounts = this.countOccurrences(data.hours);
      const topHour = this.getTopValue(hourCounts);
      
      if (topHour.count >= 3) {
        // Calculate confidence based on consistency
        const consistency = topHour.count / data.hours.length;
        const confidence = Math.min(1.0, consistency * 1.2);
        
        if (confidence >= 0.5) {
          patterns.push({
            id: `pattern-routine-${action}-${topHour.value}-${Date.now()}`,
            type: 'time_based_routine',
            detectedAt: new Date().toISOString(),
            confidence,
            data: {
              actions: [action],
              timeWindow: {
                start: `${topHour.value}:00`,
                end: `${(topHour.value + 1) % 24}:00`,
              },
              frequency: topHour.count,
              consistency,
            },
            eventIds: data.eventIds,
            eventCount: topHour.count,
            status: 'detected',
          });
        }
      }
    }
    
    return patterns;
  }
  
  /**
   * Detect mode preferences
   */
  async detectModePreferences(
    events: OrbEvent[],
    options?: DetectionOptions
  ): Promise<Pattern[]> {
    const contextModes: Map<string, { modes: Map<string, number>; eventIds: string[] }> = new Map();
    
    for (const event of events) {
      if (event.mode && event.deviceId) {
        const context = event.deviceId;
        
        const data = contextModes.get(context) || { modes: new Map<string, number>(), eventIds: [] as string[] };
        data.modes.set(event.mode, (data.modes.get(event.mode) || 0) + 1);
        data.eventIds.push(event.id);
        contextModes.set(context, data);
      }
    }
    
    const patterns: Pattern[] = [];
    
    for (const [context, data] of contextModes.entries()) {
      const total = Array.from(data.modes.values()).reduce((a, b) => a + b, 0);
      
      for (const [mode, count] of data.modes.entries()) {
        const usageRate = count / total;
        
        if (usageRate >= 0.7 && total >= 10) {
          patterns.push({
            id: `pattern-mode-pref-${context}-${mode}-${Date.now()}`,
            type: 'mode_preference',
            detectedAt: new Date().toISOString(),
            confidence: Math.min(1.0, usageRate * 1.1),
            data: {
              modes: [mode as OrbMode],
              context,
              usageRate,
              count,
              total,
            },
            eventIds: data.eventIds,
            eventCount: count,
            status: 'detected',
          });
        }
      }
    }
    
    return patterns;
  }
  
  /**
   * Detect error patterns
   */
  async detectErrorPatterns(
    events: OrbEvent[],
    options?: DetectionOptions
  ): Promise<Pattern[]> {
    const actionStats: Map<string, {
      total: number;
      failures: number;
      eventIds: string[];
    }> = new Map();
    
    for (const event of events) {
      const action = (event.payload.actionType as string) || 'unknown';
      
      if (event.type === OrbEventType.ACTION_COMPLETED || 
          event.type === OrbEventType.ACTION_FAILED ||
          event.type === OrbEventType.TASK_COMPLETE ||
          event.type === OrbEventType.TASK_FAIL) {
        const data = actionStats.get(action) || { 
          total: 0, 
          failures: 0,
          eventIds: [],
        };
        
        data.total++;
        if (event.type === OrbEventType.ACTION_FAILED || event.type === OrbEventType.TASK_FAIL) {
          data.failures++;
        }
        data.eventIds.push(event.id);
        
        actionStats.set(action, data);
      }
    }
    
    const patterns: Pattern[] = [];
    
    for (const [action, data] of actionStats.entries()) {
      if (data.total >= 10 && data.failures >= 3) {
        const errorRate = data.failures / data.total;
        
        if (errorRate >= 0.2) {
          patterns.push({
            id: `pattern-error-${action}-${Date.now()}`,
            type: 'error_pattern',
            detectedAt: new Date().toISOString(),
            confidence: Math.min(1.0, errorRate * 1.5),
            data: {
              actions: [action],
              errorRate,
              failures: data.failures,
              total: data.total,
            },
            eventIds: data.eventIds,
            eventCount: data.total,
            status: 'detected',
          });
        }
      }
    }
    
    return patterns;
  }
  
  /**
   * Detect efficiency gains
   */
  async detectEfficiencyGains(
    events: OrbEvent[],
    options?: DetectionOptions
  ): Promise<Pattern[]> {
    const actionDurations: Map<string, number[]> = new Map();
    
    for (const event of events) {
      if (event.type === OrbEventType.ACTION_COMPLETED && event.metadata?.duration) {
        const action = (event.payload.actionType as string) || 'unknown';
        const duration = event.metadata.duration as number;
        
        const durations = actionDurations.get(action) || [];
        durations.push(duration);
        actionDurations.set(action, durations);
      }
    }
    
    const patterns: Pattern[] = [];
    
    for (const [action, durations] of actionDurations.entries()) {
      if (durations.length >= 10) {
        // Compare first half vs second half
        const midpoint = Math.floor(durations.length / 2);
        const firstHalf = durations.slice(0, midpoint);
        const secondHalf = durations.slice(midpoint);
        
        const avgFirst = this.average(firstHalf);
        const avgSecond = this.average(secondHalf);
        
        // Check if second half is faster
        if (avgSecond < avgFirst) {
          const improvement = (avgFirst - avgSecond) / avgFirst;
          
          if (improvement >= 0.15) {
            patterns.push({
              id: `pattern-efficiency-${action}-${Date.now()}`,
              type: 'efficiency_gain',
              detectedAt: new Date().toISOString(),
              confidence: Math.min(1.0, improvement * 2),
              data: {
                actions: [action],
                improvement,
                avgDuration: avgSecond,
                previousDuration: avgFirst,
              },
              eventIds: [],
              eventCount: durations.length,
              status: 'detected',
            });
          }
        }
      }
    }
    
    return patterns;
  }
  
  /**
   * Detect risk thresholds
   */
  async detectRiskThresholds(
    events: OrbEvent[],
    options?: DetectionOptions
  ): Promise<Pattern[]> {
    // This would analyze Luna decision events to determine approval rates
    // Placeholder implementation
    const patterns: Pattern[] = [];
    
    const highRiskEvents = events.filter(e => 
      e.type === OrbEventType.LUNA_ALLOW && 
      e.payload.riskLevel === 'high'
    );
    
    if (highRiskEvents.length >= 10) {
      patterns.push({
        id: `pattern-risk-threshold-${Date.now()}`,
        type: 'risk_threshold',
        detectedAt: new Date().toISOString(),
        confidence: Math.min(1.0, highRiskEvents.length / 15),
        data: {
          approvalRate: 1.0,
          riskLevel: 'high',
        },
        eventIds: highRiskEvents.map(e => e.id),
        eventCount: highRiskEvents.length,
        status: 'detected',
      });
    }
    
    return patterns;
  }
  
  /**
   * Helper: Calculate time span in days
   */
  private calculateTimeSpan(timestamps: string[]): number {
    if (timestamps.length < 2) return 0;
    
    const sorted = timestamps.map(t => new Date(t).getTime()).sort();
    const spanMs = sorted[sorted.length - 1] - sorted[0];
    return spanMs / (1000 * 60 * 60 * 24); // days
  }
  
  /**
   * Helper: Count occurrences
   */
  private countOccurrences<T>(items: T[]): Map<T, number> {
    const counts = new Map<T, number>();
    for (const item of items) {
      counts.set(item, (counts.get(item) || 0) + 1);
    }
    return counts;
  }
  
  /**
   * Helper: Get top value from counts
   */
  private getTopValue<T>(counts: Map<T, number>): { value: T; count: number } {
    let topValue: T | undefined;
    let topCount = 0;
    
    for (const [value, count] of counts.entries()) {
      if (count > topCount) {
        topValue = value;
        topCount = count;
      }
    }
    
    return { value: topValue!, count: topCount };
  }
  
  /**
   * Helper: Calculate average
   */
  private average(numbers: number[]): number {
    if (numbers.length === 0) return 0;
    return numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
  }
}

// Singleton instance
let detector: PatternDetector | null = null;

export function getPatternDetector(): PatternDetector {
  if (!detector) {
    detector = new PatternDetector();
  }
  return detector;
}

export function resetPatternDetector(): void {
  detector = null;
}

