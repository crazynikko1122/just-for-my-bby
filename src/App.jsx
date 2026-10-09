import { useCallback, useEffect, useRef, useState } from 'react'
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  useTransform
} from 'framer-motion'
import { NikkoStage } from './components/Nikko.jsx'
import { HeartBurst, HeartRain } from './components/Hearts.jsx'
import Bubbles from './components/Bubbles.jsx'
import StepFX from './components/StepFX.jsx'
import Answers from './components/Answers.jsx'
import { buzz, celebrate, stopBuzz } from './components/haptics.js'

const STEPS = [
  {
    q: 'Do you love me? 🥺',
    sub: 'be honest… Nikko is watching 👀',
    mood: 'peek',
    yes: 'yes',
    no: 'no'
  },
  {
    q: 'Are you sure? 👀',
    sub: 'Nikko is lowkey scanning you rn',
    mood: 'sus',
    yes: 'ofc',
    no: 'nope'
  },
  {
    q: 'REALLY love me? 🥹',
    sub: 'like… deadass deadass?',
    mood: 'plead',
    yes: 'yes',
    no: 'nah'
  },
  {
    q: 'Am I your favorite person? 💗',
    sub: 'only one answer is giving',
    mood: 'love',
    yes: 'love u sm',
    no: 'nuh uh'
  },
  {
    q: 'Will you stay with me forever? 💍',
    sub: 'forever is a long time. slay.',
    mood: 'happy',
    yes: 'ofc',
    no: 'no'
  }
]

const SPRING = { type: 'spring', stiffness: 260, damping: 30, mass: 0.9 }

/* gradient-clipped text would flatten emoji into silhouettes, so emoji
   are split out and painted with their own colors */
const EMOJI_SPLIT = /(\p{Extended_Pictographic}(?:\uFE0F|\u200D\p{Extended_Pictographic})*)/gu
const IS_EMOJI = /^\p{Extended_Pictographic}/u

function Rich({ text }) {
  return text
    .split(EMOJI_SPLIT)
    .filter(Boolean)
    .map((chunk, i) =>
      IS_EMOJI.test(chunk) ? (
        <span className="emoji" key={i}>
          {chunk}
        </span>
      ) : (
        <span key={i}>{chunk}</span>
      )
    )
}

/* ------------------------------------------------------------------ */
/*  Background: parallax orbs that react to pointer / tilt             */
/* ------------------------------------------------------------------ */

function Background({ intensity }) {
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const px = useSpring(mx, { stiffness: 60, damping: 20 })
  const py = useSpring(my, { stiffness: 60, damping: 20 })
  const tx = useTransform(px, (v) => v * 26)
  const ty = useTransform(py, (v) => v * 26)

  useEffect(() => {
    const onMove = (e) => {
      mx.set((e.clientX / window.innerWidth - 0.5) * 2)
      my.set((e.clientY / window.innerHeight - 0.5) * 2)
    }
    const onTilt = (e) => {
      if (e.gamma == null) return
      mx.set(Math.max(-1, Math.min(1, e.gamma / 35)))
      my.set(Math.max(-1, Math.min(1, (e.beta - 45) / 45)))
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('deviceorientation', onTilt)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('deviceorientation', onTilt)
    }
  }, [mx, my])

  return (
    <motion.div className="bg" style={{ x: tx, y: ty }}>
      <motion.div
        className="orb a"
        animate={{ x: [0, 26, -14, 0], y: [0, -22, 16, 0], scale: [1, 1.1 + intensity * 0.03, 1] }}
        transition={{ duration: 18 - intensity, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="orb b"
        animate={{ x: [0, -30, 18, 0], y: [0, 20, -18, 0], scale: [1, 1.14 + intensity * 0.03, 1] }}
        transition={{ duration: 21 - intensity, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="orb c"
        animate={{ x: [0, 20, -24, 0], y: [0, -16, 12, 0], scale: [1, 1.12, 1] }}
        transition={{ duration: 24 - intensity, repeat: Infinity, ease: 'easeInOut' }}
      />
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/*  Finale                                                             */
/* ------------------------------------------------------------------ */

function Finale() {
  const line1 = 'HEHE I KNEW IT 💗'
  const line2 = "You're stuck with me now 😈💜"

  // a rolling 5 second celebration buzz as the scene lands
  useEffect(() => {
    celebrate(5)
    return stopBuzz
  }, [])

  return (
    <>
      <Bubbles active onPop={() => buzz(12)} />
      <HeartRain count={18} behind />
      <motion.div
        className="final"
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ ...SPRING, delay: 0.1 }}
      >
        <div className="scrim" />
        <NikkoStage mood="win" step={4} big />

        <motion.h1 className="big" style={{ marginTop: 14 }}>
          {line1.split(' ').map((word, i) => (
            <motion.span
              key={i}
              className={IS_EMOJI.test(word) ? 'emoji' : undefined}
              style={{ marginRight: '0.28em' }}
              initial={{ opacity: 0, y: 34, rotateX: -70, filter: 'blur(10px)' }}
              animate={{ opacity: 1, y: 0, rotateX: 0, filter: 'blur(0px)' }}
              transition={{
                type: 'spring',
                stiffness: 240,
                damping: 18,
                delay: 0.42 + i * 0.09
              }}
            >
              {word}
            </motion.span>
          ))}
        </motion.h1>

        <motion.p
          className="small"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...SPRING, delay: 0.95 }}
        >
          {line2}
        </motion.p>

        <motion.div
          className="tap-hint"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.7, 0.35, 0.7] }}
          transition={{ delay: 1.5, duration: 4, repeat: Infinity }}
        >
          tap the bubbles ✨
        </motion.div>

      </motion.div>
    </>
  )
}

