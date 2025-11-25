/**
 * Task Service
 *
 * Migrated from repo: SomaOS, path: Services/TaskService.swift
 * Date: 2025-11-22
 * Role: OrbRole.MAV (actions/tools)
 *
 * Handles task creation, updates, and management.
 */
import { OrbContext } from '@orb-system/core-orb';
export interface TaskItem {
    id: string;
    device_id: string;
    persona?: string;
    title: string;
    status: 'queued' | 'pending' | 'in_progress' | 'completed' | 'blocked' | 'done';
    created_at: Date;
    completed_at?: Date;
}
export interface AddTaskRequest {
    device_id: string;
    device_label: string;
    persona: string;
    title: string;
    status: string;
}
export interface UpdateTaskRequest {
    task_id: string;
    device_id: string;
    status: string;
}
/**
 * Task Service for managing tasks
 */
export declare class TaskService {
    private static instance;
    private constructor();
    static getInstance(): TaskService;
    /**
     * Fetch tasks for a device
     */
    fetchTasks(ctx: OrbContext, deviceID: string): Promise<TaskItem[]>;
    /**
     * Add a new task
     */
    addTask(ctx: OrbContext, title: string, persona: string): Promise<void>;
    /**
     * Update task status
     */
    updateTask(ctx: OrbContext, taskId: string, status: string, deviceID: string): Promise<void>;
    /**
     * Delete a task
     */
    deleteTask(ctx: OrbContext, taskId: string, deviceID: string): Promise<void>;
}
export declare const taskService: TaskService;
//# sourceMappingURL=tasks.d.ts.map