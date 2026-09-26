module.exports = {
  content: ['./App.tsx', './src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  darkMode: 'class',
  theme: {
    extend: {
      colors: { canvas: '#F7F9F7', ink: '#203C32', muted: '#7A8981', line: '#E4EBE6', primary: '#287454', mint: '#EAF3ED', peach: '#FCF0E6', lilac: '#F1ECF8', sky: '#EAF1FA', rose: '#FCEBEC' },
      fontFamily: { sans: ['DMSans_400Regular'], medium: ['DMSans_500Medium'], semibold: ['DMSans_600SemiBold'], bold: ['DMSans_700Bold'], display: ['Manrope_700Bold'], displaybold: ['Manrope_800ExtraBold'] },
    },
  },
  plugins: [],
};