'use server';

import { revalidatePath } from 'next/cache';
import { supabaseAdmin } from '@/lib/supabase';
import { NewTodo } from '@/db/schema';

export async function getTodos() {
  const { data, error } = await supabaseAdmin
    .from('todos')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('Error fetching todos:', error);
    return [];
  }

  return data;
}

export async function createTodo(item: Omit<NewTodo, 'id' | 'created_at' | 'updated_at'>) {
  try {
    // Get the highest sort_order to add new item at the end
    const { data: existingTodos } = await supabaseAdmin
      .from('todos')
      .select('sort_order')
      .order('sort_order', { ascending: false })
      .limit(1);

    const nextSortOrder = existingTodos && existingTodos.length > 0
      ? existingTodos[0].sort_order + 1
      : 0;

    const { data, error } = await supabaseAdmin
      .from('todos')
      .insert({
        ...item,
        sort_order: item.sort_order ?? nextSortOrder,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating todo:', error);
      return { success: false, error: error.message };
    }

    revalidatePath('/admin/todos');
    revalidatePath('/display');
    return { success: true, data };
  } catch (error) {
    console.error('Error creating todo:', error);
    return { success: false, error: 'Failed to create todo' };
  }
}

export async function updateTodo(id: string, item: Partial<NewTodo>) {
  try {
    const { data, error } = await supabaseAdmin
      .from('todos')
      .update({
        ...item,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating todo:', error);
      return { success: false, error: error.message };
    }

    revalidatePath('/admin/todos');
    revalidatePath('/display');
    return { success: true, data };
  } catch (error) {
    console.error('Error updating todo:', error);
    return { success: false, error: 'Failed to update todo' };
  }
}

export async function deleteTodo(id: string) {
  try {
    const { error } = await supabaseAdmin
      .from('todos')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting todo:', error);
      return { success: false, error: error.message };
    }

    revalidatePath('/admin/todos');
    revalidatePath('/display');
    return { success: true };
  } catch (error) {
    console.error('Error deleting todo:', error);
    return { success: false, error: 'Failed to delete todo' };
  }
}

export async function toggleTodoStatus(id: string, currentStatus: boolean) {
  return updateTodo(id, { is_done: !currentStatus });
}

export async function reorderTodos(todos: { id: string; sort_order: number }[]) {
  try {
    const updates = todos.map(({ id, sort_order }) =>
      supabaseAdmin
        .from('todos')
        .update({ sort_order, updated_at: new Date().toISOString() })
        .eq('id', id)
    );

    await Promise.all(updates);

    revalidatePath('/admin/todos');
    revalidatePath('/display');
    return { success: true };
  } catch (error) {
    console.error('Error reordering todos:', error);
    return { success: false, error: 'Failed to reorder todos' };
  }
}