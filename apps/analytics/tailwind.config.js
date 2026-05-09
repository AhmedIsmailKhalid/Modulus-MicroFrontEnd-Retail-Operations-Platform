const base = require("../../packages/config/tailwind.config.base");

/** @type {import('tailwindcss').Config} */
module.exports = {
  ...base,
  content: [
    "./src/**/*.{ts,tsx}",
    "../../packages/ui/src/**/*.{ts,tsx}",
  ],
};
