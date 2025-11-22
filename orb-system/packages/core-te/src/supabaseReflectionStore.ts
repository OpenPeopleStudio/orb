/**
 * Supabase-backed Te Reflection Store
 * 
 * Role: OrbRole.TE (reflection/memory)
 * 
 * Supabase-backed persistent storage for Te reflections using PostgreSQL.
 */

import { getSupabaseClient } from '@orb-system/core-orb';
import type { TeReflection } from './reflectionHelpers';
import type { TeReflectionStore } from './fileReflectionStore';

/**
 * Supabase-backed Te reflection store
 * Uses Supabase PostgreSQL via the Supabase client
 */
export class SupabaseTeReflectionStore implements TeReflectionStore {
  private supabase: any;

  constructor(supabaseClient?: any) {
    this.supabase = supabaseClient || getSupabaseClient();
  }

  async saveReflection(
    reflection: TeReflection,
    userId: string,
    sessionId?: string
  ): Promise<void> {
    const { error } = await this.supabase
      .from('te_reflections')
      .insert({
        id: reflection.id,
        user_id: userId,
        session_id: sessionId || null,
        input: reflection.input,
        output: reflection.output,
        tags: reflection.tags,
        notes: reflection.notes || null,
        created_at: reflection.createdAt instanceof Date 
          ? reflection.createdAt.toISOString() 
          : reflection.createdAt,
      });

    if (error) {
      // If it's a duplicate key error, try update instead
      if (error.code === '23505') {
        const { error: updateError } = await this.supabase
          .from('te_reflections')
          .update({
            input: reflection.input,
            output: reflection.output,
            tags: reflection.tags,
            notes: reflection.notes || null,
            created_at: reflection.createdAt instanceof Date 
              ? reflection.createdAt.toISOString() 
              : reflection.createdAt,
          })
          .eq('id', reflection.id);

        if (updateError) {
          throw new Error(`Failed to update reflection: ${updateError.message}`);
        }
        return;
      }
      throw new Error(`Failed to save reflection: ${error.message}`);
    }
  }

  async getReflections(userId: string, limit: number = 100): Promise<TeReflection[]> {
    const { data, error } = await this.supabase
      .from('te_reflections')
      .select('id, input, output, tags, notes, created_at, session_id')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to get reflections: ${error.message}`);
    }

    return (data || []).map((row: any) => ({
      id: row.id,
      input: row.input,
      output: row.output,
      tags: row.tags,
      notes: row.notes || undefined,
      createdAt: new Date(row.created_at),
    }));
  }

  async getReflectionsBySession(sessionId: string, limit: number = 100): Promise<TeReflection[]> {
    const { data, error } = await this.supabase
      .from('te_reflections')
      .select('id, input, output, tags, notes, created_at')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to get reflections by session: ${error.message}`);
    }

    return (data || []).map((row: any) => ({
      id: row.id,
      input: row.input,
      output: row.output,
      tags: row.tags,
      notes: row.notes || undefined,
      createdAt: new Date(row.created_at),
    }));
  }
}

