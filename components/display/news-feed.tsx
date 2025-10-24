'use client';

import { NewsItem } from '@/db/schema';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface NewsFeedProps {
  newsItems: NewsItem[];
}

export function NewsFeed({ newsItems }: NewsFeedProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          News Feed
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 max-h-[600px] overflow-y-auto">
        {newsItems.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <div className="text-4xl mb-2">📰</div>
            <p>No news items available</p>
          </div>
        ) : (
          newsItems.map((item) => (
            <div
              key={item.id}
              className="border-l-4 border-blue-200 pl-4 py-2 hover:bg-gray-50 transition-colors"
            >
              <h3 className="font-semibold text-gray-800 mb-1 line-clamp-2">
                {item.title}
              </h3>
              {item.summary && (
                <p className="text-sm text-gray-600 mb-2 line-clamp-3">
                  {item.summary}
                </p>
              )}
              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {item.source}
                  </Badge>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDistanceToNow(new Date(item.publishedAt), {
                      addSuffix: true,
                    })}
                  </div>
                </div>
                {item.url && (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-blue-500 hover:text-blue-700"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}