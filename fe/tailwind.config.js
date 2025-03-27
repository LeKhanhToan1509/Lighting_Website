/** @type {import('tailwindcss').Config} */
export default {
    content: ['./src/**/*.{js,jsx,ts,tsx}'],
    theme: {
        extend: {
            fontFamily: {
                krona: ['"Krona One"', 'sans-serif'],
            },
        },
    },
    content: ["./node_modules/flyonui/dist/js/accordion.js"],
    plugins: [
        require("flyonui"),
    ],
};
