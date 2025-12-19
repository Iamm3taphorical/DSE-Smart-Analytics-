import * as React from 'react';
import { TrendingUp, Mail, ExternalLink, Github, Linkedin } from 'lucide-react';

interface FooterProps {
    className?: string;
}

const Footer: React.FC<FooterProps> = ({ className = '' }) => {
    const currentYear = new Date().getFullYear();

    const footerLinks = {
        product: [
            { label: 'Dashboard', href: '#' },
            { label: 'Market Analysis', href: '#' },
            { label: 'AI Assistant', href: '#' },
            { label: 'Portfolio Simulator', href: '#' },
        ],
        resources: [
            { label: 'Documentation', href: '#' },
            { label: 'API Reference', href: '#' },
            { label: 'Learning Center', href: '#' },
            { label: 'Blog', href: '#' },
        ],
        legal: [
            { label: 'Terms of Service', href: '#' },
            { label: 'Privacy Policy', href: '#' },
            { label: 'Disclaimer', href: '#' },
            { label: 'BSEC Compliance', href: '#' },
        ],
    };

    return (
        <footer className={`border-t border-border bg-card ${className}`}>
            <div className="container-wide py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
                    {/* Brand */}
                    <div className="lg:col-span-2">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                                <TrendingUp className="w-4 h-4 text-primary-foreground" />
                            </div>
                            <span className="text-lg font-bold">
                                DSE<span className="text-primary">Analytics</span>
                            </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4 max-w-sm">
                            Transform raw Bangladesh stock market data into actionable insights.
                            AI-powered analytics for informed investment decisions.
                        </p>
                        <div className="flex items-center gap-3">
                            <a
                                href="#"
                                className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center
                           hover:bg-accent transition-colors"
                                aria-label="GitHub"
                            >
                                <Github className="w-4 h-4" />
                            </a>
                            <a
                                href="#"
                                className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center
                           hover:bg-accent transition-colors"
                                aria-label="LinkedIn"
                            >
                                <Linkedin className="w-4 h-4" />
                            </a>
                            <a
                                href="mailto:contact@dseanalytics.com"
                                className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center
                           hover:bg-accent transition-colors"
                                aria-label="Email"
                            >
                                <Mail className="w-4 h-4" />
                            </a>
                        </div>
                    </div>

                    {/* Product Links */}
                    <div>
                        <h4 className="font-semibold text-sm mb-4">Product</h4>
                        <ul className="space-y-2">
                            {footerLinks.product.map((link) => (
                                <li key={link.label}>
                                    <a
                                        href={link.href}
                                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        {link.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Resources Links */}
                    <div>
                        <h4 className="font-semibold text-sm mb-4">Resources</h4>
                        <ul className="space-y-2">
                            {footerLinks.resources.map((link) => (
                                <li key={link.label}>
                                    <a
                                        href={link.href}
                                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        {link.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Legal Links */}
                    <div>
                        <h4 className="font-semibold text-sm mb-4">Legal</h4>
                        <ul className="space-y-2">
                            {footerLinks.legal.map((link) => (
                                <li key={link.label}>
                                    <a
                                        href={link.href}
                                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        {link.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="mt-12 pt-8 border-t border-border">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-xs text-muted-foreground text-center md:text-left max-w-2xl">
                            This platform is for educational purposes only and does not provide financial advice.
                            All data is publicly available. Users should consult BSEC-registered professionals before investing.
                        </p>
                        <div className="text-xs text-muted-foreground text-center md:text-right">
                            <p>© {currentYear} DSE Smart Analytics. All rights reserved.</p>
                            <p className="mt-1">
                                Made with ❤️ by{' '}
                                <a
                                    href="https://iamm3taphorical.github.io"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:text-primary/80 font-medium transition-colors"
                                >
                                    Mahir Dyan
                                </a>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
