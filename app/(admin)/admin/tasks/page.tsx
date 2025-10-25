'use client';

import { useState, useEffect } from 'react';
import { UrgentTask } from '@/db/schema';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import {
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  Plus,
  Edit,
  Trash2,
  Loader2,
} from 'lucide-react';
import {
  createUrgentTask,
  updateUrgentTask,
  deleteUrgentTask,
  toggleTaskStatus,
} from '@/lib/actions/tasks';
import { toast } from 'sonner';

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  due_at: z.string().min(1, 'Due date is required'),
});

type TaskFormData = z.infer<typeof taskSchema>;

const severityColors = {
  low: 'bg-green-100 text-green-800 border-green-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  high: 'bg-orange-100 text-orange-800 border-orange-200',
  critical: 'bg-red-100 text-red-800 border-red-200',
};

const statusIcons = {
  pending: <Clock className="w-4 h-4 text-gray-500" />,
  in_progress: <AlertTriangle className="w-4 h-4 text-blue-500" />,
  completed: <CheckCircle className="w-4 h-4 text-green-500" />,
  cancelled: <XCircle className="w-4 h-4 text-gray-400" />,
};

export default function TasksManagement() {
  const [tasks, setTasks] = useState<UrgentTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<UrgentTask | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: '',
      severity: 'medium',
      due_at: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    },
  });

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/tasks');
      if (!response.ok) throw new Error('Failed to fetch tasks');
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast.error('Failed to fetch urgent tasks');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: TaskFormData) => {
    setIsSubmitting(true);
    try {
      let result;
      if (editingTask) {
        result = await updateUrgentTask(editingTask.id, data);
      } else {
        result = await createUrgentTask(data);
      }

      if (result.success) {
        toast.success(`Task ${editingTask ? 'updated' : 'created'} successfully`);
        setIsDialogOpen(false);
        setEditingTask(null);
        form.reset();
        fetchTasks();
      } else {
        toast.error(result.error || 'Failed to save task');
      }
    } catch (error) {
      console.error('Error saving task:', error);
      toast.error('Failed to save task');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (task: UrgentTask) => {
    setEditingTask(task);
    form.reset({
      title: task.title,
      severity: task.severity,
      due_at: format(new Date(task.dueAt), "yyyy-MM-dd'T'HH:mm"),
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const result = await deleteUrgentTask(id);
      if (result.success) {
        toast.success('Task deleted successfully');
        fetchTasks();
      } else {
        toast.error(result.error || 'Failed to delete task');
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
    }
  };

  const handleStatusToggle = async (task: UrgentTask) => {
    try {
      const result = await toggleTaskStatus(task.id, task.status);
      if (result.success) {
        fetchTasks();
      } else {
        toast.error('Failed to update task status');
      }
    } catch (error) {
      console.error('Error toggling task status:', error);
      toast.error('Failed to update task status');
    }
  };

  const openCreateDialog = () => {
    setEditingTask(null);
    form.reset({
      title: '',
      severity: 'medium',
      due_at: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    });
    setIsDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      {/* Main Content - Full Width without Header Section */}
      <div className="flex flex-col h-screen overflow-hidden">
        {/* Task Grid */}
        <div className="flex-1 overflow-hidden p-6">
          <div className="h-full grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
            {tasks
              .sort((a, b) => {
                const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
                const severityDiff =
                  severityOrder[b.severity as keyof typeof severityOrder] -
                  severityOrder[a.severity as keyof typeof severityOrder];
                if (severityDiff !== 0) return severityDiff;
                return new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime();
              })
              .map((task) => (
                <Card key={task.id} className="bg-gray-800 border-gray-700 h-fit flex flex-col">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {statusIcons[task.status as keyof typeof statusIcons]}
                        <CardTitle className="text-base text-gray-100 line-clamp-2">
                          {task.title}
                        </CardTitle>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(task)}
                          className="text-gray-400 hover:text-white hover:bg-gray-700"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-gray-400 hover:text-red-400 hover:bg-gray-700"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-gray-800 border-gray-700">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="text-gray-100">
                                Delete Task
                              </AlertDialogTitle>
                              <AlertDialogDescription className="text-gray-400">
                                Are you sure you want to delete "{task.title}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="bg-gray-700 text-gray-300 hover:bg-gray-600">
                                Cancel
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(task.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 flex-1 flex flex-col">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={`text-xs capitalize ${severityColors[task.severity as keyof typeof severityColors]}`}
                      >
                        {task.severity}
                      </Badge>
                      <Badge
                        variant="secondary"
                        className="text-xs capitalize bg-gray-700 text-gray-300"
                      >
                        {task.status.replace('_', ' ')}
                      </Badge>
                    </div>

                    <div className="text-sm text-gray-400">
                      Due: {format(new Date(task.dueAt), 'MMM dd, yyyy HH:mm')}
                    </div>

                    <div className="mt-auto">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStatusToggle(task)}
                        className="w-full bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600"
                      >
                        {task.status === 'pending' && 'Start Task'}
                        {task.status === 'in_progress' && 'Complete Task'}
                        {task.status === 'completed' && 'Reopen Task'}
                        {task.status === 'cancelled' && 'Reopen Task'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>

        {/* Floating Action Button */}
        <div className="fixed bottom-6 right-6">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={openCreateDialog}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg"
              >
                <Plus className="h-6 w-6" />
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-800 border-gray-700 text-gray-100">
              <DialogHeader>
                <DialogTitle className="text-gray-100">
                  {editingTask ? 'Edit Task' : 'Create Task'}
                </DialogTitle>
                <DialogDescription className="text-gray-400">
                  {editingTask
                    ? 'Update the task details.'
                    : 'Create a new urgent task.'}
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-200">Title</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter task title"
                            {...field}
                            className="bg-gray-700 border-gray-600 text-gray-100"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="severity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-200">Severity</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-gray-700 border-gray-600 text-gray-100">
                              <SelectValue placeholder="Select severity" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-gray-700 border-gray-600">
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="critical">Critical</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="due_at"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-200">Due Date</FormLabel>
                        <FormControl>
                          <Input
                            type="datetime-local"
                            {...field}
                            className="bg-gray-700 border-gray-600 text-gray-100"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                      className="bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600"
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      {editingTask ? 'Update' : 'Create'}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Empty State */}
        {tasks.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-6xl mb-4">✅</div>
              <h3 className="text-xl font-semibold text-gray-300 mb-2">
                No urgent tasks
              </h3>
              <p className="text-gray-500 mb-6">
                All caught up! No urgent tasks to manage.
              </p>
              <Button onClick={openCreateDialog} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Create Task
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}