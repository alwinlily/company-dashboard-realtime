'use server';

import { revalidatePath } from 'next/cache';
import { supabaseAdmin } from '@/lib/supabase';
import { NewEmployee } from '@/db/schema';

export async function getEmployees() {
  const { data, error } = await supabaseAdmin
    .from('employees')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching employees:', error);
    return [];
  }

  return data;
}

export async function createEmployee(item: Omit<NewEmployee, 'id' | 'created_at' | 'updated_at'>) {
  try {
    const { data, error } = await supabaseAdmin
      .from('employees')
      .insert(item)
      .select()
      .single();

    if (error) {
      console.error('Error creating employee:', error);
      return { success: false, error: error.message };
    }

    revalidatePath('/admin/employees');
    revalidatePath('/display');
    return { success: true, data };
  } catch (error) {
    console.error('Error creating employee:', error);
    return { success: false, error: 'Failed to create employee' };
  }
}

export async function updateEmployee(id: string, item: Partial<NewEmployee>) {
  try {
    const { data, error } = await supabaseAdmin
      .from('employees')
      .update({
        ...item,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating employee:', error);
      return { success: false, error: error.message };
    }

    revalidatePath('/admin/employees');
    revalidatePath('/display');
    return { success: true, data };
  } catch (error) {
    console.error('Error updating employee:', error);
    return { success: false, error: 'Failed to update employee' };
  }
}

export async function deleteEmployee(id: string) {
  try {
    const { error } = await supabaseAdmin
      .from('employees')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting employee:', error);
      return { success: false, error: error.message };
    }

    revalidatePath('/admin/employees');
    revalidatePath('/display');
    return { success: true };
  } catch (error) {
    console.error('Error deleting employee:', error);
    return { success: false, error: 'Failed to delete employee' };
  }
}

export async function toggleEmployeeStatus(id: string, currentStatus: boolean) {
  return updateEmployee(id, { is_active: !currentStatus });
}