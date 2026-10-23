// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// GitHub Pages builds (GOMEL_PAGES=1) produce a plain static export: prerendered
// HTML + assets, no server bundle. Everything else (Lovable preview/publish) keeps
// the usual Cloudflare server build.
const pages = process.env["GOMEL_PAGES"] === "1";
// Sub-path for a project site like kmkrnk.github.io/gomel-rating/; "/" for a root site.
const base = process.env["GOMEL_BASE"] ?? "/";

export default defineConfig({
  vite: { base },
  nitro: pages ? false : true,
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
    pages: [{ path: "/" }],
    prerender: { enabled: true, autoStaticPathsDiscovery: false },
  },
});
