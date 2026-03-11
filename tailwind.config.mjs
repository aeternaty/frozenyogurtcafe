/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  safelist: ["bg-orange-500", "bg-primary", "text-white"],
  theme: {
    container: {
      center: true,
      padding: "1rem",
    },
    extend: {
      colors: {
        primary: "#F58220", // Orange - exact match from Get Yo logo
        secondary: "#4bd4ff", // Blue from existing CSS
        pink: {
          50: "#fdf2f8",
          500: "#ec4899",
        },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        display: ["Inter", "sans-serif"],
      },
      borderRadius: {
        button: "12px",
        card: "16px",
        badge: "50px",
      },
    },
  },
  plugins: [],
};