/* ------------------------------------------------------------------ */
/*  App                                                                */
/* ------------------------------------------------------------------ */

export default function App() {
  const [phase, setPhase] = useState('intro') // intro | quiz | final
  const [step, setStep] = useState(0)
  const [bursts, setBursts] = useState([])
  const [flash, setFlash] = useState(0)
  const burstId = useRef(0)

  const burst = useCallback((count = 18) => {
    const id = ++burstId.current
    setBursts((b) => [...b, { id, count }])
    setTimeout(() => setBursts((b) => b.filter((x) => x.id !== id)), 2400)
  }, [])

  const onYes = useCallback(() => {
    buzz(12)
    burst(14 + step * 5)
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1)
    } else {
      setFlash((f) => f + 1)
      buzz([18, 40, 26])
      setTimeout(() => setPhase('final'), 220)
    }
  }, [step, burst])

  const current = STEPS[step]

  return (
    <div className="stage">
      <Background intensity={phase === 'final' ? 6 : step} />
      <div className="vignette" />
      <div className="grain" />

      <AnimatePresence mode="wait">
        {phase === 'intro' && (
          <motion.div
            key="intro"
            className="content"
            style={{ justifyContent: 'center' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.06, filter: 'blur(12px)' }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="center">
              <StepFX step={0} />
              <NikkoStage mood="peek" step={0} />
              <motion.h1
                className="intro-title"
                style={{ marginTop: 18 }}
                initial={{ opacity: 0, y: 24, filter: 'blur(10px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ ...SPRING, delay: 0.25 }}
              >
                <Rich text="hi baby 💜" />
              </motion.h1>
              <motion.p
                className="sub"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...SPRING, delay: 0.42 }}
              >
                five little questions. no wrong answers.
                <br />
                (well… one wrong answer.)
              </motion.p>
              <motion.button
                className="btn yes"
                style={{ marginTop: 26, flex: 'none', padding: '16px 40px' }}
                onClick={() => {
                  buzz(10)
                  setPhase('quiz')
                }}
                initial={{ opacity: 0, y: 18, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ ...SPRING, delay: 0.58 }}
                whileTap={{ scale: 0.95 }}
              >
                Begin ✨
              </motion.button>
            </div>
          </motion.div>
        )}

        {phase === 'quiz' && (
          <motion.div
            key="quiz"
            className="content"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.08, filter: 'blur(14px)' }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="progress">
              {STEPS.map((_, i) => (
                <div className="pip" key={i}>
                  <motion.span
                    initial={false}
                    animate={{ scaleX: i < step ? 1 : i === step ? 0.5 : 0 }}
                    transition={SPRING}
                  />
                </div>
              ))}
            </div>

            <div className="center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`fx-${step}`}
                  style={{ position: 'absolute', inset: 0 }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.45 }}
                >
                  <StepFX step={step} />
                </motion.div>
              </AnimatePresence>

              <AnimatePresence mode="wait">
                <NikkoStage key={step} mood={current.mood} step={step} />
              </AnimatePresence>

              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  className="card"
                  style={{ marginTop: 22 }}
                  initial={{ opacity: 0, y: 40, scale: 0.94, filter: 'blur(12px)' }}
                  animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -26, scale: 0.96, filter: 'blur(10px)' }}
                  transition={{ type: 'spring', stiffness: 240, damping: 26, mass: 0.9 }}
                >
                  <div className="eyebrow">
                    Question {step + 1} of {STEPS.length}
                  </div>
                  <h2 className="question">
                    <Rich text={current.q} />
                  </h2>
                  <p className="sub">{current.sub}</p>

                  <Answers
                    step={step}
                    yesLabel={current.yes}
                    noLabel={current.no}
                    onYes={onYes}
                  />
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {phase === 'final' && <Finale key="final" />}
      </AnimatePresence>

      {bursts.map((b) => (
        <HeartBurst key={b.id} id={b.id} count={b.count} x={50} y={58} />
      ))}

      <AnimatePresence>
        {flash > 0 && phase !== 'final' && (
          <motion.div
            key={flash}
            className="flash"
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: [0, 0.9, 0], scale: [0.6, 1.6, 2] }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
