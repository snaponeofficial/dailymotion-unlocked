import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Play, ArrowLeft, Maximize2, Clock, AlertTriangle, ShieldAlert } from "lucide-react";
import { parseVideoUrl, isValidDailymotionInput } from "@/lib/dailymotion";
import { getOrCreateTrialSession, getTrialTimeRemaining, incrementTrialVideoCount, TrialSession } from "@/lib/trial";
import { generateFingerprint } from "@/lib/fingerprint";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function Trial() {
  const [videoUrl, setVideoUrl] = useState("");
  const [embedUrl, setEmbedUrl] = useState("");
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [trialExpired, setTrialExpired] = useState(false);
  const [trialBlocked, setTrialBlocked] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const initTrial = async () => {
      setIsValidating(true);
      
      try {
        const session = await getOrCreateTrialSession();
        if (!session) {
          setTrialBlocked(true);
          setIsValidating(false);
          return;
        }

        // Generate fingerprint and get IP
        const fingerprint = await generateFingerprint();
        const userAgent = navigator.userAgent;
        
        // Get IP address
        let ipAddress = "unknown";
        try {
          const ipResponse = await fetch("https://api.ipify.org?format=json");
          const ipData = await ipResponse.json();
          ipAddress = ipData.ip;
        } catch {
          console.log("Could not fetch IP");
        }

        // Validate trial with backend
        const { data, error } = await supabase.functions.invoke("validate-trial", {
          body: {
            sessionId: session.session_id,
            fingerprint,
            ipAddress,
            userAgent,
          },
        });

        if (error || !data?.allowed) {
          setTrialBlocked(true);
          toast({
            title: "Trial Unavailable",
            description: data?.reason || "Please purchase lifetime access to continue.",
            variant: "destructive",
          });
          setIsValidating(false);
          return;
        }

        const remaining = await getTrialTimeRemaining();
        setTimeRemaining(remaining);
        
        if (remaining <= 0) {
          setTrialExpired(true);
        }
      } catch (error) {
        console.error("Trial init error:", error);
      }
      
      setIsValidating(false);
    };

    initTrial();
  }, [toast]);

  useEffect(() => {
    if (trialExpired || trialBlocked || isValidating) return;

    const interval = setInterval(async () => {
      const remaining = await getTrialTimeRemaining();
      setTimeRemaining(remaining);
      
      if (remaining <= 0) {
        setTrialExpired(true);
        setEmbedUrl("");
        toast({
          title: "Trial Expired",
          description: "Your 15-minute trial has ended. Purchase lifetime access to continue.",
          variant: "destructive",
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [trialExpired, trialBlocked, isValidating, toast]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleWatch = async () => {
    if (trialExpired || trialBlocked) {
      toast({
        title: "Trial Unavailable",
        description: "Please purchase lifetime access to continue watching.",
        variant: "destructive",
      });
      return;
    }

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
      await incrementTrialVideoCount();
    }
  };

  const toggleFullscreen = () => {
    const iframe = document.getElementById("video-player") as HTMLIFrameElement;
    if (iframe) {
      if (!document.fullscreenElement) {
        iframe.requestFullscreen();
        setIsFullscreen(true);
      } else {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  // Loading state
  if (isValidating) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Validating trial access...</p>
        </div>
      </div>
    );
  }

  // Trial blocked
  if (trialBlocked) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center px-6 py-24">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-destructive/10 rounded-full blur-[120px]" />
        </div>

        <div className="relative z-10 text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-destructive/20 flex items-center justify-center mx-auto mb-8">
            <ShieldAlert className="w-10 h-10 text-destructive" />
          </div>

          <h1 className="font-display text-4xl font-bold mb-4">Trial Already Used</h1>
          <p className="text-muted-foreground text-lg mb-8">
            You've already used your free trial on this device. Get lifetime access for just ₱49 to continue watching.
          </p>

          <div className="flex flex-col gap-4">
            <Link to="/register">
              <Button variant="hero" size="xl" className="w-full">
                Get Lifetime Access - ₱49
              </Button>
            </Link>
            <Link to="/">
              <Button variant="ghost" className="w-full">
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Trial expired
  if (trialExpired) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center px-6 py-24">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-destructive/10 rounded-full blur-[120px]" />
        </div>

        <div className="relative z-10 text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-destructive/20 flex items-center justify-center mx-auto mb-8">
            <AlertTriangle className="w-10 h-10 text-destructive" />
          </div>

          <h1 className="font-display text-4xl font-bold mb-4">Trial Expired</h1>
          <p className="text-muted-foreground text-lg mb-8">
            Your 15-minute free trial has ended. Get lifetime access for just ₱49.
          </p>

          <div className="flex flex-col gap-4">
            <Link to="/register">
              <Button variant="hero" size="xl" className="w-full">
                Get Lifetime Access - ₱49
              </Button>
            </Link>
            <Link to="/">
              <Button variant="ghost" className="w-full">
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero px-6 py-24">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 container mx-auto max-w-4xl">
        <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>

        {/* Trial timer */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center">
              <Play className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-xl">Free Trial</span>
          </div>

          <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${timeRemaining < 60 ? 'bg-destructive/20 text-destructive' : 'bg-primary/20 text-primary'}`}>
            <Clock className="w-4 h-4" />
            <span className="font-mono font-bold">{formatTime(timeRemaining)}</span>
            <span className="text-sm">remaining</span>
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
              Watch
            </Button>
          </div>
        </div>

        {/* Video player */}
        {embedUrl && (
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
                className="absolute bottom-4 right-4 p-2 rounded-lg bg-black/50 hover:bg-black/70 transition-colors"
              >
                <Maximize2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* CTA */}
        {!embedUrl && (
          <div className="text-center mt-12">
            <p className="text-muted-foreground mb-4">
              Enjoying the trial? Get unlimited access for just ₱49
            </p>
            <Link to="/register">
              <Button variant="hero-outline">Get Lifetime Access</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
