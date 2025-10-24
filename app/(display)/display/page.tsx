'use client';

import { NewsFeed } from '@/components/display/news-feed';
import { UrgentTasks } from '@/components/display/urgent-tasks';
import { EmployeeStatus } from '@/components/display/employee-status';
import { TodoListWithPhotos } from '@/components/display/todo-list-with-photos';
import { ConnectionStatus } from '@/components/ui/connection-status';
import { useRealtimeData } from '@/hooks/use-realtime-data';
import { supabase } from '@/lib/supabase';
import { NewsItem, UrgentTask, Employee, Todo, Photo, Attendance } from '@/db/schema';

// Fetch functions for each data type
const fetchNewsItems = async (): Promise<NewsItem[]> => {
  const { data, error } = await supabase
    .from('news_items')
    .select('*')
    .order('published_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

const fetchUrgentTasks = async (): Promise<UrgentTask[]> => {
  const { data, error } = await supabase
    .from('urgent_tasks')
    .select('*')
    .order('due_at', { ascending: true });

  if (error) throw error;
  return data || [];
};

const fetchEmployees = async (): Promise<Employee[]> => {
  const { data, error } = await supabase
    .from('employees')
    .select('*')
    .eq('is_active', true)
    .order('name');

  if (error) throw error;
  return data || [];
};

const fetchTodos = async (): Promise<Todo[]> => {
  const { data, error } = await supabase
    .from('todos')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return data || [];
};

const fetchPhotos = async (): Promise<Photo[]> => {
  const { data, error } = await supabase
    .from('photos')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return data || [];
};

const fetchAttendance = async (): Promise<Attendance[]> => {
  const today = new Date().toISOString().split('T')[0];
  const { data, error } = await supabase
    .from('attendance')
    .select('*')
    .eq('for_date', today);

  if (error) throw error;
  return data || [];
};

export default function DisplayPage() {
  // Use the enhanced realtime hook for each data type
  const newsData = useRealtimeData<NewsItem>({
    tableName: 'news_items',
    fetchFn: fetchNewsItems,
    pollInterval: 60000,
    enableRealtime: true,
    enablePolling: true,
  });

  const tasksData = useRealtimeData<UrgentTask>({
    tableName: 'urgent_tasks',
    fetchFn: fetchUrgentTasks,
    pollInterval: 60000,
    enableRealtime: true,
    enablePolling: true,
  });

  const employeesData = useRealtimeData<Employee>({
    tableName: 'employees',
    fetchFn: fetchEmployees,
    pollInterval: 60000,
    enableRealtime: true,
    enablePolling: true,
  });

  const todosData = useRealtimeData<Todo>({
    tableName: 'todos',
    fetchFn: fetchTodos,
    pollInterval: 60000,
    enableRealtime: true,
    enablePolling: true,
  });

  const photosData = useRealtimeData<Photo>({
    tableName: 'photos',
    fetchFn: fetchPhotos,
    pollInterval: 60000,
    enableRealtime: true,
    enablePolling: true,
  });

  const attendanceData = useRealtimeData<Attendance>({
    tableName: 'attendance',
    fetchFn: fetchAttendance,
    pollInterval: 60000,
    enableRealtime: true,
    enablePolling: true,
  });

  const isLoading = newsData.isLoading || tasksData.isLoading || employeesData.isLoading ||
                   todosData.isLoading || photosData.isLoading || attendanceData.isLoading;

  const hasError = newsData.error || tasksData.error || employeesData.error ||
                   todosData.error || photosData.error || attendanceData.error;

  const lastUpdate = [
    newsData.lastUpdate,
    tasksData.lastUpdate,
    employeesData.lastUpdate,
    todosData.lastUpdate,
    photosData.lastUpdate,
    attendanceData.lastUpdate,
  ].filter(Boolean).sort((a, b) => b!.getTime() - a!.getTime())[0];

  if (isLoading && newsData.data.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔄</div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Loading Dashboard</h2>
          <p className="text-gray-500">Fetching latest data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Company Dashboard</h1>
            {lastUpdate && (
              <div className="text-sm text-gray-500 mt-1">
                Last updated: {lastUpdate.toLocaleTimeString()}
              </div>
            )}
          </div>
          <ConnectionStatus showDetails={false} />
        </div>

        {/* Error Display */}
        {hasError && (
          <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span className="text-sm text-yellow-800">
                Some data may not be current. Connection issues detected.
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Three Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column - To-Do List and Photos */}
        <div className="lg:col-span-4 space-y-4">
          <TodoListWithPhotos
            todos={todosData.data}
            photos={photosData.data}
            isLoading={todosData.isLoading || photosData.isLoading}
            error={todosData.error || photosData.error}
          />
        </div>

        {/* Center Column - News Feed */}
        <div className="lg:col-span-4">
          <NewsFeed
            newsItems={newsData.data}
            isLoading={newsData.isLoading}
            error={newsData.error}
          />
        </div>

        {/* Right Column - Urgent Tasks */}
        <div className="lg:col-span-4">
          <UrgentTasks
            urgentTasks={tasksData.data}
            isLoading={tasksData.isLoading}
            error={tasksData.error}
          />
        </div>
      </div>

      {/* Footer - Employee Status Bar */}
      <div className="mt-4">
        <EmployeeStatus
          employees={employeesData.data}
          attendance={attendanceData.data}
          isLoading={employeesData.isLoading || attendanceData.isLoading}
          error={employeesData.error || attendanceData.error}
        />
      </div>
    </div>
  );
}