# Falling Shapes

Shapes fall under gravity inside a masked canvas rectangle. Click or tap to spawn one, click or tap a shape to remove it, and watch the live counters. Built with PixiJS 8, React 19 and TypeScript for the _Games Client Development Test_.

## Run

```bash
npm install
npm run dev          # http://localhost:5173
npm run build        # type-check + production build
npm test             # unit tests (Vitest)
npm run lint         # ESLint: strict type-checked rules + architecture rules
```

Needs Node 22.13+ or 24+. The counters are HTML by default; the checkbox under the controls (or `?hud=pixi`) draws them inside the canvas with Pixi instead.
