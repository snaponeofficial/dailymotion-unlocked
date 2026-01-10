import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Play, Maximize2, Minimize2, LogOut, User, Crown, Tv } from "lucide-react";
import { parseVideoUrl, isValidDailymotionInput } from "@/lib/dailymotion";
import { useAuth } from "@/hooks/useAuth";
import { signOut } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { RecentWatched } from "@/components/RecentWatched";
import { VideoFavorites } from "@/components/VideoFavorites";
import { Watchlist } from "@/components/Watchlist";
import { VideoSearch } from "@/components/VideoSearch";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function Watch() {
  const [videoUrl, setVideoUrl] = useState("");
  const [embedUrl, setEmbedUrl] = useState("");
  const [isTvMode, setIsTvMode] = useState(false);
  const { user, hasActiveSubscription, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!loading && user && !hasActiveSubscription && !isAdmin) {
      toast({
        title: "Payment Required",
        description: "Please complete your payment to access the player.",
        variant: "destructive",
      });
      navigate("/payment");
    }
  }, [user, hasActiveSubscription, isAdmin, loading, navigate, toast]);

  const handleWatch = async (url?: string) => {
    const urlToUse = url || videoUrl;
    
    if (!isValidDailymotionInput(urlToUse)) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid Dailymotion video URL.",
        variant: "destructive",
      });
      return;
    }

    const video = parseVideoUrl(urlToUse);
    if (video) {
      setVideoUrl(urlToUse);
      setEmbedUrl(video.embedUrl);
      
      if (user) {
        await supabase.from("video_views").insert({
          user_id: user.id,
          video_url: urlToUse,
          video_id: video.videoId,
        });
      }
    }
  };

  const handleSelectVideo = (url: string) => {
    setVideoUrl(url);
    handleWatch(url);
  };

  const toggleFullscreen = () => {
    const iframe = document.getElementById("video-player") as HTMLIFrameElement;
    if (iframe) {
      if (!document.fullscreenElement) {
        iframe.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
    }
  };

  const toggleTvMode = () => {
    setIsTvMode(!isTvMode);
    if (!isTvMode) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // TV Mode - minimal UI, large player
  if (isTvMode) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex flex-col">
        {/* Minimal TV header */}
        <header className="absolute top-0 left-0 right-0 z-10 p-4 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
              <Play className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-white">DailyWatch</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={toggleTvMode} className="text-white hover:bg-white/20">
              <Minimize2 className="w-5 h-5" />
            </Button>
          </div>
        </header>

        {/* Full screen player */}
        {embedUrl ? (
          <iframe
            id="video-player"
            src={embedUrl}
            className="w-full h-full"
            allow="autoplay; fullscreen"
            allowFullScreen
          />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center max-w-lg px-6">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-primary flex items-center justify-center mx-auto mb-6">
                <Play className="w-10 h-10 sm:w-12 sm:h-12 text-primary-foreground" />
              </div>
              <h3 className="font-display text-2xl sm:text-3xl font-semibold text-white mb-4">TV Mode</h3>
              <VideoSearch onSelectVideo={handleSelectVideo} />
            </div>
          </div>
        )}

        {/* Bottom controls */}
        {embedUrl && (
          <div className="absolute bottom-0 left-0 right-0 p-4 flex justify-center gap-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300">
            <div className="w-full max-w-2xl">
              <VideoSearch onSelectVideo={handleSelectVideo} />
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Header */}
      <header className="glass-strong border-b border-border/50 sticky top-0 z-30">
        <div className="container mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-gradient-primary flex items-center justify-center">
              <Play className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-base sm:text-lg hidden sm:inline">DailyWatch</span>
          </Link>

          <div className="flex items-center gap-1 sm:gap-2">
            <RecentWatched onSelectVideo={handleSelectVideo} />
            <VideoFavorites onSelectVideo={handleSelectVideo} currentVideoUrl={videoUrl} />
            <Watchlist onSelectVideo={handleSelectVideo} currentVideoUrl={videoUrl} />
            <Button variant="ghost" size="icon" onClick={toggleTvMode} className="hidden sm:flex">
              <Tv className="w-4 h-4" />
            </Button>
            <ThemeToggle />
            {isAdmin && (
              <Link to="/admin">
                <Button variant="ghost" size="icon">
                  <Crown className="w-4 h-4" />
                </Button>
              </Link>
            )}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/50">
              <User className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground max-w-24 truncate">{user?.email}</span>
            </div>
            <Button variant="ghost" size="icon" onClick={handleSignOut}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-12 max-w-6xl">
        {/* Status badge */}
        <div className="flex items-center gap-2 mb-6 sm:mb-8">
          <div className="px-3 py-1 rounded-full bg-primary/20 text-primary text-sm font-medium">
            ✓ Lifetime Access Active
          </div>
        </div>

        {/* Video search */}
<div
  className="fixed top-6 left-1/2 transform -translate-x-1/2 w-full max-w-2xl glass-strong rounded-2xl p-4 sm:p-6 z-[1]"
>
  <h2 className="font-display text-lg sm:text-xl font-semibold mb-4">
    Search or Paste Video Link
  </h2>
  <VideoSearch onSelectVideo={handleSelectVideo} />
  <p className="text-muted-foreground text-xs sm:text-sm mt-3">
    Or paste a Dailymotion URL directly in the search box
  </p>
</div>


        {/* Video player */}
        {embedUrl ? (
          <div className="glass-strong rounded-2xl p-1 sm:p-2 overflow-hidden">
            <div className="relative aspect-video bg-black rounded-xl overflow-hidden">
              <iframe
                id="video-player"
                src={embedUrl}
                className="w-full h-full"
                allow="autoplay; fullscreen"
                allowFullScreen
              />
              <div className="absolute bottom-4 right-4 flex gap-2">
                <button
                  onClick={toggleTvMode}
                  className="p-2 sm:p-3 rounded-lg bg-black/50 hover:bg-black/70 transition-colors"
                >
                  <Tv className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
                <button
                  onClick={toggleFullscreen}
                  className="p-2 sm:p-3 rounded-lg bg-black/50 hover:bg-black/70 transition-colors"
                >
                  <Maximize2 className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="glass rounded-2xl p-8 sm:p-12 text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-primary flex items-center justify-center mx-auto mb-6">
              <Play className="w-8 h-8 sm:w-10 sm:h-10 text-primary-foreground" />
            </div>
            <h3 className="font-display text-xl sm:text-2xl font-semibold mb-2">Ready to Watch</h3>
            <p className="text-muted-foreground max-w-md mx-auto text-sm sm:text-base">
              Search for videos above or check your history and watchlist to start watching.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
