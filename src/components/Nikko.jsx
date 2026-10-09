import { memo } from 'react'
import { motion } from 'framer-motion'

/**
 * Nikko — the little hooded troublemaker who hosts the quiz.
 * `mood` swaps the eyes / mouth so she reacts differently on every step.
 * moods: peek | sus | plead | love | happy | win
 */

const EYE_L = 79
const EYE_R = 121
const EYE_Y = 116

function Eyes({ mood }) {
  const shine = (cx, cy) => (
    <g key={cx}>
      <circle cx={cx - 3.2} cy={cy - 5} r="3.6" fill="#fff" opacity=".95" />
      <circle cx={cx + 3.4} cy={cy + 3.8} r="1.8" fill="#fff" opacity=".7" />
    </g>
  )

  if (mood === 'love') {
    const heart = (x, y, k = 1) => (
      <path
        key={x}
        transform={`translate(${x} ${y}) scale(${k})`}
        d="M0,10 C-12,1 -11,-9 -4,-9 C-1.4,-9 0,-7 0,-5.6 C0,-7 1.4,-9 4,-9 C11,-9 12,1 0,10 Z"
        fill="#ff5fae"
      />
    )
    return (
      <g>
        {heart(EYE_L, EYE_Y, 1.15)}
        {heart(EYE_R, EYE_Y, 1.15)}
        <circle cx={EYE_L - 4} cy={EYE_Y - 5} r="2.2" fill="#fff" opacity=".9" />
        <circle cx={EYE_R - 4} cy={EYE_Y - 5} r="2.2" fill="#fff" opacity=".9" />
      </g>
    )
  }

  if (mood === 'sus') {
    return (
      <g>
        <g clipPath="url(#k-lid)">
          <ellipse cx={EYE_L} cy={EYE_Y} rx="10.5" ry="13" fill="#14101c" />
          <ellipse cx={EYE_R} cy={EYE_Y} rx="10.5" ry="13" fill="#14101c" />
          {shine(EYE_L, EYE_Y + 4)}
          {shine(EYE_R, EYE_Y + 4)}
        </g>
        <path
          d={`M${EYE_L - 12},${EYE_Y - 4} q12,-6 24,-1`}
          stroke="#14101c"
          strokeWidth="3.2"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d={`M${EYE_R - 12},${EYE_Y - 5} q12,-5 24,1`}
          stroke="#14101c"
          strokeWidth="3.2"
          fill="none"
          strokeLinecap="round"
        />
      </g>
    )
  }

  if (mood === 'happy' || mood === 'win') {
    return (
      <g stroke="#14101c" strokeWidth="5" fill="none" strokeLinecap="round">
        <path d={`M${EYE_L - 11},${EYE_Y + 3} q11,-14 22,0`} />
        <path d={`M${EYE_R - 11},${EYE_Y + 3} q11,-14 22,0`} />
      </g>
    )
  }

  // peek + plead: big glossy eyes
  const ry = mood === 'plead' ? 15 : 13
  return (
    <g>
      <ellipse cx={EYE_L} cy={EYE_Y} rx="11" ry={ry} fill="#14101c" />
      <ellipse cx={EYE_R} cy={EYE_Y} rx="11" ry={ry} fill="#14101c" />
      {shine(EYE_L, EYE_Y)}
      {shine(EYE_R, EYE_Y)}
      {mood === 'plead' && (
        <g fill="#fff" opacity=".5">
          <ellipse cx={EYE_L + 4} cy={EYE_Y + 7} rx="2.8" ry="3.6" />
          <ellipse cx={EYE_R + 4} cy={EYE_Y + 7} rx="2.8" ry="3.6" />
        </g>
      )}
    </g>
  )
}

