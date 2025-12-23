import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, X, Sparkles, ChevronDown, LogOut, Settings, User, CreditCard } from "lucide-react";

interface NavbarProps {
  isLoggedIn?: boolean;
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
  onLogin?: () => void;
  onLogout?: () => void;
  onProfile?: () => void;
  onSettings?: () => void;
}

const navLinks = [
  { label: "Home", to: "/#hero" },
  { label: "Deals", to: "/#deals" },
  { label: "Categories", to: "/#categories" },
  { label: "About", to: "/about" }
];

const Navbar = ({ isLoggedIn = false, user, onLogin, onLogout, onProfile, onSettings }: NavbarProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const avatarInitial = useMemo(
    () => {
      const trimmedName = user?.name?.trim();

      if (trimmedName) {
        return trimmedName.charAt(0).toUpperCase();
      }

      return "U";
    },
    [user?.name]
  );

  const renderNavLink = (label: string, to: string, className?: string) => {
    const isAnchor = to.includes("#") || to.startsWith("http");
    const sharedClassName =
      "text-sm font-semibold text-slate-800 hover:text-[#2f6bff] transition-colors";

    return isAnchor ? (
      <a key={label} href={to} className={`${sharedClassName} ${className || ""}`}>
        {label}
      </a>
    ) : (
      <Link key={label} to={to} className={`${sharedClassName} ${className || ""}`}>
        {label}
      </Link>
    );
  };

  return (
    <nav className="fixed top-4 left-0 right-0 z-50 px-4 sm:px-6 flex justify-center">
      <div className="relative w-full max-w-6xl">
        <div className="absolute inset-0 rounded-full border border-border/70 bg-white/90 backdrop-blur-md shadow-[0_18px_60px_-30px_rgba(15,23,42,0.35)]" />
        <div className="relative flex items-center h-16 px-4 sm:px-7 gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-gradient-primary flex items-center justify-center shadow-sm">
              <Sparkles className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-xl font-extrabold text-slate-900 tracking-tight">CONNECTTLY</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex flex-1 items-center justify-center gap-8">
            {navLinks.map((link) => renderNavLink(link.label, link.to))}
          </div>

          {/* Auth Section */}
          <div className="hidden md:flex items-center gap-3">
            <a
              href="https://connecttly.com"
              target="_blank"
              rel="noreferrer"
              className="inline-flex"
            >
              <Button className="rounded-full bg-[#2f6bff] hover:bg-[#2557d9] text-white shadow-[0_12px_30px_-12px_rgba(47,107,255,0.65)] px-5">
                Connecttly.com
              </Button>
            </a>
            {isLoggedIn && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 px-2 hover:bg-secondary rounded-full">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-gradient-primary text-primary-foreground text-base font-bold uppercase">
                        {avatarInitial}
                      </AvatarFallback>
                    </Avatar>
                    <span className="sr-only">{user.name}</span>
                    <ChevronDown className="w-4 h-4 text-muted-foreground" aria-hidden />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-card border border-border shadow-elevated">
                  <div className="px-3 py-2 border-b border-border">
                    <p className="text-sm font-semibold text-foreground">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <DropdownMenuItem className="cursor-pointer" onClick={onProfile}>
                    <User className="w-4 h-4 mr-2" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => navigate("/subscription-plans")}
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    Subscription plans
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer" onClick={onSettings}>
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onLogout} className="cursor-pointer text-destructive">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="ghost" onClick={onLogin} className="text-sm font-semibold text-slate-800 hover:text-[#2f6bff]">
                Sign in
              </Button>
            )}
          </div>

          {/* Mobile Actions */}
          <div className="flex items-center gap-2 ml-auto md:hidden">
            <a
              href="https://connecttly.com"
              target="_blank"
              rel="noreferrer"
              className="inline-flex"
            >
              <Button size="sm" className="rounded-full bg-[#2f6bff] hover:bg-[#2557d9] text-white px-3 shadow-[0_10px_24px_-14px_rgba(47,107,255,0.7)]">
                Site
              </Button>
            </a>
            <button
              className="p-2 rounded-full hover:bg-secondary transition-colors border border-border/60 bg-white/70"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle navigation"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5 text-foreground" />
              ) : (
                <Menu className="w-5 h-5 text-foreground" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute left-0 right-0 mt-3 bg-white/95 border border-border shadow-elevated rounded-3xl overflow-hidden backdrop-blur-md">
            <div className="px-4 py-4 space-y-3">
              {navLinks.map((link) =>
                renderNavLink(link.label, link.to, "block text-sm font-semibold text-slate-800"),
              )}
              <a
                href="https://connecttly.com"
                target="_blank"
                rel="noreferrer"
                className="block"
              >
                <Button className="w-full justify-center rounded-full bg-[#2f6bff] hover:bg-[#2557d9] text-white">
                  Connecttly.com
                </Button>
              </a>
              <div className="pt-3 border-t border-border">
                {isLoggedIn ? (
                  <Button variant="ghost" onClick={onLogout} className="w-full justify-start text-destructive">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign out
                  </Button>
                ) : (
                  <Button onClick={onLogin} className="w-full rounded-full bg-gradient-primary">
                    Sign in
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
