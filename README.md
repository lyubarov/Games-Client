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

Needs Node 22.13+ or 24+.

## Two ways to render the counters

The game is the same in both: shapes fall, a click spawns or removes one, and two counters show the number of shapes and their total area. Only the way the counters are drawn differs:

| Variant                          | Open                            | Drawn by                      |
| -------------------------------- | ------------------------------- | ----------------------------- |
| HTML (bonus 5c, default)         | http://localhost:5173/          | DOM elements above the field  |
| Canvas (item 5, engine-rendered) | http://localhost:5173/?hud=pixi | PixiJS text inside the canvas |

The checkbox under the controls switches between them at runtime, without restarting the renderer. Both variants read the same state from a PixiJS-free simulation core (`src/domain`, `src/app`); PixiJS (`src/engine`) and React (`src/ui`) only draw it.