function Mouth({ mood }) {
  if (mood === 'win' || mood === 'happy')
    return (
      <g>
        <path d="M88,134 q12,17 24,0 z" fill="#3a1030" />
        <path d="M92,139 q8,8 16,0 z" fill="#ff6fb4" />
      </g>
    )
  if (mood === 'love')
    return (
      <path
        d="M90,135 q10,11 20,0"
        stroke="#3a1030"
        strokeWidth="3.6"
        fill="none"
        strokeLinecap="round"
      />
    )
  if (mood === 'sus')
    return (
      <path
        d="M89,139 q11,-6 22,1"
        stroke="#3a1030"
        strokeWidth="3.4"
        fill="none"
        strokeLinecap="round"
      />
    )
  if (mood === 'plead')
    return (
      <path
        d="M92,141 q8,-9 16,0"
        stroke="#3a1030"
        strokeWidth="3.4"
        fill="none"
        strokeLinecap="round"
      />
    )
  // signature smirk
  return (
    <path
      d="M87,135 q7,7 13,0 q6,7 13,-1"
      stroke="#3a1030"
      strokeWidth="3.4"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  )
}

function Nikko({ mood = 'peek', className = '' }) {
  return (
    <svg viewBox="0 0 200 210" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="k-hood" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#40304f" />
          <stop offset="0.5" stopColor="#241830" />
          <stop offset="1" stopColor="#150e1e" />
        </linearGradient>
        <radialGradient id="k-face" cx="38%" cy="28%">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#e9e0f5" />
        </radialGradient>
        <linearGradient id="k-skull" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffd0ea" />
          <stop offset="1" stopColor="#ff7dbf" />
        </linearGradient>
        <clipPath id="k-lid">
          <rect x="0" y={EYE_Y - 4} width="200" height="70" />
        </clipPath>
      </defs>

      {/* drooping hood flaps */}
      <path
        d="M44,92 C22,96 6,124 10,158 C12,176 27,180 35,167 C45,149 49,116 47,98 Z"
        fill="url(#k-hood)"
      />
      <path
        d="M156,92 C178,96 194,124 190,158 C188,176 173,180 165,167 C155,149 151,116 153,98 Z"
        fill="url(#k-hood)"
      />

      {/* hood dome */}
      <path
        d="M28,112 C22,46 56,20 100,20 C144,20 178,46 172,112 C156,82 132,70 100,70 C68,70 44,82 28,112 Z"
        fill="url(#k-hood)"
      />
      {/* jester twist on top */}
      <path
        d="M88,36 C84,12 98,-2 113,4 C127,10 125,27 112,28 C120,19 114,9 105,12 C97,15 98,26 101,38 Z"
        fill="url(#k-hood)"
      />

      {/* face */}
      <ellipse cx="100" cy="122" rx="52" ry="46" fill="url(#k-face)" />

      {/* hood brim over the forehead */}
      <path
        d="M30,110 C40,74 64,58 100,58 C136,58 160,74 170,110 C152,92 124,86 100,86 C76,86 48,92 30,110 Z"
        fill="url(#k-hood)"
      />
      <path
        d="M36,104 C47,78 68,66 100,66 C132,66 153,78 164,104"
        stroke="rgba(255,255,255,0.09)"
        strokeWidth="2"
        fill="none"
      />

      {/* pink skull badge */}
      <g transform="translate(100 50)">
        <ellipse rx="16" ry="14.5" fill="url(#k-skull)" />
        <path d="M-8.5,10 h17 a3,3 0 0 1 0,6 h-17 a3,3 0 0 1 0,-6 z" fill="url(#k-skull)" />
        <ellipse cx="-5.6" cy="-1" rx="4.2" ry="4.8" fill="#2a1030" />
        <ellipse cx="5.6" cy="-1" rx="4.2" ry="4.8" fill="#2a1030" />
        <path d="M-2.6,8 h5.2 M-1,12 v3 M2,12 v3" stroke="#2a1030" strokeWidth="2" strokeLinecap="round" />
      </g>

      {/* blush */}
      <ellipse cx="62" cy="137" rx="11.5" ry="6.2" fill="#ff8fd0" opacity=".5" />
      <ellipse cx="138" cy="137" rx="11.5" ry="6.2" fill="#ff8fd0" opacity=".5" />

      <Eyes mood={mood} />
      <ellipse cx="100" cy="128" rx="3.4" ry="2.6" fill="#3a1030" />
      <Mouth mood={mood} />
    </svg>
  )
}

