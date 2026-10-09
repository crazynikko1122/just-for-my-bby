import { memo, useMemo } from 'react'
import { motion } from 'framer-motion'

/**
 * One purpose-built motion graphic per question — a different *kind* of
 * animation each time, not the same drift with new numbers.
 *
 * 1 · bokeh    2 · scanner    3 · sparkle shower    4 · heart orbit    5 · starburst + confetti
 */

const seedArray = (n, fn) => Array.from({ length: n }, (_, i) => fn(i))

// particles are tiny, so percentage travel would barely move them —
// falling/rising layers animate in pixels across the viewport instead
const viewH = () => (typeof window === 'undefined' ? 800 : window.innerHeight)

/* 1 ─ soft bokeh lights drifting upward ----------------------------- */
function Bokeh() {
  const H = useMemo(viewH, [])
  const dots = useMemo(
    () =>
      seedArray(11, (i) => ({
        i,
        left: Math.random() * 100,
        size: 26 + Math.random() * 70,
        dur: 9 + Math.random() * 8,
        delay: -Math.random() * 12,
        drift: (Math.random() - 0.5) * 60,
        hue: Math.random() > 0.5 ? '#c58bff' : '#ff8ed2'
      })),
    []
  )
  return (
    <div className="stepfx">
      {dots.map((d) => (
        <motion.span
          key={d.i}
          className="bokeh"
          style={{
            left: `${d.left}%`,
            width: d.size,
            height: d.size,
            background: `radial-gradient(circle at 35% 35%, ${d.hue}, transparent 68%)`
          }}
          initial={{ y: H, opacity: 0 }}
          animate={{ y: -140, x: [0, d.drift, 0], opacity: [0, 0.55, 0.55, 0] }}
          transition={{
            duration: d.dur,
            delay: d.delay,
            repeat: Infinity,
            ease: 'linear',
            times: [0, 0.2, 0.75, 1]
          }}
        />
      ))}
    </div>
  )
}

/* 2 ─ she is scanning you: radar sweep + scanline -------------------- */
function Scanner() {
  return (
    <div className="stepfx">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="radar"
          initial={{ scale: 0.35, opacity: 0 }}
          animate={{ scale: 1.5, opacity: [0, 0.6, 0] }}
          transition={{ duration: 2.7, delay: i * 0.9, repeat: Infinity, ease: 'easeOut' }}
        />
      ))}
      <motion.svg
        className="dashring"
        viewBox="0 0 100 100"
        animate={{ rotate: 360 }}
        transition={{ duration: 11, repeat: Infinity, ease: 'linear' }}
      >
        <circle
          cx="50"
          cy="50"
          r="46"
          fill="none"
          stroke="rgba(201,150,255,0.55)"
          strokeWidth="0.8"
          strokeDasharray="5 7"
          strokeLinecap="round"
        />
        <circle
          cx="50"
          cy="50"
          r="38"
          fill="none"
          stroke="rgba(255,140,210,0.3)"
          strokeWidth="0.6"
          strokeDasharray="2 10"
        />
      </motion.svg>
      <motion.span
        className="scanline"
        animate={{ y: ['-46%', '46%', '-46%'], opacity: [0, 0.9, 0] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  )
}

/* 3 ─ sparkle shower ------------------------------------------------- */
function Sparkles() {
  const H = useMemo(viewH, [])
  const bits = useMemo(
    () =>
      seedArray(20, (i) => ({
        i,
        left: Math.random() * 100,
        size: 7 + Math.random() * 14,
        dur: 3 + Math.random() * 3,
        delay: -Math.random() * 5,
        spin: Math.random() > 0.5 ? 200 : -200
      })),
    []
  )
  return (
    <div className="stepfx">
      {bits.map((b) => (
        <motion.span
          key={b.i}
          className="spark"
          style={{ left: `${b.left}%`, width: b.size, height: b.size }}
          initial={{ y: -60, opacity: 0, rotate: 0 }}
          animate={{ y: H, opacity: [0, 1, 1, 0], rotate: b.spin, scale: [0.6, 1, 0.7] }}
          transition={{
            duration: b.dur,
            delay: b.delay,
            repeat: Infinity,
            ease: 'linear',
            times: [0, 0.15, 0.7, 1]
          }}
        />
      ))}
    </div>
  )
}

/* 4 ─ hearts orbiting her head in a tilted ring ---------------------- */
function HeartOrbit() {
  const hearts = useMemo(() => seedArray(9, (i) => ({ i, a: (i / 9) * 360 })), [])
  return (
    <div className="stepfx">
      <motion.div
        className="orbit"
        animate={{ rotate: 360 }}
        transition={{ duration: 9, repeat: Infinity, ease: 'linear' }}
      >
        {hearts.map((h) => (
          <span
            key={h.i}
            className="orbit-slot"
            style={{ transform: `rotate(${h.a}deg) translateY(-46%)` }}
          >
            <motion.span
              className="orbit-heart"
              style={{ transform: `rotate(${-h.a}deg)` }}
              animate={{ scale: [0.8, 1.25, 0.8], opacity: [0.55, 1, 0.55] }}
              transition={{
                duration: 1.9,
                delay: h.i * 0.16,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            >
              💗
            </motion.span>
          </span>
        ))}
      </motion.div>
    </div>
  )
}

/* 5 ─ full send: rotating light rays, ring pulses, confetti ---------- */
function Starburst() {
  const H = useMemo(viewH, [])
  const confetti = useMemo(
    () =>
      seedArray(22, (i) => ({
        i,
        left: Math.random() * 100,
        dur: 2.6 + Math.random() * 2.4,
        delay: -Math.random() * 5,
        spin: (Math.random() - 0.5) * 900,
        w: 5 + Math.random() * 5,
        h: 9 + Math.random() * 12,
        color: ['#ff7ec8', '#b98cff', '#7ee3ff', '#ffd76e'][(Math.random() * 4) | 0]
      })),
    []
  )
  return (
    <div className="stepfx">
      <motion.span
        className="rays"
        animate={{ rotate: 360 }}
        transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
      />
      {[0, 1].map((i) => (
        <motion.span
          key={i}
          className="pulsering"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1.35, opacity: [0, 0.7, 0] }}
          transition={{ duration: 2.2, delay: i * 1.1, repeat: Infinity, ease: 'easeOut' }}
        />
      ))}
      {confetti.map((c) => (
        <motion.span
          key={c.i}
          className="confetti"
          style={{ left: `${c.left}%`, width: c.w, height: c.h, background: c.color }}
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: H, opacity: [0, 1, 1, 0], rotate: c.spin }}
          transition={{
            duration: c.dur,
            delay: c.delay,
            repeat: Infinity,
            ease: 'linear',
            times: [0, 0.1, 0.8, 1]
          }}
        />
      ))}
    </div>
  )
}

const LAYERS = [Bokeh, Scanner, Sparkles, HeartOrbit, Starburst]

function StepFX({ step }) {
  const Layer = LAYERS[Math.min(step, LAYERS.length - 1)]
  return <Layer />
}

export default memo(StepFX)
