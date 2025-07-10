import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#748873",
          foreground: "#F8F8F8",
        },
        secondary: {
          DEFAULT: "#D1A980",
          foreground: "#748873",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "#E5E0D8",
          foreground: "#748873",
        },
        accent: {
          DEFAULT: "#D1A980",
          foreground: "#748873",
        },
        popover: {
          DEFAULT: "#F8F8F8",
          foreground: "#748873",
        },
        card: {
          DEFAULT: "#F8F8F8",
          foreground: "#748873",
        },
        retro: {
          green: "#748873",
          tan: "#D1A980",
          beige: "#E5E0D8",
          cream: "#F8F8F8",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        pixel: {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.05)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        pixel: "pixel 2s ease-in-out infinite",
      },
      fontFamily: {
        mono: ["JetBrains Mono", "Courier New", "monospace"],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config
