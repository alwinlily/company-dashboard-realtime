'use client';

import { useState, useEffect } from 'react';
import { Todo, Photo } from '@/db/schema';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AspectRatio } from '@/components/ui/aspect-ratio';

interface TodoListWithPhotosProps {
  todos: Todo[];
  photos: Photo[];
}

export function TodoListWithPhotos({ todos, photos }: TodoListWithPhotosProps) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  // Rotate photos every 5 seconds
  useEffect(() => {
    if (photos.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentPhotoIndex((prev) => (prev + 1) % photos.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [photos.length]);

  const completedTodos = todos.filter((todo) => todo.isDone).length;
  const totalTodos = todos.length;
  const completionPercentage = totalTodos > 0 ? Math.round((completedTodos / totalTodos) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* Photo Display */}
      {photos.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <AspectRatio ratio={16 / 9} className="bg-gray-100 rounded-lg overflow-hidden">
              {photos[currentPhotoIndex] ? (
                <div className="relative w-full h-full">
                  <img
                    src={photos[currentPhotoIndex].url}
                    alt={photos[currentPhotoIndex].caption || 'Company photo'}
                    className="w-full h-full object-cover"
                  />
                  {photos[currentPhotoIndex].caption && (
                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-2">
                      <p className="text-sm text-center">
                        {photos[currentPhotoIndex].caption}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <div className="text-4xl mb-2">📷</div>
                    <p className="text-sm">No photo available</p>
                  </div>
                </div>
              )}
            </AspectRatio>

            {/* Photo navigation dots */}
            {photos.length > 1 && (
              <div className="flex justify-center gap-1 mt-2">
                {photos.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentPhotoIndex(index)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentPhotoIndex ? 'bg-blue-500' : 'bg-gray-300'
                    }`}
                    aria-label={`Go to photo ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* To-Do List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              To-Do List
            </CardTitle>
            <Badge variant="secondary" className="text-xs">
              {completedTodos}/{totalTodos} Complete
            </Badge>
          </div>

          {/* Progress Bar */}
          {totalTodos > 0 && (
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${completionPercentage}%` }}
              ></div>
            </div>
          )}
        </CardHeader>

        <CardContent className="space-y-2 max-h-[400px] overflow-y-auto">
          {todos.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <div className="text-4xl mb-2">✅</div>
              <p>No tasks to display</p>
            </div>
          ) : (
            todos.map((todo) => (
              <div
                key={todo.id}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                  todo.isDone
                    ? 'bg-gray-50 border-gray-200'
                    : 'bg-white border-gray-300 hover:shadow-sm'
                }`}
              >
                {/* Checkbox Icon (display only) */}
                <div className="flex-shrink-0">
                  {todo.isDone ? (
                    <div className="w-5 h-5 bg-green-500 rounded flex items-center justify-center">
                      <svg
                        className="w-3 h-3 text-white"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path d="M5 13l4 4L19 7"></path>
                      </svg>
                    </div>
                  ) : (
                    <div className="w-5 h-5 border-2 border-gray-300 rounded"></div>
                  )}
                </div>

                {/* Todo Text */}
                <div className="flex-1">
                  <p
                    className={`text-sm ${
                      todo.isDone
                        ? 'text-gray-500 line-through'
                        : 'text-gray-800'
                    }`}
                  >
                    {todo.title}
                  </p>
                </div>

                {/* Status Badge */}
                <Badge
                  variant={todo.isDone ? 'secondary' : 'outline'}
                  className={`text-xs ${
                    todo.isDone ? 'bg-green-100 text-green-800 border-green-200' : ''
                  }`}
                >
                  {todo.isDone ? 'Done' : 'Pending'}
                </Badge>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}