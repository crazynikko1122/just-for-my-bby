import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion, useMotionValue, useSpring } from 'framer-motion'
import { buzz } from './haptics.js'

/**
 * The answer row. YES always works; NO never does — but it fails in a
 * completely different way on every question:
 *
 *  1 · dodges the finger and never lets itself be touched
 *  2 · every press shrinks it while YES swells, until it pops out of existence
 *  3 · decoy: the glowing button is NO — press it and both buttons shuffle
 *  4 · sprints across the screen too fast to catch, then it's gone
 *  5 · gets sucked into a vortex and swallowed
 */

const SPRING = { type: 'spring', stiffness: 260, damping: 30, mass: 0.9 }
const GONE_HINTS = [
  '',
  'aww it got smaller and smaller 😌',
  '',
  'gone. she was too fast for it 💨',
  'the void ate it 🌀'
]

/* ── 1 · the dodger ─────────────────────────────────────────────── */

function Dodger({ label }) {
  const ref = useRef(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 420, damping: 26, mass: 0.7 })
  const sy = useSpring(y, { stiffness: 420, damping: 26, mass: 0.7 })

  useEffect(() => {
    const flee = (clientX, clientY) => {
      const el = ref.current
      if (!el) return
      const r = el.getBoundingClientRect()
      const cx = r.left + r.width / 2
      const cy = r.top + r.height / 2
      if (Math.hypot(cx - clientX, cy - clientY) > 104) return

      const baseX = r.left - sx.get()
      const baseY = r.top - sy.get()
      const pad = 12
      const minX = pad - baseX
      const maxX = Math.max(minX, window.innerWidth - r.width - pad - baseX)
      const minY = pad + 46 - baseY
      const maxY = Math.max(minY, window.innerHeight - r.height - pad - baseY)

      let best = { nx: x.get(), ny: y.get() }
      let bestScore = -Infinity
      for (let i = 0; i < 16; i++) {
        const nx = minX + Math.random() * (maxX - minX)
        const ny = minY + Math.random() * (maxY - minY)
        const d = Math.hypot(baseX + nx + r.width / 2 - clientX, baseY + ny + r.height / 2 - clientY)
        const travel = Math.hypot(nx - x.get(), ny - y.get())
        const score = Math.min(d, 300) - travel * 0.22
        if (score > bestScore) {
          bestScore = score
          best = { nx, ny }
        }
      }
      x.set(best.nx)
      y.set(best.ny)
    }

    const onMove = (e) => flee(e.clientX, e.clientY)
    const onTouch = (e) => {
      const t = e.touches[0]
      if (t) flee(t.clientX, t.clientY)
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('touchstart', onTouch, { passive: true })
    window.addEventListener('touchmove', onTouch, { passive: true })
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('touchstart', onTouch)
      window.removeEventListener('touchmove', onTouch)
    }
  }, [x, y, sx, sy])

  return (
    <motion.button
      ref={ref}
      type="button"
      className="btn no"
      // untouchable on purpose: taps pass straight through it
      style={{ x: sx, y: sy, pointerEvents: 'none' }}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...SPRING, delay: 0.14 }}
    >
      {label}
    </motion.button>
  )
}

/* ── 4 · the sprinter ───────────────────────────────────────────── */

function Sprinter({ label, onGone }) {
  const ref = useRef(null)
  const [dash, setDash] = useState(0) // 0 = idle, ±1 = direction
  const [armed, setArmed] = useState(false)

  // give it a beat to land before it can bolt
  useEffect(() => {
    const t = setTimeout(() => setArmed(true), 650)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (dash || !armed) return
    const check = (clientX, clientY) => {
      const el = ref.current
      if (!el) return
      const r = el.getBoundingClientRect()
      const cx = r.left + r.width / 2
      const cy = r.top + r.height / 2
      // a wide trigger ring: it leaves long before a fast hand arrives
      if (Math.hypot(cx - clientX, cy - clientY) > 150) return
      setDash(clientX > cx ? -1 : 1)
      buzz(10)
    }
    const onMove = (e) => check(e.clientX, e.clientY)
    const onDown = (e) => check(e.clientX, e.clientY)
    const onTouch = (e) => {
      const t = e.touches[0]
      if (t) check(t.clientX, t.clientY)
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerdown', onDown, { passive: true })
    window.addEventListener('touchstart', onTouch, { passive: true })
    window.addEventListener('touchmove', onTouch, { passive: true })
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('touchstart', onTouch)
      window.removeEventListener('touchmove', onTouch)
    }
  }, [dash, armed])

  return (
    <motion.button
      ref={ref}
      type="button"
      className="btn no sprinter"
      style={{ pointerEvents: 'none' }}
      initial={{ opacity: 0, y: 14 }}
      animate={
        dash
          ? {
              x: dash * (window.innerWidth + 240),
              opacity: [1, 1, 0],
              skewX: dash * -16,
              scaleX: [1, 1.5, 1.2]
            }
          : { opacity: 1, y: 0, x: 0 }
      }
      transition={dash ? { duration: 0.42, ease: [0.35, 0, 0.2, 1] } : { ...SPRING, delay: 0.14 }}
      onAnimationComplete={() => dash && onGone()}
    >
      {label}
    </motion.button>
  )
}

/* ── the row ────────────────────────────────────────────────────── */

