import { defineNuxtModule } from "@nuxt/kit";
import { addTemplate } from "@nuxt/kit";
import { resolve } from "path";
import { existsSync } from "fs";

export default defineNuxtModule({
  meta: {
    name: "tailwind",
    configKey: "tailwind",
  },
  defaults: {},
  setup(options, nuxt) {
    // Make sure the CSS directory exists
    const cssDir = resolve(nuxt.options.rootDir, "assets/css");

    // Add tailwind CSS file if doesn't exist
    const tailwindCSSPath = resolve(cssDir, "main.css");
    if (!existsSync(tailwindCSSPath)) {
      addTemplate({
        filename: "assets/css/main.css",
        getContents: () => `
@import "tailwindcss/preflight";
@tailwind utilities;

:root {
  --primary: #3b82f6;
  --primary-light: #60a5fa;
  --primary-dark: #2563eb;
  --background: #0f172a;
  --card: #1e293b;
  --card-foreground: #f8fafc;
  --border: #334155;
  --input: #1e293b;
  --ring: #3b82f6;
}

@layer base {
  body {
    font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    background-color: var(--background);
    color: var(--card-foreground);
    min-height: 100vh;
    margin: 0;
    padding: 0;
  }
}

/* Fix for Nuxt UI components */
.nuxt-ui-button {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  font-weight: 500 !important;
  border-radius: 0.375rem !important;
}

.nuxt-ui-input, .nuxt-ui-select {
  background-color: var(--input) !important;
  border-color: var(--border) !important;
  color: var(--card-foreground) !important;
  border-radius: 0.375rem !important;
}

.nuxt-ui-card {
  background-color: var(--card) !important;
  border-color: var(--border) !important;
  border-radius: 0.5rem !important;
}
`,
      });
    }

    // Add CSS to Nuxt options
    nuxt.options.css = nuxt.options.css || [];
    nuxt.options.css.push("~/assets/css/main.css");
  },
});
