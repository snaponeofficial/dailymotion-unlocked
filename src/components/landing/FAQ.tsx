import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "How does the ad-free player work?",
    answer: "Our tool uses a special embedding technique that bypasses Dailymotion's ad system. Simply paste any Dailymotion video URL, and our player will display the video without any advertisements.",
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
    answer: "No! This is a one-time payment of ₱49. Once you pay, you have lifetime access. No recurring charges, no hidden fees.",
  },
  {
    question: "Can I try it before buying?",
    answer: "Yes! We offer a free 15-minute trial. You can test the player and watch videos ad-free before deciding to purchase.",
  },
  {
    question: "Does it work on mobile?",
    answer: "Absolutely! Our player is fully responsive and works on all devices - desktop, tablet, and mobile phones. You can even watch in fullscreen mode.",
  },
  {
    question: "What if I have issues?",
    answer: "If you experience any problems, you can contact us through our support email. We're here to help ensure you have the best viewing experience.",
  },
  {
    question: "Can I use ad blockers on Dailymotion instead?",
    answer: "Dailymotion uses advanced technology to detect ad blockers and will block video playback if one is detected. Our service works without triggering these detection systems.",
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
      </div>
    </section>
  );
}
