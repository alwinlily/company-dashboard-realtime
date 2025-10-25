import { NextRequest, NextResponse } from 'next/server';
import { getUrgentTasks } from '@/lib/actions/tasks';

export async function GET() {
  try {
    const tasks = await getUrgentTasks();
    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}