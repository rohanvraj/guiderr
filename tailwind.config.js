/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      typography: {
        DEFAULT: {
          css: {
            // Compact vertical rhythm — tighter than Tailwind's generous defaults
            // but still within accepted editorial standards.
            p:  { marginTop: '0.6em',  marginBottom: '0.6em' },
            h2: { marginTop: '1.25em', marginBottom: '0.5em' },
            h3: { marginTop: '1em',    marginBottom: '0.4em' },
            h4: { marginTop: '0.85em', marginBottom: '0.35em' },
            ul: { marginTop: '0.5em',  marginBottom: '0.5em' },
            ol: { marginTop: '0.5em',  marginBottom: '0.5em' },
            li: { marginTop: '0.2em',  marginBottom: '0.2em' },
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
