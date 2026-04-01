/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // --- Tus variables originales (HSL) ---
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        
        // --- Integración de Colores Stitch ---
        primary: {
          DEFAULT: "hsl(var(--primary))", // Tu original
          foreground: "hsl(var(--primary-foreground))", // Tu original
          // Nuevos tonos de Stitch
          dim: "#525252",
          fixed: "#e2e2e2",
          "fixed-dim": "#d4d4d4",
          container: "#e2e2e2",
        },
        // Mantenemos el "primary" de Stitch como color base para las clases del login
        "primary-stitch": "#5e5e5e", 
        
        "surface-container-lowest": "#ffffff",
        "on-primary-fixed": "#3f3f3f",
        "surface-tint": "#5e5e5e",
        "tertiary": "#486272",
        "surface-container-highest": "#dde4e5",
        "on-background": "#2d3435",
        "on-secondary-fixed": "#3f3f3f",
        "inverse-primary": "#ffffff",
        "on-primary-fixed-variant": "#5b5b5b",
        "secondary-fixed": "#e3e2e2",
        "inverse-on-surface": "#9c9d9d",
        "tertiary-fixed-dim": "#c2def0",
        "outline": "#757c7d",
        "on-tertiary-fixed-variant": "#486272",
        "on-secondary-fixed-variant": "#5b5b5b",
        "surface-bright": "#f9f9f9",
        "error-dim": "#4e0309",
        "tertiary-container": "#d0ecff",
        "surface": "#f9f9f9",
        "on-tertiary-container": "#3e5868",
        "on-surface": "#2d3435",
        "secondary-container": "#e3e2e2",
        "secondary": "#5f5f5f",
        "inverse-surface": "#0c0f0f",
        "surface-container": "#ebeeef",
        "on-tertiary-fixed": "#2c4655",
        "on-primary-container": "#525252",
        "on-surface-variant": "#596061",
        "secondary-fixed-dim": "#d5d4d4",
        "surface-container-low": "#f2f4f4",
        "on-primary": "#f8f8f8",
        "surface-variant": "#dde4e5",
        "outline-variant": "#acb3b4",
        "surface-container-high": "#e4e9ea",
        "on-secondary": "#faf8f8",
        "tertiary-fixed": "#d0ecff",
        "on-error-container": "#752121",
        "secondary-dim": "#535353",
        "on-secondary-container": "#515252",
        "primary-container": "#e2e2e2",
        "on-tertiary": "#f4faff",
        "tertiary-dim": "#3c5666",
        "error": "#9f403d",
        "error-container": "#fe8983",
        "on-error": "#fff7f6",
        "surface-dim": "#d3dbdd"
      },
      fontFamily: {
        "headline": ["Manrope", "sans-serif"],
        "body": ["Manrope", "sans-serif"],
        "manrope": ["Manrope", "sans-serif"],
      },
      borderRadius: {
        "DEFAULT": "0.125rem",
        "lg": "var(--radius)", // Usamos tu variable de radio si existe, sino 0.25rem
        "xl": "0.5rem",
        "full": "0.75rem"
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    require("@tailwindcss/forms"),
    require("@tailwindcss/container-queries")
  ],
}
