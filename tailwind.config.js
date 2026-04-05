const colors = require('tailwindcss/colors');

const gray = {
    50: '#fafafa',
    100: '#f0f0f0',
    200: '#d4d4d4',
    300: '#a3a3a3',
    400: '#737373',
    500: '#525252',
    600: '#3a3a3a',
    700: '#2a2a2a',
    800: '#1e1e1e',
    900: '#141414',
    950: '#0a0a0a',
};

const lumixRed = {
    50: '#fff1f1',
    100: '#ffe0e0',
    200: '#ffc7c7',
    300: '#ffa0a0',
    400: '#FF4C4C',
    500: '#e63e3e',
    600: '#cc3333',
    700: '#b32929',
    800: '#942222',
    900: '#7a1f1f',
    950: '#430c0c',
};

module.exports = {
    content: [
        './resources/scripts/**/*.{js,ts,tsx}',
    ],
    theme: {
        extend: {
            fontFamily: {
                header: ['"IBM Plex Sans"', '"Roboto"', 'system-ui', 'sans-serif'],
                mono: ['"IBM Plex Mono"', '"Fira Code"', 'monospace'],
            },
            colors: {
                black: '#0a0a0a',
                // "primary" and "neutral" are deprecated, prefer the use of "blue" and "gray"
                // in new code.
                primary: lumixRed,
                gray: gray,
                neutral: gray,
                cyan: lumixRed,
                red: lumixRed,
                blue: lumixRed,
            },
            fontSize: {
                '2xs': '0.625rem',
            },
            transitionDuration: {
                250: '250ms',
            },
            borderColor: theme => ({
                default: theme('colors.neutral.400', 'currentColor'),
            }),
            borderRadius: {
                DEFAULT: '2px',
                'sm': '1px',
                'md': '3px',
                'lg': '4px',
                'xl': '6px',
            },
            boxShadow: {
                'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
                DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.4), 0 1px 2px -1px rgba(0, 0, 0, 0.4)',
                'md': '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -2px rgba(0, 0, 0, 0.4)',
                'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -4px rgba(0, 0, 0, 0.4)',
            },
        },
    },
    plugins: [
        require('@tailwindcss/line-clamp'),
        require('@tailwindcss/forms')({
            strategy: 'class',
        }),
    ]
};
