import { Button } from "@/components/ui/button";
import { Play, Zap, Shield, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-hero">
      {/* Background glow effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] animate-pulse-glow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-[120px] animate-pulse-glow" style={{ animationDelay: '1s' }} />
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />

      <div className="relative z-10 container mx-auto px-6 py-24 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8 animate-fade-in">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-muted-foreground">Ad-Free Dailymotion Experience</span>
        </div>

        {/* Main heading */}
        <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold mb-6 animate-fade-in-up">
          Watch Dailymotion
          <br />
          <span className="text-gradient glow-text">Without Ads</span>
        </h1>

        {/* Subtitle */}
        <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-12 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          Enjoy unlimited movies, shows, and videos on Dailymotion completely ad-free. 
          One-time payment, lifetime access.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <Link to="/trial">
            <Button variant="hero" size="xl" className="group">
              <Play className="w-5 h-5 group-hover:scale-110 transition-transform" />
              Try Free for 15 Minutes
            </Button>
          </Link>
          <Link to="/register">
            <Button variant="hero-outline" size="xl">
              Get Lifetime Access - ₱49
            </Button>
          </Link>
        </div>

        {/* Feature highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <div className="glass rounded-xl p-6 text-left hover:bg-card/60 transition-all duration-300">
            <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-display font-semibold text-lg mb-2">Zero Ads</h3>
            <p className="text-muted-foreground text-sm">No interruptions, no waiting. Just pure content enjoyment.</p>
          </div>

          <div className="glass rounded-xl p-6 text-left hover:bg-card/60 transition-all duration-300">
            <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-accent" />
            </div>
            <h3 className="font-display font-semibold text-lg mb-2">One-Time Payment</h3>
            <p className="text-muted-foreground text-sm">Pay once, enjoy forever. No subscriptions, no hidden fees.</p>
          </div>

          <div className="glass rounded-xl p-6 text-left hover:bg-card/60 transition-all duration-300">
            <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center mb-4">
              <Play className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-display font-semibold text-lg mb-2">Fullscreen Support</h3>
            <p className="text-muted-foreground text-sm">Watch in beautiful fullscreen mode on any device.</p>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex justify-center pt-2">
          <div className="w-1 h-2 bg-primary rounded-full animate-pulse" />
        </div>
      </div>
    </section>
  );
}
