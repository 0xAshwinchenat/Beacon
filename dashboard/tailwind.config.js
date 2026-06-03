/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#090d16", // Deep, sleek dark background
        card: "#0f172a",       // Card backgrounds
        border: "#1e293b",     // Borders
        input: "#1e293b",
        ring: "#6366f1",
        text: {
          primary: "#f8fafc",
          secondary: "#94a3b8",
        },
        primary: {
          DEFAULT: "#6366f1",
          hover: "#4f46e5",
          foreground: "#ffffff",
        },
        success: "#10b981",
        error: "#ef4444",
        warning: "#f59e0b",
        ghosted: "#64748b",
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
