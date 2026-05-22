/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        editorial: ['"EB Garamond"', 'Georgia', 'serif'],
      },
      typography: {
        DEFAULT: {
          css: {
            // Compact vertical rhythm — tighter than Tailwind's generous defaults
            // but still within accepted editorial standards.
            // lineHeight on p = 1.75 (between leading-relaxed:1.625 and leading-loose:2)
            // — finance/investing content needs breathing room on mobile.
            p:  { marginTop: '0.6em',  marginBottom: '0.6em', lineHeight: '1.75' },
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
