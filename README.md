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
| `src/App.jsx` | Steps, transitions, the finale |
| `src/components/Answers.jsx` | The YES / NO row — NO fails in a different way on every question |
| `src/components/Nikko.jsx` | Nikko herself (pure SVG): six moods, five entrances, five idles |
| `src/components/StepFX.jsx` | A different motion graphic per question |
| `src/components/Bubbles.jsx` | Canvas bubble field: growth, buoyancy, elastic collisions, pops |
| `src/components/Hearts.jsx` | Heart bursts on every YES + heart rain in the finale |
| `src/components/haptics.js` | Phone buzzes: Vibration API, with a hidden-switch fallback on iOS |
| `src/styles.css` | Glass, orbs, grain, vignette, gradient type |

## Notes

- Nikko appears on every step with a different reaction (`peek → sus → plead → love → happy → win`),
  a different entrance (rise / slide / rush / flip / drop-and-bounce) and a different idle
  (drift / scanning sway / nervous shiver / heartbeat / hop).
- Each question has its own motion graphic, not a reskin of the same one:
  bokeh drift → radar scan → sparkle shower → orbiting hearts → light rays + confetti.
- The NO button never works, and fails differently every time:
  1. dodges your finger — it can't be touched at all
  2. every press shrinks it while YES swells, until it pops out of existence
  3. decoy: the glowing button is the NO — pressing it shuffles both buttons
  4. sprints off screen before your hand gets there
  5. gets sucked into a vortex and swallowed
- The background orbs follow your pointer, or the phone's tilt. iOS only allows tilt after
  asking, so tapping **Begin** shows the system motion-permission prompt there.
- Tap anywhere in the finale to pop a bubble — or to blow a new one.
- Everything animates on `transform` / `opacity` only; the bubbles are drawn from cached
  sprites on one canvas. Measured 60fps on the finale (the heaviest scene).
- `prefers-reduced-motion` thins the bubble field and stops the button sheen.

## Deploy

Deployed on Vercel (`vercel.json`): every push to `main` goes live, other branches get a
preview URL. It's fully static, so `dist/` from `npm run build` also works on Netlify or
GitHub Pages.
