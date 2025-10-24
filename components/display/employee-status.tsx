'use client';

import { Employee, Attendance } from '@/db/schema';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface EmployeeStatusProps {
  employees: Employee[];
  attendance: Attendance[];
}

const statusColors = {
  present: 'bg-green-500',
  absent: 'bg-red-500',
  late: 'bg-yellow-500',
  leave: 'bg-gray-500',
};

const statusLabels = {
  present: 'Present',
  absent: 'Absent',
  late: 'Late',
  leave: 'On Leave',
};

export function EmployeeStatus({ employees, attendance }: EmployeeStatusProps) {
  const getAttendanceStatus = (employeeId: string) => {
    const today = new Date().toISOString().split('T')[0];
    const record = attendance.find(
      (a) => a.employeeId === employeeId && a.forDate === today
    );
    return record?.status || 'absent';
  };

  const getStatusCounts = () => {
    const today = new Date().toISOString().split('T')[0];
    const counts = {
      present: 0,
      absent: 0,
      late: 0,
      leave: 0,
    };

    employees.forEach((employee) => {
      const status = getAttendanceStatus(employee.id);
      counts[status as keyof typeof counts]++;
    });

    return counts;
  };

  const statusCounts = getStatusCounts();

  return (
    <Card>
      <CardContent className="p-4">
        {/* Status Summary */}
        <div className="flex flex-wrap gap-4 mb-4 justify-center">
          {Object.entries(statusCounts).map(([status, count]) => (
            <div key={status} className="flex items-center gap-2">
              <div
                className={`w-3 h-3 rounded-full ${statusColors[status as keyof typeof statusColors]}`}
              ></div>
              <span className="text-sm font-medium">
                {statusLabels[status as keyof typeof statusLabels]}: {count}
              </span>
            </div>
          ))}
        </div>

        {/* Employee Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
          {employees.map((employee) => {
            const status = getAttendanceStatus(employee.id);

            return (
              <div
                key={employee.id}
                className="flex flex-col items-center space-y-2 p-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="relative">
                  <Avatar className="w-12 h-12">
                    <AvatarImage
                      src={employee.avatarUrl || undefined}
                      alt={employee.name}
                    />
                    <AvatarFallback className="text-xs font-medium">
                      {employee.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .toUpperCase()
                        .slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>

                  {/* Status dot */}
                  <div
                    className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${statusColors[status as keyof typeof statusColors]}`}
                  ></div>
                </div>

                <div className="text-center">
                  <div className="text-xs font-medium text-gray-800 truncate w-16">
                    {employee.name}
                  </div>
                  <Badge
                    variant="secondary"
                    className={`text-xs mt-1 ${
                      statusColors[status as keyof typeof statusColors]
                    } text-white border-none`}
                  >
                    {statusLabels[status as keyof typeof statusLabels]}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>

        {employees.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            <div className="text-4xl mb-2">👥</div>
            <p>No employees registered</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}