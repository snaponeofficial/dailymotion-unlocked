import { Button } from "@/components/ui/button";
import { Check, Sparkles, Zap, X, Gift } from "lucide-react";
import { Link } from "react-router-dom";

const includedFeatures = [
  "Unlimited ad-free videos",
  "Smart video search",
  "Save favorites & watchlist",
  "Continue watching history",
  "TV mode for big screens",
  "Dark & light themes",
  "Fullscreen support",
  "Works on all devices",
  "Lifetime access forever",
  "Instant activation",
  "24/7 availability",
  "Secure payment",
];

const comparisonFeatures = [
  { feature: "Watch videos", free: true, paid: true },
  { feature: "Ad-free experience", free: false, paid: true },
  { feature: "Video search", free: false, paid: true },
  { feature: "Favorites & watchlist", free: false, paid: true },
  { feature: "Watch history", free: false, paid: true },
  { feature: "TV mode", free: false, paid: true },
  { feature: "Theme customization", free: false, paid: true },
  { feature: "Time limit", free: "15 mins", paid: "Unlimited" },
];

export function Pricing() {
  return (
    <section className="py-24 px-6 bg-card/30" id="pricing">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Gift className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Limited Time Offer</span>
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
            One Payment. <span className="text-gradient">Forever Access.</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            No subscriptions, no hidden fees. Pay once and enjoy all features for life.
          </p>
        </div>

        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8">
          {/* Free Trial Card */}
          <div className="glass rounded-3xl p-8">
            <h3 className="font-display text-xl font-bold mb-2">Free Trial</h3>
            <p className="text-muted-foreground mb-6">Try before you buy</p>
            
            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-4xl font-display font-bold">₱0</span>
              <span className="text-muted-foreground">/ 15 minutes</span>
            </div>

            <ul className="space-y-3 mb-8">
              {comparisonFeatures.map((item) => (
                <li key={item.feature} className="flex items-center gap-3">
                  {item.free === true ? (
                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-primary" />
                    </div>
                  ) : item.free === false ? (
                    <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                      <X className="w-3 h-3 text-muted-foreground" />
                    </div>
                  ) : (
                    <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 text-xs text-muted-foreground">
                      ⏱️
                    </div>
                  )}
                  <span className={item.free === false ? "text-muted-foreground" : ""}>
                    {item.feature}
                    {typeof item.free === 'string' && (
                      <span className="text-muted-foreground ml-1">({item.free})</span>
                    )}
                  </span>
                </li>
              ))}
            </ul>

            <Link to="/trial" className="block">
              <Button variant="outline" size="xl" className="w-full">
                Start Free Trial
              </Button>
            </Link>
          </div>

          {/* Lifetime Access Card */}
          <div className="relative">
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-primary opacity-20 blur-3xl rounded-3xl" />
            
            <div className="relative glass-strong rounded-3xl p-8 border-2 border-primary/30">
              {/* Popular badge */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-primary text-primary-foreground text-sm font-bold shadow-lg">
                  <Sparkles className="w-4 h-4" />
                  BEST VALUE
                </div>
              </div>

              <h3 className="font-display text-xl font-bold mb-2 pt-4">Lifetime Access</h3>
              <p className="text-muted-foreground mb-6">Everything, forever</p>
              
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-5xl font-display font-bold text-gradient">₱49</span>
                <span className="text-muted-foreground">one-time</span>
              </div>
              <p className="text-sm text-primary mb-6 flex items-center gap-1">
                <Zap className="w-4 h-4" />
                Save ₱550+/year vs. ads
              </p>

              <ul className="space-y-3 mb-8">
                {comparisonFeatures.map((item) => (
                  <li key={item.feature} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-primary" />
                    </div>
                    <span className="text-foreground">
                      {item.feature}
                      {typeof item.paid === 'string' && (
                        <span className="text-primary font-medium ml-1">({item.paid})</span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>

              <Link to="/register" className="block">
                <Button variant="hero" size="xl" className="w-full group">
                  <Sparkles className="w-5 h-5 group-hover:animate-spin" />
                  Get Lifetime Access Now
                </Button>
              </Link>

              <p className="text-center text-muted-foreground text-sm mt-4">
                🔒 Secure payment via GCash, Maya, Cards
              </p>
            </div>
          </div>
        </div>

        {/* All Features List */}
        <div className="mt-16 max-w-4xl mx-auto">
          <h3 className="font-display text-2xl font-bold text-center mb-8">
            Everything Included with Lifetime Access
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {includedFeatures.map((feature) => (
              <div key={feature} className="flex items-center gap-2 p-3 rounded-lg bg-secondary/30">
                <Check className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
