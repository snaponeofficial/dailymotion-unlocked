import { Button } from "@/components/ui/button";
import { Play, Zap, Shield, Sparkles, Heart, ListPlus, Tv, Search } from "lucide-react";
import { Link } from "react-router-dom";

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-hero">
      {/* Background glow effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] animate-pulse-glow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-[120px] animate-pulse-glow" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-primary/10 rounded-full blur-[100px] animate-pulse-glow" style={{ animationDelay: '2s' }} />
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />

      <div className="relative z-10 container mx-auto px-6 py-24 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8 animate-fade-in">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-muted-foreground">🔥 Limited Time Offer - Only ₱49!</span>
        </div>

        {/* Main heading */}
        <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold mb-6 animate-fade-in-up">
          Watch Dailymotion
          <br />
          <span className="text-gradient glow-text">100% Ad-Free</span>
        </h1>

        {/* Subtitle */}
        <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          Search millions of videos, save your favorites, build your watchlist, 
          and enjoy <span className="text-foreground font-semibold">uninterrupted streaming</span> on any device — 
          including your <span className="text-primary font-semibold">Smart TV!</span>
        </p>

        {/* Trust badges */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-10 animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
            <span className="text-primary text-lg">✓</span>
            <span className="text-sm font-medium">One-Time Payment</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20">
            <span className="text-accent text-lg">✓</span>
            <span className="text-sm font-medium">Lifetime Access</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
            <span className="text-primary text-lg">✓</span>
            <span className="text-sm font-medium">Works on All Devices</span>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <Link to="/register">
            <Button variant="hero" size="xl" className="group relative overflow-hidden">
              <span className="relative z-10 flex items-center gap-2">
                <Sparkles className="w-5 h-5 group-hover:animate-spin" />
                Get Lifetime Access - Only ₱49
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_100%] animate-shimmer opacity-0 group-hover:opacity-100 transition-opacity" />
            </Button>
          </Link>
          <Link to="/trial">
            <Button variant="hero-outline" size="xl" className="group">
              <Play className="w-5 h-5 group-hover:scale-110 transition-transform" />
              Try Free for 15 Minutes
            </Button>
          </Link>
        </div>

        {/* Feature highlights */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <div className="glass rounded-xl p-5 text-center hover:bg-card/60 transition-all duration-300 hover:scale-105">
            <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center mb-3 mx-auto">
              <Zap className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-display font-semibold text-base mb-1">Zero Ads</h3>
            <p className="text-muted-foreground text-xs">Pure content, no interruptions</p>
          </div>

          <div className="glass rounded-xl p-5 text-center hover:bg-card/60 transition-all duration-300 hover:scale-105">
            <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center mb-3 mx-auto">
              <Search className="w-6 h-6 text-accent" />
            </div>
            <h3 className="font-display font-semibold text-base mb-1">Smart Search</h3>
            <p className="text-muted-foreground text-xs">Find any video instantly</p>
          </div>

          <div className="glass rounded-xl p-5 text-center hover:bg-card/60 transition-all duration-300 hover:scale-105">
            <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center mb-3 mx-auto">
              <Heart className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-display font-semibold text-base mb-1">Save Favorites</h3>
            <p className="text-muted-foreground text-xs">Build your personal collection</p>
          </div>

          <div className="glass rounded-xl p-5 text-center hover:bg-card/60 transition-all duration-300 hover:scale-105">
            <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center mb-3 mx-auto">
              <Tv className="w-6 h-6 text-accent" />
            </div>
            <h3 className="font-display font-semibold text-base mb-1">TV Mode</h3>
            <p className="text-muted-foreground text-xs">Perfect for big screens</p>
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
