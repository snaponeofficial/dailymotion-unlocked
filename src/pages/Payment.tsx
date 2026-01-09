import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Play, ArrowLeft, Loader2, Check, Shield, CreditCard } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function Payment() {
  const [loading, setLoading] = useState(false);
  const { user, hasActiveSubscription, refreshSubscription } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      navigate("/register");
    } else if (hasActiveSubscription) {
      navigate("/watch");
    }
  }, [user, hasActiveSubscription, navigate]);

  const handlePayment = async () => {
    if (!user) {
      navigate("/register");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("create-xendit-invoice", {
        body: {
          userId: user.id,
          email: user.email,
          amount: 49,
          description: "DailyWatch Lifetime Access",
        },
      });

      if (error) throw error;

      if (data?.invoice_url) {
        // Redirect to Xendit payment page
        window.location.href = data.invoice_url;
      } else {
        throw new Error("No invoice URL received");
      }
    } catch (error: any) {
      console.error("Payment error:", error);
      toast({
        title: "Payment Error",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center px-6 py-24">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Go back
        </button>

        <div className="glass-strong rounded-2xl p-8">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center">
              <Play className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-xl">DailyWatch</span>
          </div>

          <h1 className="font-display text-2xl font-bold mb-2">Complete Your Purchase</h1>
          <p className="text-muted-foreground mb-8">One-time payment for lifetime access</p>

          {/* Price card */}
          <div className="bg-secondary/50 rounded-xl p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <span className="text-muted-foreground">Lifetime Access</span>
              <span className="font-display text-3xl font-bold text-gradient">₱49</span>
            </div>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-primary" />
                Unlimited ad-free videos
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-primary" />
                Fullscreen support
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-primary" />
                Works on all devices
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-primary" />
                No subscription needed
              </li>
            </ul>
          </div>

          {/* Payment method info */}
          <div className="flex items-center gap-3 p-4 rounded-lg bg-primary/10 border border-primary/20 mb-6">
            <CreditCard className="w-5 h-5 text-primary" />
            <div className="text-sm">
              <p className="font-medium">Secure payment via Xendit</p>
              <p className="text-muted-foreground">GCash, Maya, Cards accepted</p>
            </div>
          </div>

          <Button
            variant="hero"
            size="xl"
            className="w-full"
            onClick={handlePayment}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Shield className="w-5 h-5" />
                Pay ₱49 Now
              </>
            )}
          </Button>

          <p className="text-center text-muted-foreground text-xs mt-4">
            By proceeding, you agree to our terms of service.
          </p>
        </div>
      </div>
    </div>
  );
}
