import { Play } from "lucide-react";
import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="py-12 px-6 border-t border-border/50">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
              <Play className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-xl">DailyWatch</span>
          </div>

          <div className="flex items-center gap-6 text-muted-foreground text-sm">
            <Link to="/login" className="hover:text-primary transition-colors">
              Login
            </Link>
            <Link to="/register" className="hover:text-primary transition-colors">
              Register
            </Link>
            <a href="#faq" className="hover:text-primary transition-colors">
              FAQ
            </a>
          </div>

          <p className="text-muted-foreground text-sm">
            © 2024 DailyWatch. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
