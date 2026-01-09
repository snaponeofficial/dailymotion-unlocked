import { Monitor, Smartphone, Globe, Clock, CreditCard, Infinity } from "lucide-react";

const features = [
  {
    icon: Monitor,
    title: "Watch on Any Device",
    description: "Access your ad-free videos on desktop, laptop, tablet, or mobile. Fully responsive design.",
  },
  {
    icon: Clock,
    title: "Instant Access",
    description: "Start watching immediately after payment. No waiting, no verification delays.",
  },
  {
    icon: Globe,
    title: "Works Worldwide",
    description: "Our service works from anywhere in the world. No region restrictions.",
  },
  {
    icon: CreditCard,
    title: "Secure Payment",
    description: "Pay securely with Xendit. We support multiple payment methods including GCash, Maya, and cards.",
  },
  {
    icon: Infinity,
    title: "Unlimited Videos",
    description: "Watch as many videos as you want. No daily limits, no restrictions.",
  },
  {
    icon: Smartphone,
    title: "Simple Interface",
    description: "Just paste a Dailymotion link and start watching. It's that simple.",
  },
];

export function Features() {
  return (
    <section className="py-24 px-6 bg-card/30" id="features">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Why Choose <span className="text-gradient">DailyWatch</span>?
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Experience Dailymotion the way it was meant to be - without annoying ads interrupting your entertainment.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group p-8 rounded-2xl bg-gradient-card border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-14 h-14 rounded-xl bg-gradient-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <feature.icon className="w-7 h-7 text-primary-foreground" />
              </div>
              <h3 className="font-display text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
