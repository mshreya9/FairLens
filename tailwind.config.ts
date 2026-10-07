// Tailwind CSS v4 is configured primarily via the `@theme` block in
// app/globals.css (CSS-first configuration). This file is kept for
// structural compatibility and for any tooling that still expects it.
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
};

export default config;
