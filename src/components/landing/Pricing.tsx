import { Button } from "@/components/ui/button";
import { Check, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const features = [
  "Unlimited ad-free videos",
  "Fullscreen support",
  "Works on all devices",
  "Lifetime access",
  "No subscription needed",
  "Instant activation",
  "24/7 availability",
  "Secure payment",
];

export function Pricing() {
  return (
    <section className="py-24 px-6 bg-card/30" id="pricing">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Simple <span className="text-gradient">Pricing</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            One payment. Lifetime access. No hidden fees or subscriptions.
          </p>
        </div>

        <div className="max-w-lg mx-auto">
          <div className="relative">
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-primary opacity-20 blur-3xl rounded-3xl" />
            
            <div className="relative glass-strong rounded-3xl p-8 md:p-12">
              {/* Popular badge */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-primary text-primary-foreground text-sm font-semibold">
                  <Sparkles className="w-4 h-4" />
                  Best Value
                </div>
              </div>

              <div className="text-center mb-8 pt-4">
                <h3 className="font-display text-2xl font-bold mb-2">Lifetime Access</h3>
                <p className="text-muted-foreground mb-6">Everything you need, forever</p>
                
                <div className="flex items-baseline justify-center gap-2">
                  <span className="text-6xl font-display font-bold text-gradient">₱49</span>
                  <span className="text-muted-foreground">one-time</span>
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                {features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-primary" />
                    </div>
                    <span className="text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link to="/register" className="block">
                <Button variant="hero" size="xl" className="w-full">
                  Get Lifetime Access Now
                </Button>
              </Link>

              <p className="text-center text-muted-foreground text-sm mt-4">
                Secure payment via Xendit • GCash, Maya, Cards accepted
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
