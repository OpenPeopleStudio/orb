/**
 * Calendar Integration
 *
 * Migrated from repo: SomaOS, path: Services/CalendarService.swift
 * Date: 2025-11-22
 * Role: OrbRole.MAV (actions/tools)
 *
 * Handles calendar event management.
 */
import { OrbContext } from '@orb-system/core-orb';
export interface CalendarEvent {
    id: string;
    device_id: string;
    title: string;
    start_time: Date;
    end_time?: Date;
    location?: string;
    created_at: Date;
}
/**
 * Calendar Service for managing calendar events
 */
export declare class CalendarService {
    private static instance;
    private constructor();
    static getInstance(): CalendarService;
    /**
     * Fetch calendar events for a device
     */
    fetchEvents(ctx: OrbContext, deviceID: string): Promise<CalendarEvent[]>;
    /**
     * Add a calendar event
     */
    addEvent(ctx: OrbContext, title: string, startTime: Date, endTime?: Date, location?: string): Promise<void>;
}
export declare const calendarService: CalendarService;
//# sourceMappingURL=calendar.d.ts.map