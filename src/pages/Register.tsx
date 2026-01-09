import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Play, ArrowLeft, Loader2, Check } from "lucide-react";
import { signUp } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

const features = [
  "Unlimited ad-free videos",
  "Fullscreen support",
  "Works on all devices",
  "Lifetime access",
];

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your passwords match.",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      await signUp(email, password);
      toast({
        title: "Account created!",
        description: "Please proceed to payment to activate your account.",
      });
      navigate("/payment");
    } catch (error: any) {
      toast({
        title: "Registration failed",
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

      <div className="relative z-10 w-full max-w-4xl grid md:grid-cols-2 gap-8">
        {/* Left side - Benefits */}
        <div className="hidden md:flex flex-col justify-center">
          <h2 className="font-display text-3xl font-bold mb-4">
            Get <span className="text-gradient">Lifetime Access</span>
          </h2>
          <p className="text-muted-foreground mb-8">
            One-time payment of ₱49. No subscriptions, no hidden fees.
          </p>
          <ul className="space-y-4">
            {features.map((feature) => (
              <li key={feature} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                  <Check className="w-4 h-4 text-primary" />
                </div>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Right side - Form */}
        <div>
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>

          <div className="glass-strong rounded-2xl p-8">
            {/* Logo */}
            <div className="flex items-center gap-2 mb-8">
              <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center">
                <Play className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-xl">DailyWatch</span>
            </div>

            <h1 className="font-display text-2xl font-bold mb-2">Create your account</h1>
            <p className="text-muted-foreground mb-8">Start watching ad-free today</p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-secondary/50 border-border/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-secondary/50 border-border/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="bg-secondary/50 border-border/50"
                />
              </div>

              <Button type="submit" variant="hero" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  "Create Account & Continue to Payment"
                )}
              </Button>
            </form>

            <p className="text-center text-muted-foreground text-sm mt-6">
              Already have an account?{" "}
              <Link to="/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
