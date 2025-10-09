/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'chat-bg': '#343541',
        'sidebar-bg': '#202123',
        'user-msg': '#343541',
        'ai-msg': '#444654',
        'input-bg': '#40414f',
      },
    },
  },
  plugins: [],
}
