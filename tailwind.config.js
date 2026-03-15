/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'rr-orange': '#f97316',
        'rr-bg': '#18181b',
        'rr-card': '#27272a',
        'rr-border': '#3f3f46',
      },
    },
  },
  plugins: [],
};
