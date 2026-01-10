import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Play, Clock, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VideoView {
  id: string;
  video_url: string;
  video_id: string | null;
  video_title: string | null;
  thumbnail_url: string | null;
  watched_at: string;
  progress_seconds: number | null;
  duration_seconds: number | null;
}

interface ContinueWatchingProps {
  onSelectVideo: (url: string) => void;
}

export function ContinueWatching({ onSelectVideo }: ContinueWatchingProps) {
  const [videos, setVideos] = useState<VideoView[]>([]);
  const [showAll, setShowAll] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchRecentVideos();
    }
  }, [user]);

  const fetchRecentVideos = async () => {
    const { data } = await supabase
      .from('video_views')
      .select('*')
      .eq('user_id', user?.id)
      .order('watched_at', { ascending: false })
      .limit(20);
    
    if (data) {
      // Remove duplicates, keep most recent
      const uniqueVideos = data.reduce<VideoView[]>((acc, video) => {
        if (!acc.find(v => v.video_url === video.video_url)) {
          acc.push(video as VideoView);
        }
        return acc;
      }, []);
      setVideos(uniqueVideos.slice(0, 10));
    }
  };

  const formatTime = (date: string) => {
    const now = new Date();
    const watched = new Date(date);
    const diffMs = now.getTime() - watched.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return watched.toLocaleDateString();
  };

  const extractVideoId = (url: string) => {
    const patterns = [
      /dailymotion\.com\/video\/([a-zA-Z0-9]+)/,
      /dai\.ly\/([a-zA-Z0-9]+)/,
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return url.slice(0, 15);
  };

  if (videos.length === 0) {
    return null;
  }

  const displayedVideos = showAll ? videos : videos.slice(0, 4);

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-lg sm:text-xl font-semibold flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          Continue Watching
        </h2>
        {videos.length > 4 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAll(!showAll)}
            className="text-muted-foreground hover:text-foreground"
          >
            {showAll ? 'Show Less' : 'See All'}
            <ChevronRight className={`w-4 h-4 ml-1 transition-transform ${showAll ? 'rotate-90' : ''}`} />
          </Button>
        )}
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
        {displayedVideos.map((video) => (
          <button
            key={video.id}
            onClick={() => onSelectVideo(video.video_url)}
            className="group relative glass rounded-xl overflow-hidden hover:ring-2 ring-primary/50 transition-all aspect-video"
          >
            {/* Thumbnail */}
            {video.thumbnail_url ? (
              <img
                src={video.thumbnail_url}
                alt={video.video_title || 'Video thumbnail'}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                <Play className="w-8 h-8 text-primary" />
              </div>
            )}
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
              <div className="text-left w-full">
                <p className="text-white text-sm font-medium truncate">
                  {video.video_title || video.video_id || extractVideoId(video.video_url)}
                </p>
                <p className="text-white/70 text-xs flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatTime(video.watched_at)}
                </p>
              </div>
            </div>

            {/* Play button */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-primary/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all transform scale-75 group-hover:scale-100">
                <Play className="w-5 h-5 text-primary-foreground ml-0.5" />
              </div>
            </div>

            {/* Time badge */}
            <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-black/70 text-white text-xs">
              {formatTime(video.watched_at)}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
