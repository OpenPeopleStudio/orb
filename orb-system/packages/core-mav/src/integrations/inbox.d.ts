/**
 * Inbox Integration
 *
 * Migrated from repo: SomaOS, path: Services/InboxService.swift
 * Date: 2025-11-22
 * Role: OrbRole.MAV (actions/tools)
 *
 * Handles inbox/message management.
 */
import { OrbContext } from '@orb-system/core-orb';
export interface InboxMessage {
    id: string;
    device_id: string;
    sender: string;
    subject?: string;
    text: string;
    timestamp: Date;
    read: boolean;
}
/**
 * Inbox Service for managing messages
 */
export declare class InboxService {
    private static instance;
    private constructor();
    static getInstance(): InboxService;
    /**
     * Fetch inbox messages for a device
     */
    fetchInbox(ctx: OrbContext, deviceID: string): Promise<InboxMessage[]>;
    /**
     * Mark message as read
     */
    markAsRead(ctx: OrbContext, messageId: string): Promise<void>;
}
export declare const inboxService: InboxService;
//# sourceMappingURL=inbox.d.ts.map