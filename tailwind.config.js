/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A8A',
        },
        surface: {
          DEFAULT: '#1E293B',
          light: '#334155',
          dark: '#0F172A',
        },
        accent: {
          violet: '#7C3AED',
          green: '#16A34A',
          amber: '#F59E0B',
          red: '#DC2626',
        },
      },
    },
  },
  plugins: [],
};
