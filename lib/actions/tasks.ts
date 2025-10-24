'use server';

import { revalidatePath } from 'next/cache';
import { supabaseAdmin } from '@/lib/supabase';
import { NewUrgentTask } from '@/db/schema';

export async function getUrgentTasks() {
  const { data, error } = await supabaseAdmin
    .from('urgent_tasks')
    .select('*')
    .order('due_at', { ascending: true });

  if (error) {
    console.error('Error fetching urgent tasks:', error);
    return [];
  }

  return data;
}

export async function createUrgentTask(item: Omit<NewUrgentTask, 'id' | 'created_at' | 'updated_at'>) {
  try {
    const { data, error } = await supabaseAdmin
      .from('urgent_tasks')
      .insert(item)
      .select()
      .single();

    if (error) {
      console.error('Error creating urgent task:', error);
      return { success: false, error: error.message };
    }

    revalidatePath('/admin/tasks');
    revalidatePath('/display');
    return { success: true, data };
  } catch (error) {
    console.error('Error creating urgent task:', error);
    return { success: false, error: 'Failed to create urgent task' };
  }
}

export async function updateUrgentTask(id: string, item: Partial<NewUrgentTask>) {
  try {
    const { data, error } = await supabaseAdmin
      .from('urgent_tasks')
      .update({
        ...item,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating urgent task:', error);
      return { success: false, error: error.message };
    }

    revalidatePath('/admin/tasks');
    revalidatePath('/display');
    return { success: true, data };
  } catch (error) {
    console.error('Error updating urgent task:', error);
    return { success: false, error: 'Failed to update urgent task' };
  }
}

export async function deleteUrgentTask(id: string) {
  try {
    const { error } = await supabaseAdmin
      .from('urgent_tasks')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting urgent task:', error);
      return { success: false, error: error.message };
    }

    revalidatePath('/admin/tasks');
    revalidatePath('/display');
    return { success: true };
  } catch (error) {
    console.error('Error deleting urgent task:', error);
    return { success: false, error: 'Failed to delete urgent task' };
  }
}

export async function toggleTaskStatus(id: string, currentStatus: string) {
  const statusFlow = {
    pending: 'in_progress',
    in_progress: 'completed',
    completed: 'pending',
  };

  const newStatus = statusFlow[currentStatus as keyof typeof statusFlow] || 'pending';

  return updateUrgentTask(id, { status: newStatus });
}