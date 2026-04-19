import typography from '@tailwindcss/typography';
import containerQueries from '@tailwindcss/container-queries';
import animate from 'tailwindcss-animate';

/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ['class'],
    content: ['index.html', 'src/**/*.{js,ts,jsx,tsx,html,css}'],
    theme: {
        container: {
            center: true,
            padding: '2rem',
            screens: {
                '2xl': '1400px'
            }
        },
        extend: {
            colors: {
                border: 'oklch(var(--border))',
                input: 'oklch(var(--input))',
                ring: 'oklch(var(--ring) / <alpha-value>)',
                background: 'oklch(var(--background))',
                foreground: 'oklch(var(--foreground))',
                primary: {
                    DEFAULT: 'oklch(var(--primary) / <alpha-value>)',
                    foreground: 'oklch(var(--primary-foreground))'
                },
                secondary: {
                    DEFAULT: 'oklch(var(--secondary) / <alpha-value>)',
                    foreground: 'oklch(var(--secondary-foreground))'
                },
                destructive: {
                    DEFAULT: 'oklch(var(--destructive) / <alpha-value>)',
                    foreground: 'oklch(var(--destructive-foreground))'
                },
                muted: {
                    DEFAULT: 'oklch(var(--muted) / <alpha-value>)',
                    foreground: 'oklch(var(--muted-foreground) / <alpha-value>)'
                },
                accent: {
                    DEFAULT: 'oklch(var(--accent) / <alpha-value>)',
                    foreground: 'oklch(var(--accent-foreground))'
                },
                popover: {
                    DEFAULT: 'oklch(var(--popover))',
                    foreground: 'oklch(var(--popover-foreground))'
                },
                card: {
                    DEFAULT: 'oklch(var(--card))',
                    foreground: 'oklch(var(--card-foreground))'
                },
                chart: {
                    1: 'oklch(var(--chart-1))',
                    2: 'oklch(var(--chart-2))',
                    3: 'oklch(var(--chart-3))',
                    4: 'oklch(var(--chart-4))',
                    5: 'oklch(var(--chart-5))'
                },
                sidebar: {
                    DEFAULT: 'oklch(var(--sidebar))',
                    foreground: 'oklch(var(--sidebar-foreground))',
                    primary: 'oklch(var(--sidebar-primary))',
                    'primary-foreground': 'oklch(var(--sidebar-primary-foreground))',
                    accent: 'oklch(var(--sidebar-accent))',
                    'accent-foreground': 'oklch(var(--sidebar-accent-foreground))',
                    border: 'oklch(var(--sidebar-border))',
                    ring: 'oklch(var(--sidebar-ring))'
                },
                casino: {
                    gold: 'oklch(var(--casino-gold) / <alpha-value>)',
                    purple: 'oklch(var(--casino-purple) / <alpha-value>)',
                    pink: 'oklch(var(--casino-pink) / <alpha-value>)',
                    cyan: 'oklch(var(--casino-cyan) / <alpha-value>)'
                },
                ludo: {
                    red: 'oklch(var(--ludo-red) / <alpha-value>)',
                    green: 'oklch(var(--ludo-green) / <alpha-value>)',
                    yellow: 'oklch(var(--ludo-yellow) / <alpha-value>)',
                    blue: 'oklch(var(--ludo-blue) / <alpha-value>)'
                }
            },
            borderRadius: {
                lg: 'var(--radius)',
                md: 'calc(var(--radius) - 2px)',
                sm: 'calc(var(--radius) - 4px)'
            },
            boxShadow: {
                xs: '0 1px 2px 0 rgba(0,0,0,0.05)',
                'glow-purple': '0 0 20px rgba(168, 85, 247, 0.5)',
                'glow-pink': '0 0 20px rgba(236, 72, 153, 0.5)',
                'glow-cyan': '0 0 20px rgba(6, 182, 212, 0.5)',
                'glow-gold': '0 0 25px rgba(255, 215, 0, 0.6)',
                'glow-red': '0 0 20px rgba(239, 68, 68, 0.5)',
                'glow-green': '0 0 20px rgba(34, 197, 94, 0.5)',
                'glow-yellow': '0 0 20px rgba(234, 179, 8, 0.5)',
                'glow-blue': '0 0 20px rgba(59, 130, 246, 0.5)',
                'neon': '0 0 5px currentColor, 0 0 10px currentColor, 0 0 15px currentColor',
            },
            keyframes: {
                'accordion-down': {
                    from: { height: '0' },
                    to: { height: 'var(--radix-accordion-content-height)' }
                },
                'accordion-up': {
                    from: { height: 'var(--radix-accordion-content-height)' },
                    to: { height: '0' }
                },
                'glow-pulse': {
                    '0%, 100%': { boxShadow: '0 0 20px rgba(168, 85, 247, 0.4)' },
                    '50%': { boxShadow: '0 0 40px rgba(168, 85, 247, 0.8)' }
                },
                'token-bounce': {
                    '0%, 100%': { transform: 'translateY(0) scale(1)' },
                    '50%': { transform: 'translateY(-10px) scale(1.1)' }
                }
            },
            animation: {
                'accordion-down': 'accordion-down 0.2s ease-out',
                'accordion-up': 'accordion-up 0.2s ease-out',
                'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
                'token-bounce': 'token-bounce 0.5s ease-in-out'
            }
        }
    },
    plugins: [typography, containerQueries, animate]
};
