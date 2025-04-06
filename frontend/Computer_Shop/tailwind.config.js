export default {
    content: ["./index.html", "./src//*.{js,ts,jsx,tsx}"],
    darkMode: "class",
    theme: {
        extend: {
            borderColor: {
                DEFAULT: "rgb(var(--color-border))",
                border: "rgb(var(--color-border))",
            },
            backdropBlur: {
                sm: "4px",
            },
            colors: {
                primary: {
                    DEFAULT: "rgb(var(--color-primary))",
                    hover: "rgb(var(--color-primary-hover))",
                },
                secondary: {
                    DEFAULT: "rgb(var(--color-secondary))",
                    hover: "rgb(var(--color-secondary-hover))",
                },
                accent: {
                    DEFAULT: "rgb(var(--color-accent))",
                    hover: "rgb(var(--color-accent-hover))",
                },
                success: {
                    light: "rgb(46, 125, 50)",
                    dark: "rgb(102, 187, 106)",
                    DEFAULT: "rgb(var(--color-success))",
                },
                error: {
                    light: "rgb(211, 47, 47)",
                    dark: "rgb(239, 83, 80)",
                    DEFAULT: "rgb(var(--color-error))",
                },
                surface: {
                    light: "rgb(255, 255, 255)",
                    dark: "rgb(30, 30, 30)",
                    DEFAULT: "rgb(var(--color-surface))",
                },
                background: {
                    light: "rgb(248, 250, 252)",
                    dark: "rgb(18, 18, 18)",
                    DEFAULT: "rgb(var(--color-background))",
                },
                text: {
                    light: {
                        primary: "rgb(33, 37, 41)",
                        secondary: "rgb(84, 101, 117)",
                    },
                    dark: {
                        primary: "rgb(224, 224, 224)",
                        secondary: "rgb(160, 170, 180)",
                    },
                    primary: "rgb(var(--color-text-primary))",
                    secondary: "rgb(var(--color-text-secondary))",
                },
            },
        },
    },
    plugins: [],
};