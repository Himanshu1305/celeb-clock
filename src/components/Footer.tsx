import { Link } from 'react-router-dom';
import { Separator } from '@/components/ui/separator';

export const Footer = () => {
  return (
    <footer className="mt-16 border-t border-border/50 bg-card/30 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* About */}
          <div>
            <h3 className="font-heading font-semibold text-foreground mb-3">Age & Celeb Life</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your fun, interactive age and health companion. Discover your timeline with precision.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-heading font-semibold text-foreground mb-3">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/about" className="text-muted-foreground hover:text-accent transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-muted-foreground hover:text-accent transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/zodiac" className="text-muted-foreground hover:text-accent transition-colors">
                  Zodiac Signs
                </Link>
              </li>
              <li>
                <Link to="/birthstone" className="text-muted-foreground hover:text-accent transition-colors">
                  Birthstones
                </Link>
              </li>
              <li>
                <Link to="/upgrade" className="text-muted-foreground hover:text-accent transition-colors">
                  Upgrade to Premium
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-heading font-semibold text-foreground mb-3">Support</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/faq" className="text-muted-foreground hover:text-accent transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-muted-foreground hover:text-accent transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <a href="mailto:support@ageceleblife.com" className="text-muted-foreground hover:text-accent transition-colors">
                  support@ageceleblife.com
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-heading font-semibold text-foreground mb-3">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/privacy" className="text-muted-foreground hover:text-accent transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-muted-foreground hover:text-accent transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="mb-6" />

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>
            © {new Date().getFullYear()} Age & Celeb Life. All rights reserved.
          </p>
          <p>
            Made with ✨ for time enthusiasts and curious minds
          </p>
        </div>
      </div>
    </footer>
  );
};
