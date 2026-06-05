import { defineConfig } from "vite";

// Minimaalinen Vite-konfiguraatio. Vitest lukee saman tiedoston.
// Domain-testit ovat puhdasta TS:ää (node-ympäristö riittää); localStorage
// injektoidaan testeissä mockina, joten jsdom/happy-dom ei ole tarpeen.
export default defineConfig({
  server: {
    port: 5175,
    strictPort: true,
  },
  test: {
    environment: "node",
    include: ["test/**/*.test.ts"],
  },
});
