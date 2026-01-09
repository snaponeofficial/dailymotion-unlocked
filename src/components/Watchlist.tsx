import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ListPlus, Play, Trash2, Check, Search, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface WatchlistItem {
  id: string;
  video_url: string;
  video_id: string | null;
  title: string | null;
  added_at: string;
  watched: boolean;
}

interface WatchlistProps {
  onSelectVideo: (url: string) => void;
  currentVideoUrl?: string;
}

export function Watchlist({ onSelectVideo, currentVideoUrl }: WatchlistProps) {
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user && isOpen) {
      fetchWatchlist();
    }
  }, [user, isOpen]);

  const fetchWatchlist = async () => {
    const { data } = await supabase
      .from('user_watchlist')
      .select('*')
      .eq('user_id', user?.id)
      .order('added_at', { ascending: false });
    
    if (data) {
      setItems(data as WatchlistItem[]);
    }
  };

  const addToWatchlist = async () => {
    if (!currentVideoUrl || !user) return;

    const videoId = extractVideoId(currentVideoUrl);
    
    const { error } = await supabase
      .from('user_watchlist')
      .insert({
        user_id: user.id,
        video_url: currentVideoUrl,
        video_id: videoId,
      });

    if (error?.code === '23505') {
      toast({ title: 'Already in watchlist' });
    } else if (!error) {
      toast({ title: 'Added to watchlist' });
      fetchWatchlist();
    }
  };

  const removeFromWatchlist = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    await supabase.from('user_watchlist').delete().eq('id', id);
    setItems(prev => prev.filter(i => i.id !== id));
    toast({ title: 'Removed from watchlist' });
  };

  const markAsWatched = async (id: string, watched: boolean, e: React.MouseEvent) => {
    e.stopPropagation();
    
    await supabase
      .from('user_watchlist')
      .update({ watched: !watched })
      .eq('id', id);
    
    setItems(prev => prev.map(i => 
      i.id === id ? { ...i, watched: !watched } : i
    ));
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

  const isInWatchlist = items.some(i => i.video_url === currentVideoUrl);

  const filteredItems = items.filter(i => 
    i.video_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.video_url.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex items-center gap-2">
      {currentVideoUrl && !isInWatchlist && (
        <Button variant="ghost" size="sm" onClick={addToWatchlist} className="gap-2">
          <ListPlus className="w-4 h-4" />
          <span className="hidden sm:inline">Add to List</span>
        </Button>
      )}

      <div className="relative">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="gap-2"
        >
          <ListPlus className="w-4 h-4" />
          My List
          {items.length > 0 && (
            <span className="px-1.5 py-0.5 text-xs bg-primary/20 text-primary rounded-full">
              {items.length}
            </span>
          )}
        </Button>

        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 z-50 glass-strong rounded-xl border border-border/50 shadow-elevated overflow-hidden">
              <div className="p-3 border-b border-border/50">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-display font-semibold flex items-center gap-2">
                    <ListPlus className="w-4 h-4 text-primary" />
                    My Watchlist
                  </h3>
                  <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-secondary/50 rounded">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                {items.length > 3 && (
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search watchlist..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8 h-8 text-sm bg-secondary/50"
                    />
                  </div>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {filteredItems.length === 0 ? (
                  <p className="p-4 text-center text-muted-foreground text-sm">
                    {items.length === 0 
                      ? 'Your watchlist is empty. Add videos to watch later.' 
                      : 'No matching videos found.'}
                  </p>
                ) : (
                  filteredItems.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 hover:bg-secondary/50 transition-colors flex items-center gap-3 group"
                    >
                      <button
                        onClick={() => {
                          onSelectVideo(item.video_url);
                          setIsOpen(false);
                        }}
                        className="flex-1 flex items-center gap-3 text-left min-w-0"
                      >
                        <div className={`w-8 h-8 rounded flex items-center justify-center shrink-0 ${item.watched ? 'bg-muted' : 'bg-primary/20'}`}>
                          <Play className={`w-4 h-4 ${item.watched ? 'text-muted-foreground' : 'text-primary'}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-mono truncate ${item.watched ? 'text-muted-foreground line-through' : ''}`}>
                            {item.title || item.video_id || extractVideoId(item.video_url)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Added {new Date(item.added_at).toLocaleDateString()}
                          </p>
                        </div>
                      </button>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={(e) => markAsWatched(item.id, item.watched, e)}
                        >
                          <Check className={`w-3 h-3 ${item.watched ? 'text-primary' : ''}`} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={(e) => removeFromWatchlist(item.id, e)}
                        >
                          <Trash2 className="w-3 h-3 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
