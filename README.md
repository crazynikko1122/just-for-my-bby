# 💜 just for you my sweetie

A tiny love quiz hosted by **Nikko**. Five questions, one possible answer.

```bash
npm install
npm run dev      # http://localhost:5173 — also prints a LAN URL for your phone
npm run build    # static output in dist/
```

## What's inside

| File | What it does |
| --- | --- |
| `src/App.jsx` | Steps, transitions, the un-clickable NO button, the finale |
| `src/components/Nikko.jsx` | Nikko herself (pure SVG): six moods, five entrances, five idles |
| `src/components/StepFX.jsx` | A different motion graphic per question |
| `src/components/Bubbles.jsx` | Canvas bubble field: growth, buoyancy, elastic collisions, pops |
| `src/components/Hearts.jsx` | Heart bursts on every YES + heart rain in the finale |
| `src/styles.css` | Glass, orbs, grain, vignette, gradient type |

## Notes

- Nikko appears on every step with a different reaction (`peek → sus → plead → love → happy → win`),
  a different entrance (rise / slide / rush / flip / drop-and-bounce) and a different idle
  (drift / scanning sway / nervous shiver / heartbeat / hop).
- Each question has its own motion graphic, not a reskin of the same one:
  bokeh drift → radar scan → sparkle shower → orbiting hearts → light rays + confetti.
- Both answer buttons are in Gen Z slang (`fr fr` vs `nah 🧢`, `deadass` vs `delulu`, …).
- The NO button samples reachable spots on screen and slides to whichever is furthest from
  your finger, so it can't be cornered against an edge. It also shrinks and fades each step.
- Tap anywhere in the finale to pop a bubble — or to blow a new one.
- Everything animates on `transform` / `opacity` only; the bubbles are drawn from cached
  sprites on one canvas. Measured 60fps on the finale (the heaviest scene).
- `prefers-reduced-motion` thins the bubble field and stops the button sheen.

## Deploy

`npm run build`, then drop `dist/` on Netlify / Vercel / GitHub Pages — it's fully static.
