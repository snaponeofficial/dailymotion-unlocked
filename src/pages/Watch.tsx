import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Play, Maximize2, LogOut, User, Crown } from "lucide-react";
import { parseVideoUrl, isValidDailymotionInput } from "@/lib/dailymotion";
import { useAuth } from "@/hooks/useAuth";
import { signOut } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function Watch() {
  const [videoUrl, setVideoUrl] = useState("");
  const [embedUrl, setEmbedUrl] = useState("");
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

  const handleWatch = async () => {
    if (!isValidDailymotionInput(videoUrl)) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid Dailymotion video URL.",
        variant: "destructive",
      });
      return;
    }

    const video = parseVideoUrl(videoUrl);
    if (video) {
      setEmbedUrl(video.embedUrl);
      
      // Log video view
      if (user) {
        await supabase.from("video_views").insert({
          user_id: user.id,
          video_url: videoUrl,
        });
      }
    }
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

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Header */}
      <header className="glass-strong border-b border-border/50">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-gradient-primary flex items-center justify-center">
              <Play className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-lg">DailyWatch</span>
          </Link>

          <div className="flex items-center gap-4">
            {isAdmin && (
              <Link to="/admin">
                <Button variant="ghost" size="sm">
                  <Crown className="w-4 h-4" />
                  Admin
                </Button>
              </Link>
            )}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/50">
              <User className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{user?.email}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12 max-w-5xl">
        {/* Status badge */}
        <div className="flex items-center gap-2 mb-8">
          <div className="px-3 py-1 rounded-full bg-primary/20 text-primary text-sm font-medium">
            ✓ Lifetime Access Active
          </div>
        </div>

        {/* Video input */}
        <div className="glass-strong rounded-2xl p-6 mb-8">
          <h2 className="font-display text-xl font-semibold mb-4">Paste Dailymotion Video Link</h2>
          <div className="flex gap-4">
            <Input
              placeholder="https://www.dailymotion.com/video/..."
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleWatch()}
              className="flex-1 bg-secondary/50 border-border/50"
            />
            <Button variant="hero" onClick={handleWatch}>
              <Play className="w-4 h-4" />
              Watch Ad-Free
            </Button>
          </div>
          <p className="text-muted-foreground text-sm mt-3">
            Supported formats: dailymotion.com/video/xxx, dai.ly/xxx, or just the video ID
          </p>
        </div>

        {/* Video player */}
        {embedUrl ? (
          <div className="glass-strong rounded-2xl p-2 overflow-hidden">
            <div className="relative aspect-video bg-black rounded-xl overflow-hidden">
              <iframe
                id="video-player"
                src={embedUrl}
                className="w-full h-full"
                allow="autoplay; fullscreen"
                allowFullScreen
              />
              <button
                onClick={toggleFullscreen}
                className="absolute bottom-4 right-4 p-3 rounded-lg bg-black/50 hover:bg-black/70 transition-colors"
              >
                <Maximize2 className="w-6 h-6" />
              </button>
            </div>
          </div>
        ) : (
          <div className="glass rounded-2xl p-12 text-center">
            <div className="w-20 h-20 rounded-2xl bg-gradient-primary flex items-center justify-center mx-auto mb-6">
              <Play className="w-10 h-10 text-primary-foreground" />
            </div>
            <h3 className="font-display text-2xl font-semibold mb-2">Ready to Watch</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Paste any Dailymotion video URL above and enjoy ad-free streaming with fullscreen support.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
