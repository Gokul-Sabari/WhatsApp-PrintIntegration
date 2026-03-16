// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    // Ensure this covers your React files, including components
    "./src/**/*.{js,ts,jsx,tsx}", 
    "./src/components/**/*.{js,ts,jsx,tsx}", // Added to scan new component files
  ],
  theme: {
    extend: {
      colors: {
        'pos-header': '#B23A48', // Main header (dark maroon)
        'pos-button-active': '#9F2B39', // Darker maroon for active category top button
        'pos-orange': '#E76F51', // The prominent orange color
        'pos-orange-value-bg': '#E4664A', // Slightly darker orange for info field values
        'pos-orange-darker': '#D96144', // For subtle border in InfoBar
      }
    },
  },
  plugins: [],
}