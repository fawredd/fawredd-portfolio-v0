import type { Config } from "tailwindcss";

const config: Config = {
	darkMode: 'selector',
  content: ["app/**/*.{ts,tsx}", "components/**/*.{ts,tsx}"],
  plugins: [require("tailwindcss-animate")],
};
export default config;
