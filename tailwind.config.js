/** @type {import('tailwindcss').Config} */
module.exports = {
    // NOTE: Update this to include the paths to all of your component files.
    content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
    presets: [require("nativewind/preset")],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#4FA3A5',
                    light: '#6AA893',
                    dark: '#3B8F91',
                },
                secondary: {
                    DEFAULT: '#6B7D85',
                    dark: '#1F2A30',
                    light: '#2F3E46'
                },
                background: {
                    DEFAULT: '#F4F7F8',
                    dark: '#E8EEF1',
                }
            }
        },
    },
    plugins: [],
}