'use client';

import { UrgentTask } from '@/db/schema';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Clock, CheckCircle, XCircle } from 'lucide-react';
import { format, formatDistanceToNow, isAfter, addHours } from 'date-fns';

interface UrgentTasksProps {
  urgentTasks: UrgentTask[];
}

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

export function UrgentTasks({ urgentTasks }: UrgentTasksProps) {
  const sortedTasks = urgentTasks.sort((a, b) => {
    // Sort by severity first, then by due date
    const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
    const severityDiff = severityOrder[b.severity as keyof typeof severityOrder] -
                        severityOrder[a.severity as keyof typeof severityOrder];

    if (severityDiff !== 0) return severityDiff;

    return new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime();
  });

  const isOverdue = (dueDate: string) => {
    return isAfter(new Date(), new Date(dueDate));
  };

  const isDueSoon = (dueDate: string) => {
    const now = new Date();
    const due = new Date(dueDate);
    const twoHoursFromNow = addHours(now, 2);
    return isAfter(twoHoursFromNow, due) && !isOverdue(dueDate);
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          Urgent Tasks
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 max-h-[600px] overflow-y-auto">
        {sortedTasks.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <div className="text-4xl mb-2">✅</div>
            <p>No urgent tasks</p>
          </div>
        ) : (
          sortedTasks.map((task) => (
            <div
              key={task.id}
              className={`p-3 rounded-lg border-l-4 transition-all hover:shadow-md ${
                severityColors[task.severity as keyof typeof severityColors]
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-sm flex-1 pr-2">
                  {task.title}
                </h3>
                <div className="flex items-center gap-1">
                  {statusIcons[task.status as keyof typeof statusIcons]}
                  <Badge
                    variant="secondary"
                    className="text-xs capitalize"
                  >
                    {task.status.replace('_', ' ')}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={`text-xs capitalize ${
                      severityColors[task.severity as keyof typeof severityColors]
                    }`}
                  >
                    {task.severity}
                  </Badge>
                  <span
                    className={`${
                      isOverdue(task.dueAt)
                        ? 'text-red-600 font-semibold'
                        : isDueSoon(task.dueAt)
                        ? 'text-orange-600 font-semibold'
                        : 'text-gray-600'
                    }`}
                  >
                    Due: {format(new Date(task.dueAt), 'MMM dd, HH:mm')}
                  </span>
                </div>

                <div className="text-gray-500">
                  {formatDistanceToNow(new Date(task.dueAt), {
                    addSuffix: true,
                  })}
                </div>
              </div>

              {/* Overdue indicator */}
              {isOverdue(task.dueAt) && task.status !== 'completed' && (
                <div className="mt-2 flex items-center gap-1 text-xs text-red-600 font-semibold">
                  <AlertTriangle className="w-3 h-3" />
                  OVERDUE
                </div>
              )}

              {/* Due soon indicator */}
              {isDueSoon(task.dueAt) && task.status === 'pending' && (
                <div className="mt-2 flex items-center gap-1 text-xs text-orange-600">
                  <Clock className="w-3 h-3" />
                  Due soon
                </div>
              )}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}