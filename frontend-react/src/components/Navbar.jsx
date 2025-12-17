import { Link } from "react-router-dom";
import { Button } from "./ui/button";

export default function Navbar({ isLoggedIn = false, onLogin = () => {}, onLogout = () => {} }) {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
        <Link to="/" className="text-lg font-semibold text-foreground">
          Connecttly Marketplace
        </Link>
        <div className="flex items-center gap-3">
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Home
          </Link>
          <Link to="/faq" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            FAQ
          </Link>
          <Button variant="ghost" onClick={isLoggedIn ? onLogout : onLogin} className="text-sm">
            {isLoggedIn ? "Logout" : "Log in"}
          </Button>
        </div>
      </div>
    </header>
  );
}
