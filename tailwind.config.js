// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    // add other file extensions you use, like .html
  ],
  theme: {
    extend: {
      fontFamily: {
        tech: ['"Roboto Mono"', 'monospace'], // Add Roboto Mono as 'tech' font
      },
    },
  },
  plugins: [],
};
