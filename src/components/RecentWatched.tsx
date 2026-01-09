import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { History, Play, Clock, X, Trash2 } from 'lucide-react';

interface VideoView {
  id: string;
  video_url: string;
  video_id: string | null;
  video_title: string | null;
  thumbnail_url: string | null;
  watched_at: string;
}

interface RecentWatchedProps {
  onSelectVideo: (url: string) => void;
}

export function RecentWatched({ onSelectVideo }: RecentWatchedProps) {
  const [history, setHistory] = useState<VideoView[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user && isOpen) {
      fetchHistory();
    }
  }, [user, isOpen]);

  const fetchHistory = async () => {
    const { data } = await supabase
      .from('video_views')
      .select('*')
      .eq('user_id', user?.id)
      .order('watched_at', { ascending: false })
      .limit(30);
    
    if (data) {
      // Remove duplicates, keep most recent
      const uniqueVideos = data.reduce<VideoView[]>((acc, video) => {
        if (!acc.find(v => v.video_url === video.video_url)) {
          acc.push(video as VideoView);
        }
        return acc;
      }, []);
      setHistory(uniqueVideos.slice(0, 20));
    }
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

  const clearHistory = async () => {
    if (!user) return;
    await supabase.from('video_views').delete().eq('user_id', user.id);
    setHistory([]);
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="gap-2"
      >
        <History className="w-4 h-4" />
        <span className="hidden sm:inline">History</span>
      </Button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 z-50 glass-strong rounded-xl border border-border/50 shadow-elevated overflow-hidden">
            <div className="p-3 border-b border-border/50 flex items-center justify-between">
              <h3 className="font-display font-semibold flex items-center gap-2">
                <History className="w-4 h-4 text-primary" />
                Recently Watched
              </h3>
              <div className="flex items-center gap-1">
                {history.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearHistory}
                    className="text-xs h-7 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="w-3 h-3 mr-1" />
                    Clear
                  </Button>
                )}
                <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-secondary/50 rounded">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {history.length === 0 ? (
                <p className="p-4 text-center text-muted-foreground text-sm">
                  No watch history yet. Start watching to see your history here.
                </p>
              ) : (
                history.map((video) => (
                  <button
                    key={video.id}
                    onClick={() => {
                      onSelectVideo(video.video_url);
                      setIsOpen(false);
                    }}
                    className="w-full p-3 text-left hover:bg-secondary/50 transition-colors flex items-center gap-3"
                  >
                    <div className="w-8 h-8 rounded bg-primary/20 flex items-center justify-center shrink-0">
                      <Play className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-mono truncate">
                        {video.video_title || video.video_id || extractVideoId(video.video_url)}
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTime(video.watched_at)}
                      </p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
