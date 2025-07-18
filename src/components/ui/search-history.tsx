import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Clock, Play, Search, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthContext';

interface SearchHistoryItem {
  id: string;
  query: string;
  learning_level: string;
  created_at: string;
  results_count: number;
  totalDuration: number;
  completedDuration: number;
}

interface SearchHistoryProps {
  onTopicSelect: (topic: string, level: 'beginner' | 'intermediate' | 'advanced') => void;
  onClose?: () => void;
}

export const SearchHistory: React.FC<SearchHistoryProps> = ({ onTopicSelect, onClose }) => {
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchSearchHistory();
    }
  }, [user]);

  const fetchSearchHistory = async () => {
    if (!user) return;

    try {
      // Get search history
      const { data: historyData, error: historyError } = await supabase
        .from('search_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (historyError) throw historyError;

      // Get content tracking for each search topic
      const historyWithDuration = await Promise.all(
        (historyData || []).map(async (item) => {
          const { data: contentData } = await supabase
            .from('content_tracking')
            .select('total_duration, watch_time')
            .eq('user_id', user.id)
            .eq('topic', item.query.toLowerCase());

          const totalDuration = contentData?.reduce((sum, content) => sum + (content.total_duration || 0), 0) || 0;
          const completedDuration = contentData?.reduce((sum, content) => sum + (content.watch_time || 0), 0) || 0;

          return {
            ...item,
            totalDuration,
            completedDuration
          };
        })
      );

      setSearchHistory(historyWithDuration);
    } catch (error) {
      console.error('Error fetching search history:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getProgressPercentage = (completed: number, total: number): number => {
    if (total === 0) return 0;
    return Math.min((completed / total) * 100, 100);
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-blue-100 text-blue-800';
      case 'advanced': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Search History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (searchHistory.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Search History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No search history yet</p>
            <p className="text-sm">Start searching to see your learning journey</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Search History</CardTitle>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {searchHistory.map((item) => (
            <div 
              key={item.id}
              className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => onTopicSelect(item.query, item.learning_level as 'beginner' | 'intermediate' | 'advanced')}
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-medium text-gray-900 capitalize">{item.query}</h3>
                <Badge className={`${getLevelColor(item.learning_level)} text-xs`}>
                  {item.learning_level}
                </Badge>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                <div className="flex items-center gap-1">
                  <Play className="h-3 w-3" />
                  <span>{item.results_count} items</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{formatDuration(item.totalDuration)} total</span>
                </div>
                <span className="text-xs">
                  {new Date(item.created_at).toLocaleDateString()}
                </span>
              </div>

              {item.totalDuration > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>Progress</span>
                    <span>
                      {formatDuration(item.completedDuration)} / {formatDuration(item.totalDuration)}
                    </span>
                  </div>
                  <Progress 
                    value={getProgressPercentage(item.completedDuration, item.totalDuration)} 
                    className="h-2"
                  />
                </div>
              )}

              <Button 
                variant="outline" 
                size="sm" 
                className="w-full mt-3"
                onClick={(e) => {
                  e.stopPropagation();
                  onTopicSelect(item.query, item.learning_level as 'beginner' | 'intermediate' | 'advanced');
                }}
              >
                Search Again
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};