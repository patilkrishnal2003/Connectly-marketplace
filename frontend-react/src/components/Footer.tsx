import { Sparkles, Linkedin, Facebook, Instagram, Youtube } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  const footerLinks = {
    Product: [
      { label: "Features", href: "#features" },
      { label: "Pricing", to: "/subscription-plans" },
      { label: "Partners", href: "#partners" },
      { label: "Changelog", href: "#" },
      { label: "Roadmap", href: "#" },
    ],
    Company: [
      { label: "About", to: "/about" },
      { label: "Blog", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Press", href: "#" },
      { label: "Contact", to: "/contact" },
    ],
    Resources: [
      { label: "Documentation", href: "#" },
      { label: "Help Center", to: "/faq" },
      { label: "FAQ", to: "/faq" },
      { label: "Community", href: "#" },
      { label: "API", href: "#" },
    ],
    Legal: [
      { label: "Privacy Policy", to: "/privacy-policy" },
      { label: "Terms of Service", to: "/terms" },
      { label: "Cookie Policy", href: "#" },
      { label: "Security", href: "#" },
    ],
  };

  return (
    <footer className="bg-foreground text-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer */}
        <div className="py-16 grid grid-cols-2 md:grid-cols-6 gap-8">
          {/* Brand Column */}
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">Connecttly</span>
            </div>
            <p className="text-background/60 text-sm mb-6 max-w-xs">
              The marketplace for startup perks. Access exclusive deals from 200+ SaaS providers and save thousands.
            </p>
            <div className="flex items-center gap-4">
              <a
                href="https://www.linkedin.com/company/connecttly-growth"
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-lg bg-background/10 flex items-center justify-center hover:bg-background/20 transition-colors"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <a
                href="https://www.facebook.com/profile.php?id=61577917688397"
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-lg bg-background/10 flex items-center justify-center hover:bg-background/20 transition-colors"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="https://instagram.com/connecttly"
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-lg bg-background/10 flex items-center justify-center hover:bg-background/20 transition-colors"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://youtube.com/@connecttly"
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-lg bg-background/10 flex items-center justify-center hover:bg-background/20 transition-colors"
              >
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-semibold mb-4">{title}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    {link.to ? (
                      <Link
                        to={link.to}
                        className="text-sm text-background/60 hover:text-background transition-colors"
                      >
                        {link.label}
                      </Link>
                    ) : (
                      <a
                        href={link.href || "#"}
                        className="text-sm text-background/60 hover:text-background transition-colors"
                      >
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="py-6 border-t border-background/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-background/60">
            © {new Date().getFullYear()} Connecttly. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link to="/privacy-policy" className="text-sm text-background/60 hover:text-background transition-colors">
              Privacy
            </Link>
            <Link to="/terms" className="text-sm text-background/60 hover:text-background transition-colors">
              Terms
            </Link>
            <a href="#" className="text-sm text-background/60 hover:text-background transition-colors">
              Cookies
            </a>
            <Link to="/admin" className="text-sm text-background/60 hover:text-background transition-colors">
              Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
