import * as React from 'react';
import { useTranslation } from 'react-i18next';

interface LanguageToggleProps {
    className?: string;
}

const LanguageToggle: React.FC<LanguageToggleProps> = ({ className = '' }) => {
    const { i18n } = useTranslation();

    const toggleLanguage = () => {
        const newLang = i18n.language === 'en' ? 'bn' : 'en';
        i18n.changeLanguage(newLang);
    };

    return (
        <button
            onClick={toggleLanguage}
            className={`relative inline-flex items-center h-8 rounded-lg bg-secondary border border-border px-2 text-xs font-bold transition-all hover:bg-muted ${className}`}
            aria-label="Toggle Language"
        >
            <span className={`px-2 py-0.5 rounded transition-colors ${i18n.language === 'en' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'}`}>
                EN
            </span>
            <span className={`px-2 py-0.5 rounded transition-colors ${i18n.language === 'bn' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'}`}>
                বাংলা
            </span>
        </button>
    );
};

export default LanguageToggle;
