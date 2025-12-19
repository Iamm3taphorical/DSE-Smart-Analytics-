import * as React from 'react';
import { AlertTriangle, Scale, Shield } from 'lucide-react';

interface LegalDisclaimerProps {
    variant?: 'full' | 'compact' | 'inline';
    className?: string;
}

const LegalDisclaimer: React.FC<LegalDisclaimerProps> = ({
    variant = 'full',
    className = ''
}) => {
    if (variant === 'inline') {
        return (
            <p className={`text-xs text-muted-foreground ${className}`}>
                <AlertTriangle className="inline w-3 h-3 mr-1" />
                AI insights are educational, not financial advice.
            </p>
        );
    }

    if (variant === 'compact') {
        return (
            <div className={`p-4 bg-secondary/50 rounded-lg border border-border ${className}`}>
                <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        This platform provides analytical insights for educational purposes only.
                        Not financial advice. Consult licensed professionals before investing.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className={`p-6 bg-card border border-border rounded-xl ${className}`}>
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                    <Scale className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                    <h3 className="font-semibold text-foreground">Legal Disclaimer</h3>
                    <p className="text-xs text-muted-foreground">Important Notice</p>
                </div>
            </div>

            <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
                <p>
                    <strong className="text-foreground">DSE Smart Analytics</strong> is an independent
                    stock market analytics and educational tool providing publicly available market data,
                    historical trends, analytical insights, and AI-driven guidance for the Bangladesh
                    capital market.
                </p>

                <p>
                    This platform <strong className="text-foreground">does not constitute</strong> financial,
                    investment, legal, or trading advice. It is not a brokerage and does not execute real
                    trades or manage investor funds.
                </p>

                <p>
                    Predictions, simulations, analytics, and AI-generated guidance are for
                    <strong className="text-foreground"> informational purposes only</strong> and may not
                    reflect actual market performance.
                </p>

                <p className="pt-2 border-t border-border">
                    Users are solely responsible for investment decisions and should consult
                    <strong className="text-foreground"> licensed financial professionals</strong> or
                    authorized <strong className="text-foreground">BSEC-registered brokerage houses</strong> before investing.
                </p>
            </div>
        </div>
    );
};

export default LegalDisclaimer;