/* A different way of arriving on every step ------------------------- */
const ENTRANCES = [
  {
    // 1 · rises out of the dark
    initial: { opacity: 0, scale: 0.5, y: 70, filter: 'blur(16px)' },
    animate: { opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' },
    transition: { type: 'spring', stiffness: 180, damping: 15, mass: 0.9 }
  },
  {
    // 2 · slides in sideways, side-eye first
    initial: { opacity: 0, x: -190, rotate: -22, scale: 0.85 },
    animate: { opacity: 1, x: 0, rotate: 0, scale: 1 },
    transition: { type: 'spring', stiffness: 150, damping: 14 }
  },
  {
    // 3 · rushes at you out of focus
    initial: { opacity: 0, scale: 1.9, filter: 'blur(22px)' },
    animate: { opacity: 1, scale: 1, filter: 'blur(0px)' },
    transition: { type: 'spring', stiffness: 210, damping: 22 }
  },
  {
    // 4 · card flip
    initial: { opacity: 0, rotateY: 105, scale: 0.8 },
    animate: { opacity: 1, rotateY: 0, scale: 1 },
    transition: { type: 'spring', stiffness: 130, damping: 13 }
  },
  {
    // 5 · drops from above and bounces
    initial: { opacity: 0, y: -190, rotate: 25, scale: 0.7 },
    animate: { opacity: 1, y: 0, rotate: 0, scale: 1 },
    transition: { type: 'spring', stiffness: 320, damping: 11, mass: 1.1 }
  }
]

/* …and a different way of standing there once she lands ------------- */
const IDLES = [
  { anim: { y: [0, -12, 0], rotate: [-2, 2, -2] }, dur: 3.6 }, // 1 · drift
  { anim: { x: [-12, 12, -12], rotate: [-6, 6, -6] }, dur: 2.8 }, // 2 · scanning sway
  { anim: { y: [0, -7, 0], scale: [1, 1.03, 1] }, dur: 1.5 }, // 3 · nervous breathing
  { anim: { scale: [1, 1.09, 1, 1.06, 1] }, dur: 1.5 }, // 4 · heartbeat
  {
    // 5 · hopping
    anim: { y: [0, -30, 0, -12, 0], rotate: [0, -5, 0, 4, 0] },
    dur: 1.5
  }
]

/** Nikko: a distinct entrance + idle per step, plus the per-mood face. */
export function NikkoStage({ mood = 'peek', step = 0, big = false }) {
  const entrance = ENTRANCES[Math.min(step, ENTRANCES.length - 1)]
  const idle = IDLES[Math.min(step, IDLES.length - 1)]
  const tremble = step === 2

  return (
    <motion.div
      className="nikko-wrap"
      style={big ? { width: 'min(56vw, 250px)' } : undefined}
      initial={entrance.initial}
      animate={entrance.animate}
      exit={{ opacity: 0, scale: 0.72, y: -34, filter: 'blur(10px)' }}
      transition={entrance.transition}
    >
      <motion.div
        className="halo"
        animate={{ opacity: [0.55, 0.95, 0.55], scale: [0.94, 1.06, 0.94] }}
        transition={{ duration: 3.4 - step * 0.3, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        style={{ width: '100%' }}
        animate={idle.anim}
        transition={{ duration: idle.dur, repeat: Infinity, ease: 'easeInOut' }}
      >
        {/* step 3 gets an extra high-frequency shiver on top of the idle */}
        <motion.div
          animate={tremble ? { x: [-1.6, 1.6, -1.6], rotate: [-0.8, 0.8, -0.8] } : undefined}
          transition={tremble ? { duration: 0.22, repeat: Infinity, ease: 'linear' } : undefined}
        >
          <Nikko mood={mood} />
        </motion.div>
      </motion.div>
    </motion.div>
  )
}

export default memo(Nikko)
