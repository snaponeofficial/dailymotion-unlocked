import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Play, ArrowLeft, Loader2 } from "lucide-react";
import { signIn } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signIn(email, password);
      toast({
        title: "Welcome back!",
        description: "You have been logged in successfully.",
      });
      navigate("/watch");
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message || "Invalid email or password.",
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
        {/* Back link */}
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

          <h1 className="font-display text-2xl font-bold mb-2">Welcome back</h1>
          <p className="text-muted-foreground mb-8">Sign in to continue watching ad-free</p>

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

            <Button type="submit" variant="hero" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <p className="text-center text-muted-foreground text-sm mt-6">
            Don't have an account?{" "}
            <Link to="/register" className="text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
