// tailwind.config.js
module.exports = {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // BRAND / LIGHT MODE
        'bg': '#ebeaed',               // App background
        'shadow': '#F0EDE5',           // Shadows/light cards
        'accent': '#004643',           // Green Cypre
        'card-bg': '#051F20',          // Black Noir
        'card-bg-alt': '#8eb69b',      // Leaf (for alt cards/buttons)
        'accent-2': '#2000B1',         // Mar Argentum (purple)
        'text': '#051F20',             // Main dark text

        // DARK MODE
        'bg-dark': '#151419',          // Black Void
        'accent-dark': '#F56E0F',      // Liquid Lava (orange)
        'gray-dark': '#262626',
        'light': '#FBFBFB',
        'dusty-gray': '#878787',

        // SEMANTIC
        'primary': '#004643',
        'secondary': '#8eb69b',
        'danger': '#F56E0F',
      },
      borderRadius: {
        'bento': '1.5rem',
        'xl': '2rem',
      },
    },
  },
  plugins: [],
}
