// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1e40af',
        secondary: '#1e3a8a',
        danger: '#dc2626',
        warning: '#f59e0b',
        success: '#10b981',
        info: '#3b82f6'
      }
    },
  },
  plugins: [],
}