export default function Answers({ step, yesLabel, noLabel, onYes }) {
  const [presses, setPresses] = useState(0)
  const [gone, setGone] = useState(false)
  const [vortex, setVortex] = useState(false)
  const [swaps, setSwaps] = useState(0)
  const [jiggle, setJiggle] = useState({ yes: 0, no: 0 })

  useEffect(() => {
    setPresses(0)
    setGone(false)
    setVortex(false)
    setSwaps(0)
    setJiggle({ yes: 0, no: 0 })
  }, [step])

  /* 2 · press it enough times and it shrinks itself out of the room */
  const squeeze = useCallback(() => {
    buzz(12)
    setPresses((n) => {
      const next = n + 1
      if (next >= 4) setTimeout(() => setGone(true), 260)
      return next
    })
  }, [])

  /* 3 · the decoy shuffles both buttons every time it's pressed */
  const shuffle = useCallback(() => {
    buzz([10, 40, 14])
    setSwaps((n) => n + 1)
    setJiggle({
      yes: (Math.random() - 0.5) * 22,
      no: (Math.random() - 0.5) * 22
    })
  }, [])

  /* 5 · swallowed by a vortex */
  const swallow = useCallback(() => {
    buzz([12, 40, 22, 40, 30])
    setVortex(true)
    setTimeout(() => setGone(true), 900)
  }, [])

  const yesScale = step === 1 && !gone ? 1 + presses * 0.06 : 1
  const noScale = step === 1 ? Math.max(0.05, 1 - presses * 0.24) : 1

  /* ── question 3: the styles are swapped, so the tempting glowing button
        is the wrong one — and pressing it makes both of them move ── */
  if (step === 2) {
    const swapped = swaps % 2 === 1
    const layoutSpring = { type: 'spring', stiffness: 420, damping: 24, mass: 0.7 }

    const yesBtn = (
      <motion.button
        layout
        key="yes"
        type="button"
        className="btn no decoy-yes"
        onClick={() => {
          buzz(14)
          onYes()
        }}
        whileTap={{ scale: 0.95 }}
        animate={{ y: jiggle.yes, rotate: jiggle.yes * 0.2 }}
        transition={layoutSpring}
      >
        {yesLabel}
      </motion.button>
    )

    const noBtn = (
      <motion.button
        layout
        key="no"
        type="button"
        className="btn yes decoy-no"
        onPointerDown={shuffle}
        whileTap={{ scale: 0.95 }}
        animate={{ y: jiggle.no, rotate: jiggle.no * -0.2 }}
        transition={layoutSpring}
      >
        {noLabel}
      </motion.button>
    )

    return (
      <>
        <div className="answers">{swapped ? [noBtn, yesBtn] : [yesBtn, noBtn]}</div>
        <div className="hint">
          {swaps === 0
            ? 'the pretty one is not the right one 👀'
            : swaps < 3
              ? 'nope. they move. keep up 😌'
              : 'you can keep pressing it forever btw 💜'}
        </div>
      </>
    )
  }

  return (
    <>
      <div className="answers">
        <motion.button
          type="button"
          className="btn yes"
          onClick={() => {
            buzz(14)
            onYes()
          }}
          whileTap={{ scale: yesScale * 0.95 }}
          animate={{ scale: yesScale, width: gone ? '100%' : 'auto' }}
          transition={{ type: 'spring', stiffness: 300, damping: 18 }}
        >
          {yesLabel}
        </motion.button>

        <AnimatePresence>
          {!gone && step === 0 && <Dodger key="dodge" label={noLabel} />}

          {!gone && step === 1 && (
            <motion.button
              key="squeeze"
              type="button"
              className="btn no"
              onPointerDown={squeeze}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0, scale: noScale, rotate: presses * 4 }}
              exit={{ scale: 0, opacity: 0, rotate: 90 }}
              transition={{ type: 'spring', stiffness: 420, damping: 17 }}
            >
              {noLabel}
            </motion.button>
          )}

          {!gone && step === 3 && (
            <Sprinter key="sprint" label={noLabel} onGone={() => setGone(true)} />
          )}

          {!gone && step === 4 && (
            <motion.button
              key="vortex"
              type="button"
              className="btn no"
              onPointerDown={swallow}
              initial={{ opacity: 0, y: 14 }}
              animate={
                vortex
                  ? { rotate: 900, scale: 0, y: -230, x: [0, 40, -30, 0], opacity: [1, 1, 0] }
                  : { opacity: 1, y: 0, rotate: 0, scale: 1 }
              }
              exit={{ opacity: 0, transition: { duration: 0 } }}
              transition={
                vortex
                  ? { duration: 0.9, ease: [0.5, 0, 0.75, 0] }
                  : { ...SPRING, delay: 0.14 }
              }
            >
              {noLabel}
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {vortex && (
          <div className="vortex" key="vfx">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="vortex-ring"
                initial={{ scale: 1.5, opacity: 0, rotate: 0 }}
                animate={{ scale: 0, opacity: [0, 0.85, 0], rotate: 420 }}
                transition={{ duration: 0.9, delay: i * 0.12, ease: 'easeIn' }}
              />
            ))}
          </div>
        )}
      </AnimatePresence>

      <div className="hint">
        {gone ? GONE_HINTS[step] : 'psst… the other button is a whole coward'}
      </div>
    </>
  )
}
