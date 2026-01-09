import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Heart, Play, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Favorite {
  id: string;
  video_url: string;
  video_title: string | null;
  created_at: string;
}

interface VideoFavoritesProps {
  onSelectVideo: (url: string) => void;
  currentVideoUrl?: string;
}

export function VideoFavorites({ onSelectVideo, currentVideoUrl }: VideoFavoritesProps) {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchFavorites();
    }
  }, [user]);

  useEffect(() => {
    if (currentVideoUrl && favorites.length > 0) {
      setIsFavorited(favorites.some(f => f.video_url === currentVideoUrl));
    } else {
      setIsFavorited(false);
    }
  }, [currentVideoUrl, favorites]);

  const fetchFavorites = async () => {
    const { data } = await supabase
      .from('user_favorites')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false });
    
    if (data) {
      setFavorites(data as Favorite[]);
    }
  };

  const toggleFavorite = async () => {
    if (!currentVideoUrl || !user) return;

    if (isFavorited) {
      // Remove favorite
      const { error } = await supabase
        .from('user_favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('video_url', currentVideoUrl);

      if (!error) {
        setFavorites(prev => prev.filter(f => f.video_url !== currentVideoUrl));
        toast({ title: 'Removed from favorites' });
      }
    } else {
      // Add favorite
      const { error } = await supabase
        .from('user_favorites')
        .insert({
          user_id: user.id,
          video_url: currentVideoUrl,
        });

      if (!error) {
        fetchFavorites();
        toast({ title: 'Added to favorites' });
      }
    }
  };

  const removeFavorite = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    const { error } = await supabase
      .from('user_favorites')
      .delete()
      .eq('id', id);

    if (!error) {
      setFavorites(prev => prev.filter(f => f.id !== id));
      toast({ title: 'Removed from favorites' });
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
    return url.slice(0, 20) + '...';
  };

  return (
    <div className="flex items-center gap-2">
      {currentVideoUrl && (
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleFavorite}
          className={isFavorited ? 'text-red-500 hover:text-red-400' : ''}
        >
          <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
        </Button>
      )}

      <div className="relative">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="gap-2"
        >
          <Heart className="w-4 h-4" />
          Favorites
          {favorites.length > 0 && (
            <span className="ml-1 px-1.5 py-0.5 text-xs bg-primary/20 text-primary rounded-full">
              {favorites.length}
            </span>
          )}
        </Button>

        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)} 
            />
            <div className="absolute right-0 top-full mt-2 w-80 z-50 glass-strong rounded-xl border border-border/50 shadow-elevated overflow-hidden">
              <div className="p-3 border-b border-border/50">
                <h3 className="font-display font-semibold flex items-center gap-2">
                  <Heart className="w-4 h-4 text-primary" />
                  Favorites
                </h3>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {favorites.length === 0 ? (
                  <p className="p-4 text-center text-muted-foreground text-sm">
                    No favorites yet. Click the heart icon to save videos.
                  </p>
                ) : (
                  favorites.map((video) => (
                    <div
                      key={video.id}
                      className="w-full p-3 hover:bg-secondary/50 transition-colors flex items-center gap-3 group"
                    >
                      <button
                        onClick={() => {
                          onSelectVideo(video.video_url);
                          setIsOpen(false);
                        }}
                        className="flex-1 flex items-center gap-3 text-left"
                      >
                        <div className="w-8 h-8 rounded bg-primary/20 flex items-center justify-center shrink-0">
                          <Play className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-mono truncate">
                            {video.video_title || extractVideoId(video.video_url)}
                          </p>
                        </div>
                      </button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                        onClick={(e) => removeFavorite(video.id, e)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
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
