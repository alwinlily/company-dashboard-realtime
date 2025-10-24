'use server';

import { revalidatePath } from 'next/cache';
import { supabaseAdmin } from '@/lib/supabase';
import { NewNewsItem } from '@/db/schema';

export async function getNewsItems() {
  const { data, error } = await supabaseAdmin
    .from('news_items')
    .select('*')
    .order('published_at', { ascending: false });

  if (error) {
    console.error('Error fetching news items:', error);
    return [];
  }

  return data;
}

export async function createNewsItem(item: Omit<NewNewsItem, 'id' | 'created_at' | 'updated_at'>) {
  try {
    const { data, error } = await supabaseAdmin
      .from('news_items')
      .insert({
        ...item,
        published_at: item.published_at || new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating news item:', error);
      return { success: false, error: error.message };
    }

    revalidatePath('/admin/news');
    revalidatePath('/display');
    return { success: true, data };
  } catch (error) {
    console.error('Error creating news item:', error);
    return { success: false, error: 'Failed to create news item' };
  }
}

export async function updateNewsItem(id: string, item: Partial<NewNewsItem>) {
  try {
    const { data, error } = await supabaseAdmin
      .from('news_items')
      .update({
        ...item,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating news item:', error);
      return { success: false, error: error.message };
    }

    revalidatePath('/admin/news');
    revalidatePath('/display');
    return { success: true, data };
  } catch (error) {
    console.error('Error updating news item:', error);
    return { success: false, error: 'Failed to update news item' };
  }
}

export async function deleteNewsItem(id: string) {
  try {
    const { error } = await supabaseAdmin
      .from('news_items')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting news item:', error);
      return { success: false, error: error.message };
    }

    revalidatePath('/admin/news');
    revalidatePath('/display');
    return { success: true };
  } catch (error) {
    console.error('Error deleting news item:', error);
    return { success: false, error: 'Failed to delete news item' };
  }
}