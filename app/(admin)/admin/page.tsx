'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LogoutButton } from '@/components/auth/logout-button';
import { useAuth } from '@/contexts/auth-context';
import {
  Newspaper,
  AlertTriangle,
  Users,
  Image,
  Calendar,
  CheckSquare,
  BarChart3,
  Plus,
  Settings,
} from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  const { appUser } = useAuth();

  const menuItems = [
    {
      title: 'News Management',
      description: 'Add, edit, and manage news items',
      icon: Newspaper,
      href: '/admin/news',
      color: 'text-blue-600',
    },
    {
      title: 'Urgent Tasks',
      description: 'Manage urgent tasks and priorities',
      icon: AlertTriangle,
      href: '/admin/tasks',
      color: 'text-red-600',
    },
    {
      title: 'Employee Management',
      description: 'Manage employee profiles and access',
      icon: Users,
      href: '/admin/employees',
      color: 'text-green-600',
    },
    {
      title: 'Photo Gallery',
      description: 'Upload and manage display photos',
      icon: Image,
      href: '/admin/photos',
      color: 'text-purple-600',
    },
    {
      title: 'Attendance Tracking',
      description: 'Track daily employee attendance',
      icon: Calendar,
      href: '/admin/attendance',
      color: 'text-orange-600',
    },
    {
      title: 'To-Do Management',
      description: 'Manage tasks and to-do items',
      icon: CheckSquare,
      href: '/admin/todos',
      color: 'text-indigo-600',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              {appUser && (
                <Badge variant="secondary" className="ml-4">
                  {appUser.email}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-4">
              <Link href="/display">
                <Button variant="outline" size="sm">
                  View Dashboard
                </Button>
              </Link>
              <LogoutButton />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {appUser?.email?.split('@')[0]}!
          </h2>
          <p className="text-gray-600">
            Manage your company dashboard content and settings from here.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <BarChart3 className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Views</p>
                  <p className="text-2xl font-bold text-gray-900">1,234</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Users</p>
                  <p className="text-2xl font-bold text-gray-900">42</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <CheckSquare className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Tasks Today</p>
                  <p className="text-2xl font-bold text-gray-900">8</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Attendance</p>
                  <p className="text-2xl font-bold text-gray-900">95%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Management Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <Link key={item.href} href={item.href}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-gray-200 hover:border-l-blue-500">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <IconComponent className={`h-8 w-8 ${item.color}`} />
                      <Button size="sm" variant="ghost">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <CardTitle className="text-lg">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-sm">{item.description}</p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Quick Actions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add News Item
              </Button>
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Create Task
              </Button>
              <Button variant="outline">
                <Users className="h-4 w-4 mr-2" />
                Mark Attendance
              </Button>
              <Button variant="outline">
                <Image className="h-4 w-4 mr-2" />
                Upload Photo
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}