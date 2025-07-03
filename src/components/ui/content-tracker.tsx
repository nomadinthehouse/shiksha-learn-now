import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, Clock, CheckCircle, ChevronDown, ChevronUp, Video } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthContext';
import { useCustomToast } from '@/hooks/use-toast-custom';

interface ContentItem {
  url: string;
  title: string;
  content_type: string;
  duration?: string;
}

interface ContentTrackerProps {
  topic: string;
  items: ContentItem[];
}

interface TrackingData {
  id: string;
  content_url: string;
  watch_time: number;
  total_duration: number;
  completion_percentage: number;
  is_completed: boolean;
  last_watched_at: string;
}

export const ContentTracker: React.FC<ContentTrackerProps> = ({ topic, items }) => {
  const { user } = useAuth();
  const { showError } = useCustomToast();
  const [isOpen, setIsOpen] = useState(false);
  const [trackingData, setTrackingData] = useState<Record<string, TrackingData>>({});
  const [currentlyWatching, setCurrentlyWatching] = useState<string | null>(null);
  const [watchStartTime, setWatchStartTime] = useState<number | null>(null);

  const videoItems = items.filter(item => item.content_type === 'video');

  useEffect(() => {
    if (user && videoItems.length > 0) {
      fetchTrackingData();
    }
  }, [user, videoItems.length]);

  const fetchTrackingData = async () => {
    if (!user) return;

    try {
      const urls = videoItems.map(item => item.url);
      const { data, error } = await supabase
        .from('content_tracking')
        .select('*')
        .eq('user_id', user.id)
        .in('content_url', urls);

      if (error) throw error;

      const trackingMap: Record<string, TrackingData> = {};
      data?.forEach(item => {
        trackingMap[item.content_url] = item;
      });
      setTrackingData(trackingMap);
    } catch (error) {
      console.error('Error fetching tracking data:', error);
    }
  };

  const parseDuration = (duration: string): number => {
    if (!duration) return 0;
    
    // Handle different duration formats (HH:MM:SS, MM:SS, or just seconds)
    const parts = duration.split(':').map(Number);
    if (parts.length === 3) {
      return parts[0] * 3600 + parts[1] * 60 + parts[2];
    } else if (parts.length === 2) {
      return parts[0] * 60 + parts[1];
    } else {
      return parts[0] || 0;
    }
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const startWatching = (url: string) => {
    setCurrentlyWatching(url);
    setWatchStartTime(Date.now());
  };

  const stopWatching = async (url: string) => {
    if (!user || !watchStartTime) return;

    const watchedSeconds = Math.floor((Date.now() - watchStartTime) / 1000);
    const item = videoItems.find(item => item.url === url);
    if (!item) return;

    const totalDuration = parseDuration(item.duration || '0');
    const existingData = trackingData[url];
    const newWatchTime = (existingData?.watch_time || 0) + watchedSeconds;
    const completionPercentage = totalDuration > 0 ? Math.min(Math.round((newWatchTime / totalDuration) * 100), 100) : 0;

    try {
      const { data, error } = await supabase
        .from('content_tracking')
        .upsert({
          user_id: user.id,
          content_url: url,
          content_type: item.content_type,
          topic: topic,
          watch_time: newWatchTime,
          total_duration: totalDuration,
          completion_percentage: completionPercentage,
          is_completed: completionPercentage >= 90,
          last_watched_at: new Date().toISOString()
        }, { 
          onConflict: 'user_id,content_url' 
        })
        .select()
        .single();

      if (error) throw error;

      setTrackingData(prev => ({
        ...prev,
        [url]: data
      }));
    } catch (error) {
      console.error('Error updating tracking data:', error);
      showError('Failed to update watch progress');
    }

    setCurrentlyWatching(null);
    setWatchStartTime(null);
  };

  const getTotalStats = () => {
    const totalVideos = videoItems.length;
    const completedVideos = Object.values(trackingData).filter(data => data.is_completed).length;
    const totalWatchTime = Object.values(trackingData).reduce((acc, data) => acc + data.watch_time, 0);
    const totalDuration = videoItems.reduce((acc, item) => acc + parseDuration(item.duration || '0'), 0);

    return {
      totalVideos,
      completedVideos,
      totalWatchTime,
      totalDuration,
      overallProgress: totalVideos > 0 ? Math.round((completedVideos / totalVideos) * 100) : 0
    };
  };

  const stats = getTotalStats();

  if (videoItems.length === 0) return null;

  return (
    <Card className="mt-4">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5" />
                Video Progress ({stats.completedVideos}/{stats.totalVideos})
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  {stats.overallProgress}% Complete
                </Badge>
                {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </div>
            </div>
            <Progress value={stats.overallProgress} className="mt-2" />
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div className="text-sm">
                <span className="text-muted-foreground">Watch Time:</span>
                <span className="ml-1 font-medium">{formatDuration(stats.totalWatchTime)}</span>
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">Total Duration:</span>
                <span className="ml-1 font-medium">{formatDuration(stats.totalDuration)}</span>
              </div>
            </div>

            <div className="space-y-3">
              {videoItems.map((item) => {
                const tracking = trackingData[item.url];
                const isWatching = currentlyWatching === item.url;
                const progress = tracking?.completion_percentage || 0;
                const isCompleted = tracking?.is_completed || false;

                return (
                  <div key={item.url} className="border rounded-lg p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">{item.title}</h4>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{item.duration || 'Unknown'}</span>
                          </div>
                          {tracking && (
                            <div className="flex items-center gap-1">
                              <span>Watched: {formatDuration(tracking.watch_time)}</span>
                            </div>
                          )}
                          {isCompleted && (
                            <div className="flex items-center gap-1 text-green-600">
                              <CheckCircle className="h-3 w-3" />
                              <span>Completed</span>
                            </div>
                          )}
                        </div>
                        <div className="mt-2">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span>Progress</span>
                            <span>{progress}%</span>
                          </div>
                          <Progress value={progress} className="h-1" />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant={isWatching ? "secondary" : "default"}
                          onClick={() => {
                            if (isWatching) {
                              stopWatching(item.url);
                            } else {
                              startWatching(item.url);
                              window.open(item.url, '_blank');
                            }
                          }}
                          className="h-8"
                        >
                          {isWatching ? (
                            <>
                              <Pause className="h-3 w-3 mr-1" />
                              Stop
                            </>
                          ) : (
                            <>
                              <Play className="h-3 w-3 mr-1" />
                              {tracking ? 'Continue' : 'Start'}
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};