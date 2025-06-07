import type { Config } from "tailwindcss";
// @ts-expect-error - no types
import nativewind from "nativewind/preset";

import baseConfig from "@acme/tailwind-config/native";

export default {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./App.{js,jsx,ts,tsx}",
    "./**/*.{js,jsx,ts,tsx}",
  ],
  presets: [baseConfig, nativewind],
} satisfies Config;
