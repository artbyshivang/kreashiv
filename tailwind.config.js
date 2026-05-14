/** * @type {import('tailwindcss').Config} 
 * UI System: Luminous Logic
 * Engineered by artbyshivang
 */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        // Aapke DESIGN.md ke exact hex codes
        brandPrimary: '#004839',   // Deep Green (Headers & Primary Actions)
        brandAccent: '#47fd9b',    // Bright Green (AI Generation/Success)
        brandMint: '#a4f2d8',      // Soft Mint (Glows & Categories)
        brandBg: '#f7faf7',        // Canvas Background
        brandSurface: '#ffffff',   // White Cards
        brandDark: '#181c1b',      // Core Text Color
        brandGold: '#D4AF37',      // Metallic Gold (Pro/Premium Features)
      },
      fontFamily: {
        display: ['SpaceGrotesk'], // Futuristic Headlines
        body: ['Manrope'],         // Clean Body Text
      }
    },
  },
  plugins: [],
}