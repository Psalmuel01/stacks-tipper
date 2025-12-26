module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx,html}',
  ],
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: '#0ea5a3', // teal-500-ish
          600: '#08999a',
        },
        surface: '#0b1220',
        muted: {
          DEFAULT: '#94a3b8',
        },
        danger: '#f43f5e',
      },
      boxShadow: {
        'card': '0 6px 18px rgba(2,6,23,0.06)',
        'accent-lg': '0 10px 30px rgba(8,153,154,0.14)',
      },
      borderRadius: {
        '2xl': '1rem',
      },
      spacing: {
        '9': '2.25rem',
      },
    },
  },
  plugins: [
    // These plugins are common and improve base form and prose styles.
    // If you don't have them installed, install with:
    // npm install -D @tailwindcss/forms @tailwindcss/typography
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
};
