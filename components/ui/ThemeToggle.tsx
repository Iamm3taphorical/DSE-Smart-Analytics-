import * as React from 'react';
import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface ThemeToggleProps {
    variant?: 'button' | 'dropdown';
    className?: string;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({
    variant = 'button',
    className = ''
}) => {
    const { theme, setTheme, resolvedTheme } = useTheme();

    if (variant === 'dropdown') {
        return (
            <div className={`flex items-center gap-1 p-1 bg-secondary rounded-lg ${className}`}>
                <button
                    onClick={() => setTheme('light')}
                    className={`p-2 rounded-md transition-colors ${theme === 'light'
                            ? 'bg-accent text-foreground'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                    aria-label="Light mode"
                >
                    <Sun className="w-4 h-4" />
                </button>
                <button
                    onClick={() => setTheme('dark')}
                    className={`p-2 rounded-md transition-colors ${theme === 'dark'
                            ? 'bg-accent text-foreground'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                    aria-label="Dark mode"
                >
                    <Moon className="w-4 h-4" />
                </button>
                <button
                    onClick={() => setTheme('system')}
                    className={`p-2 rounded-md transition-colors ${theme === 'system'
                            ? 'bg-accent text-foreground'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                    aria-label="System theme"
                >
                    <Monitor className="w-4 h-4" />
                </button>
            </div>
        );
    }

    const toggleTheme = () => {
        setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
    };

    return (
        <button
            onClick={toggleTheme}
            className={`p-2 rounded-lg bg-secondary hover:bg-accent transition-colors ${className}`}
            aria-label={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
        >
            {resolvedTheme === 'dark' ? (
                <Sun className="w-5 h-5" />
            ) : (
                <Moon className="w-5 h-5" />
            )}
        </button>
    );
};

export default ThemeToggle;
