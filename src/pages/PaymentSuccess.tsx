import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Play, Check, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const [verifying, setVerifying] = useState(true);
  const [verified, setVerified] = useState(false);
  const { user, refreshSubscription } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const verifyPayment = async () => {
      const externalId = searchParams.get("external_id");
      
      if (!externalId || !user) {
        setVerifying(false);
        return;
      }

      try {
        // Call edge function to verify and activate subscription
        const { data, error } = await supabase.functions.invoke("verify-xendit-payment", {
          body: { externalId, userId: user.id },
        });

        if (error) throw error;

        if (data?.success) {
          setVerified(true);
          await refreshSubscription();
        }
      } catch (error) {
        console.error("Verification error:", error);
      } finally {
        setVerifying(false);
      }
    };

    verifyPayment();
  }, [searchParams, user, refreshSubscription]);

  if (verifying) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center px-6">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Verifying your payment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center px-6 py-24">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 text-center max-w-md">
        <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-8">
          <Check className="w-10 h-10 text-primary" />
        </div>

        <h1 className="font-display text-4xl font-bold mb-4">
          {verified ? "Payment Successful!" : "Thank You!"}
        </h1>
        <p className="text-muted-foreground text-lg mb-8">
          {verified
            ? "Your account has been activated. You now have lifetime access to ad-free videos."
            : "Your payment is being processed. You'll have access shortly."}
        </p>

        <Button variant="hero" size="xl" onClick={() => navigate("/watch")}>
          <Play className="w-5 h-5" />
          Start Watching
        </Button>
      </div>
    </div>
  );
}
