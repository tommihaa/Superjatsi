import { defineConfig } from "vite";
import { readFileSync } from "node:fs";

// Minimaalinen Vite-konfiguraatio. Vitest lukee saman tiedoston.
// Domain-testit ovat puhdasta TS:ää (node-ympäristö riittää); localStorage
// injektoidaan testeissä mockina, joten jsdom/happy-dom ei ole tarpeen.
const pkg = JSON.parse(readFileSync(new URL("./package.json", import.meta.url), "utf-8")) as {
  version: string;
};
const buildDate = new Date().toISOString().slice(0, 10);

export default defineConfig({
  // Versioleima setup-näytölle ja Tietoja-overlayhin (build-aikaiset vakiot).
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
    __BUILD_DATE__: JSON.stringify(buildDate),
  },
  server: {
    port: 5175,
    strictPort: true,
  },
  test: {
    environment: "node",
    include: ["test/**/*.test.ts"],
  },
});
