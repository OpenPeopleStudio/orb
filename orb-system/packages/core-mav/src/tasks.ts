/**
 * Task Service
 * 
 * Migrated from repo: SomaOS, path: Services/TaskService.swift
 * Date: 2025-11-22
 * Role: OrbRole.MAV (actions/tools)
 * 
 * Handles task creation, updates, and management.
 */

import { OrbRole, OrbContext } from '@orb-system/core-orb';

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
export class TaskService {
  private static instance: TaskService;
  
  private constructor() {}
  
  static getInstance(): TaskService {
    if (!TaskService.instance) {
      TaskService.instance = new TaskService();
    }
    return TaskService.instance;
  }
  
  /**
   * Fetch tasks for a device
   */
  async fetchTasks(ctx: OrbContext, deviceID: string): Promise<TaskItem[]> {
    if (ctx.role !== OrbRole.MAV) {
      console.warn(`fetchTasks called with role ${ctx.role}, expected MAV`);
    }
    
    // This would call the backend API
    // For now, return empty array as placeholder
    return [];
  }
  
  /**
   * Add a new task
   */
  async addTask(
    ctx: OrbContext,
    title: string,
    persona: string
  ): Promise<void> {
    if (ctx.role !== OrbRole.MAV) {
      console.warn(`addTask called with role ${ctx.role}, expected MAV`);
    }
    
    const request: AddTaskRequest = {
      device_id: ctx.deviceId || '',
      device_label: '', // Would come from config
      persona: persona,
      title: title,
      status: 'queued',
    };
    
    // This would call the backend API
    console.log(`[MAV] Adding task: ${title}`);
  }
  
  /**
   * Update task status
   */
  async updateTask(
    ctx: OrbContext,
    taskId: string,
    status: string,
    deviceID: string
  ): Promise<void> {
    if (ctx.role !== OrbRole.MAV) {
      console.warn(`updateTask called with role ${ctx.role}, expected MAV`);
    }
    
    const request: UpdateTaskRequest = {
      task_id: taskId,
      device_id: deviceID,
      status: status,
    };
    
    // This would call the backend API
    console.log(`[MAV] Updating task ${taskId} to status ${status}`);
  }
  
  /**
   * Delete a task
   */
  async deleteTask(ctx: OrbContext, taskId: string, deviceID: string): Promise<void> {
    if (ctx.role !== OrbRole.MAV) {
      console.warn(`deleteTask called with role ${ctx.role}, expected MAV`);
    }
    
    // This would call the backend API
    console.log(`[MAV] Deleting task ${taskId}`);
  }
}

export const taskService = TaskService.getInstance();

