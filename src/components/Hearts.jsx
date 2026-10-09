import { memo, useMemo } from 'react'
import { motion } from 'framer-motion'

const GLYPHS = ['💗', '💜', '💖', '🖤', '💕', '✨']
// the rain sits behind the copy, so only the bright, low-contrast-safe ones
const RAIN_GLYPHS = ['💗', '💜', '💖', '💕', '✨']

/** A one-shot burst of hearts radiating from a point (0-100 % of the stage). */
export const HeartBurst = memo(function HeartBurst({ id, count = 18, x = 50, y = 60 }) {
  const parts = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const a = (i / count) * Math.PI * 2 + Math.random() * 0.6
        const dist = 90 + Math.random() * 190
        return {
          i,
          g: GLYPHS[(Math.random() * GLYPHS.length) | 0],
          dx: Math.cos(a) * dist,
          dy: Math.sin(a) * dist - 90,
          s: 0.6 + Math.random() * 0.9,
          rot: (Math.random() - 0.5) * 120,
          dur: 1.1 + Math.random() * 0.9,
          delay: Math.random() * 0.12
        }
      }),
    [id, count]
  )

  return (
    <div className="fx">
      {parts.map((p) => (
        <motion.div
          key={p.i}
          className="heart"
          style={{ left: `${x}%`, top: `${y}%`, fontSize: 22 * p.s }}
          initial={{ x: 0, y: 0, scale: 0, opacity: 0, rotate: 0 }}
          animate={{
            x: p.dx,
            y: p.dy,
            scale: [0, 1.15, 0.9],
            opacity: [0, 1, 0],
            rotate: p.rot
          }}
          transition={{ duration: p.dur, delay: p.delay, ease: [0.16, 1, 0.3, 1] }}
        >
          {p.g}
        </motion.div>
      ))}
    </div>
  )
})

/** Endless gentle heart rain for the finale. */
export const HeartRain = memo(function HeartRain({ count = 16, behind = false }) {
  const parts = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        i,
        g: RAIN_GLYPHS[(Math.random() * RAIN_GLYPHS.length) | 0],
        left: Math.random() * 100,
        s: 0.55 + Math.random() * 0.85,
        dur: 6 + Math.random() * 6,
        delay: Math.random() * 7,
        drift: (Math.random() - 0.5) * 90
      })),
    [count]
  )

  return (
    <div className={behind ? 'fx behind' : 'fx'}>
      {parts.map((p) => (
        <motion.div
          key={p.i}
          className="heart"
          style={{ left: `${p.left}%`, top: '104%', fontSize: 20 * p.s, opacity: 0.9 }}
          initial={{ y: 0, opacity: 0 }}
          animate={{
            y: [-0, -window.innerHeight * 1.15],
            x: [0, p.drift, 0],
            opacity: [0, 0.95, 0.95, 0],
            rotate: [0, p.drift > 0 ? 22 : -22, 0]
          }}
          transition={{
            duration: p.dur,
            delay: p.delay,
            repeat: Infinity,
            ease: 'linear',
            times: [0, 0.15, 0.8, 1]
          }}
        >
          {p.g}
        </motion.div>
      ))}
    </div>
  )
})
