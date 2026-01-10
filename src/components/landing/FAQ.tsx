import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";

const faqs = [
  {
    question: "How does the ad-free player work?",
    answer: "Our tool uses a special embedding technique that bypasses Dailymotion's ad system. Simply search for videos or paste any Dailymotion video URL, and our player will display the video without any advertisements.",
  },
  {
    question: "What features are included?",
    answer: "With lifetime access you get: video search, favorites, watchlist, watch history (continue watching), TV mode for big screens, dark/light themes, fullscreen support, and works on all devices including Smart TVs. All features are included forever!",
  },
  {
    question: "Is this legal?",
    answer: "Our service simply embeds Dailymotion videos in a way that doesn't display ads. We don't download, store, or redistribute any content. The videos are still streamed from Dailymotion's servers.",
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept payments through Xendit, which includes GCash, Maya (PayMaya), credit/debit cards, and various e-wallets popular in the Philippines.",
  },
  {
    question: "Is this a subscription?",
    answer: "No! This is a one-time payment of only ₱49. Once you pay, you have lifetime access to ALL features. No recurring charges, no hidden fees, no surprises.",
  },
  {
    question: "Can I try it before buying?",
    answer: "Yes! We offer a free 15-minute trial. You can test the player and watch videos ad-free before deciding to purchase. No signup required for the trial.",
  },
  {
    question: "Does it work on my Smart TV?",
    answer: "Absolutely! We have a dedicated TV mode optimized for big screens. Just open the app on your TV browser and enjoy a clean, minimal interface perfect for watching from your couch.",
  },
  {
    question: "What about my watch history?",
    answer: "Your watch history is saved automatically. You can continue watching where you left off, access your favorites, and manage your watchlist from any device.",
  },
  {
    question: "Can I share videos?",
    answer: "Yes! You can easily share videos to WhatsApp, Telegram, Facebook, or copy the link to clipboard with just one click.",
  },
  {
    question: "What if I have issues?",
    answer: "If you experience any problems, you can contact us through our support email. We're here to help ensure you have the best viewing experience.",
  },
];

export function FAQ() {
  return (
    <section className="py-24 px-6" id="faq">
      <div className="container mx-auto max-w-3xl">
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Frequently Asked <span className="text-gradient">Questions</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Got questions? We've got answers.
          </p>
        </div>

        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="glass rounded-xl px-6 border-none"
            >
              <AccordionTrigger className="text-left font-display font-semibold hover:no-underline hover:text-primary transition-colors">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        {/* CTA after FAQ */}
        <div className="mt-16 text-center glass-strong rounded-2xl p-8">
          <h3 className="font-display text-2xl font-bold mb-3">Ready to Start Watching?</h3>
          <p className="text-muted-foreground mb-6">Join thousands of happy viewers enjoying ad-free content</p>
          <Link to="/register">
            <Button variant="hero" size="xl" className="group">
              <Sparkles className="w-5 h-5 group-hover:animate-spin" />
              Get Lifetime Access - Only ₱49
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
