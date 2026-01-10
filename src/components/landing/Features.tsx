import { Monitor, Smartphone, Globe, Clock, Heart, ListPlus, Search, Tv, History, Share2, Moon, Shield } from "lucide-react";

const features = [
  {
    icon: Search,
    title: "Smart Video Search",
    description: "Search millions of Dailymotion videos directly from the app. Find exactly what you want to watch in seconds.",
    badge: "NEW",
  },
  {
    icon: Heart,
    title: "Save Favorites",
    description: "Love a video? Add it to your favorites with one click. Build your personal video collection.",
    badge: "NEW",
  },
  {
    icon: ListPlus,
    title: "My Watchlist",
    description: "Queue up videos for later. Mark them as watched when done. Never lose track of what to watch next.",
    badge: "NEW",
  },
  {
    icon: History,
    title: "Continue Watching",
    description: "Pick up where you left off. Your watch history syncs across all your devices automatically.",
    badge: "NEW",
  },
  {
    icon: Tv,
    title: "TV Mode",
    description: "Optimized for big screens. Clean, minimal interface perfect for your Smart TV or projector.",
    badge: "NEW",
  },
  {
    icon: Moon,
    title: "Dark & Light Themes",
    description: "Switch between dark and light mode based on your preference. Easy on the eyes, day or night.",
    badge: "NEW",
  },
  {
    icon: Monitor,
    title: "Watch Anywhere",
    description: "Desktop, laptop, tablet, mobile, or TV. Fully responsive design adapts to any screen size.",
  },
  {
    icon: Clock,
    title: "Instant Access",
    description: "Start watching immediately after payment. No waiting, no verification delays, no hassle.",
  },
  {
    icon: Globe,
    title: "Works Worldwide",
    description: "Our service works from anywhere in the world. No region restrictions, no VPN needed.",
  },
  {
    icon: Shield,
    title: "Secure Payment",
    description: "Pay securely via GCash, Maya, or any credit/debit card. Your data is always protected.",
  },
  {
    icon: Share2,
    title: "Easy Sharing",
    description: "Share your favorite videos to WhatsApp, Telegram, Facebook, or copy the link to clipboard.",
  },
  {
    icon: Smartphone,
    title: "Simple Interface",
    description: "Just search or paste a Dailymotion link and start watching. It's that simple.",
  },
];

export function Features() {
  return (
    <section className="py-24 px-6 bg-card/30" id="features">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <span className="text-primary">✨</span>
            <span className="text-sm font-medium">Packed with Features</span>
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Everything You Need to <span className="text-gradient">Enjoy Videos</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            More than just ad-free viewing. We've built the ultimate video watching experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group relative p-6 rounded-2xl bg-gradient-card border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              {feature.badge && (
                <div className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full bg-gradient-primary text-primary-foreground text-xs font-bold">
                  {feature.badge}
                </div>
              )}
              <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <feature.icon className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="font-display text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
