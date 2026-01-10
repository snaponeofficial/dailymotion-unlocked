import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Play, Loader2, Link as LinkIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { isValidDailymotionInput, extractVideoId } from '@/lib/dailymotion';

interface VideoSearchProps {
  onSelectVideo: (url: string) => void;
}

interface SearchResult {
  id: string;
  title: string;
  thumbnail_url: string;
  duration: number;
  owner: string;
  views_total: number;
}

export function VideoSearch({ onSelectVideo }: VideoSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  // Detect if input is a Dailymotion URL and auto-play
  const checkAndPlayUrl = useCallback((input: string) => {
    const videoId = extractVideoId(input);
    if (videoId) {
      // It's a valid Dailymotion URL - play it immediately
      onSelectVideo(`https://www.dailymotion.com/video/${videoId}`);
      setQuery('');
      setResults([]);
      setIsOpen(false);
      toast({
        title: 'Playing video',
        description: 'Video loaded successfully!',
      });
      return true;
    }
    return false;
  }, [onSelectVideo, toast]);

  // Handle paste event
  const handlePaste = useCallback((e: React.ClipboardEvent<HTMLInputElement>) => {
    const pastedText = e.clipboardData.getData('text');
    
    // Check if pasted content is a Dailymotion URL
    if (isValidDailymotionInput(pastedText)) {
      e.preventDefault(); // Prevent the paste from going into input
      checkAndPlayUrl(pastedText);
    }
  }, [checkAndPlayUrl]);

  // Handle input change - check for URL paste via other means
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    
    // Close search results when typing new query
    if (results.length > 0 && !isValidDailymotionInput(value)) {
      // Keep results open only if user is browsing
    }
  };

  const searchVideos = async () => {
    if (!query.trim()) return;
    
    // First check if it's a URL - if so, play it instead of searching
    if (checkAndPlayUrl(query)) {
      return;
    }
    
    setLoading(true);
    setIsOpen(true);
    
    try {
      // Use Dailymotion's public API for search
      const response = await fetch(
        `https://api.dailymotion.com/videos?search=${encodeURIComponent(query)}&fields=id,title,thumbnail_url,duration,owner.screenname,views_total&limit=10`
      );
      
      if (!response.ok) throw new Error('Search failed');
      
      const data = await response.json();
      setResults(data.list.map((v: any) => ({
        id: v.id,
        title: v.title,
        thumbnail_url: v.thumbnail_url,
        duration: v.duration,
        owner: v['owner.screenname'],
        views_total: v.views_total,
      })));
    } catch (error) {
      toast({
        title: 'Search Error',
        description: 'Could not search videos. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatViews = (views: number) => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views.toString();
  };

  const handleSelect = (videoId: string) => {
    onSelectVideo(`https://www.dailymotion.com/video/${videoId}`);
    setIsOpen(false);
    setQuery('');
    setResults([]);
  };

  // Check if current query looks like a URL
  const isUrlInput = isValidDailymotionInput(query);

  return (
    <div className="relative">
      <div className="flex gap-2">
        <div className="relative flex-1">
          {isUrlInput ? (
            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
          ) : (
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          )}
          <Input
            placeholder="Search videos or paste Dailymotion URL..."
            value={query}
            onChange={handleInputChange}
            onPaste={handlePaste}
            onKeyDown={(e) => e.key === 'Enter' && searchVideos()}
            onFocus={() => results.length > 0 && setIsOpen(true)}
            className={`pl-10 bg-secondary/50 border-border/50 ${isUrlInput ? 'border-primary/50 ring-1 ring-primary/20' : ''}`}
          />
        </div>
        <Button 
          onClick={searchVideos} 
          disabled={loading} 
          variant={isUrlInput ? "default" : "secondary"}
          className={isUrlInput ? "bg-primary hover:bg-primary/90" : ""}
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : isUrlInput ? (
            <Play className="w-4 h-4" />
          ) : (
            <Search className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* URL detected hint */}
      {isUrlInput && query && (
        <p className="text-xs text-primary mt-2 flex items-center gap-1">
          <LinkIcon className="w-3 h-3" />
          Dailymotion URL detected - press Enter or click Play to watch
        </p>
      )}

      {isOpen && results.length > 0 && (
        <>
          <div className="fixed inset-0 z-[60]" onClick={() => setIsOpen(false)} />
          <div className="absolute left-0 right-0 top-full mt-2 z-[70] bg-background/95 backdrop-blur-xl rounded-xl border border-border shadow-2xl overflow-hidden max-h-[50vh] overflow-y-auto">
            {results.map((video) => (
              <button
                key={video.id}
                onClick={() => handleSelect(video.id)}
                className="w-full p-3 hover:bg-secondary/80 transition-colors flex gap-3 text-left border-b border-border/30 last:border-0"
              >
                <div className="relative shrink-0">
                  <img
                    src={video.thumbnail_url}
                    alt={video.title}
                    className="w-24 h-16 sm:w-32 sm:h-20 object-cover rounded-lg"
                  />
                  <span className="absolute bottom-1 right-1 px-1 py-0.5 text-xs bg-black/80 text-white rounded">
                    {formatDuration(video.duration)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm line-clamp-2 mb-1">{video.title}</h4>
                  <p className="text-xs text-muted-foreground">
                    {video.owner} • {formatViews(video.views_total)} views
                  </p>
                </div>
                <div className="shrink-0 self-center">
                  <Play className="w-5 h-5 text-primary" />
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
