import { ClipboardCopy, Play, Smile } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: ClipboardCopy,
    title: "Copy Video Link",
    description: "Find any video on Dailymotion and copy its URL from your browser.",
  },
  {
    number: "02",
    icon: Play,
    title: "Paste & Watch",
    description: "Paste the link into our player and click play. That's it!",
  },
  {
    number: "03",
    icon: Smile,
    title: "Enjoy Ad-Free",
    description: "Watch your video in fullscreen without any ads or interruptions.",
  },
];

export function HowItWorks() {
  return (
    <section className="py-24 px-6" id="how-it-works">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
            How It <span className="text-gradient">Works</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Getting started is incredibly simple. Just three easy steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <div key={step.number} className="relative">
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-16 left-[60%] w-[80%] h-px bg-gradient-to-r from-primary/50 to-transparent" />
              )}
              
              <div className="text-center group">
                <div className="relative inline-block mb-8">
                  <div className="w-32 h-32 rounded-2xl bg-gradient-card border border-border/50 flex items-center justify-center group-hover:border-primary/50 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-primary/10">
                    <step.icon className="w-12 h-12 text-primary" />
                  </div>
                  <span className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center font-display font-bold text-primary-foreground text-sm">
                    {step.number}
                  </span>
                </div>
                <h3 className="font-display text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-muted-foreground max-w-xs mx-auto">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
