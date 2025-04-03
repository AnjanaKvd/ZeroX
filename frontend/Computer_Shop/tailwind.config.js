export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    
    extend: {
      borderColor: {
        DEFAULT: 'var(--border-color)',
      },
      backdropBlur: {
        sm: '4px',
      },
      colors: {
        // Light theme colors
        primary: {
          DEFAULT: '#1AA5DE',
          hover: '#1690C2'
        },
        secondary: {
          DEFAULT: '#546575',
          hover: '#455566'
        },
        accent: {
          DEFAULT: '#F57C00',
          hover: '#E67002'
        },
        success: {
          light: '#2E7D32',
          dark: '#66BB6A'
        },
        error: {
          light: '#D32F2F',
          dark: '#EF5350'
        },
        surface: {
          light: '#FFFFFF',
          dark: '#1E1E1E'
        },
        background: {
          light: '#F8FAFC',
          dark: '#121212'
        },
        text: {
          light: {
            primary: '#212529',
            secondary: '#546575'
          },
          dark: {
            primary: '#E0E0E0',
            secondary: '#A0AAB4'
          }
        }
      }
    },
  },
  plugins: [],
} 