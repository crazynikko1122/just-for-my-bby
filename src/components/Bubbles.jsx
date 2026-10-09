import { useEffect, useRef } from 'react'

/**
 * Live bubble field: bubbles expand from nothing, drift with buoyancy,
 * collide elastically with each other + the walls, and pop with a ring
 * shockwave and droplets (on their own, or wherever you tap).
 * Everything is drawn from a small set of cached sprites so it stays 60fps.
 */

const HUES = [318, 288, 262, 232, 342, 200]
const MAX_BUBBLES = 26

function makeSprite(hue) {
  const S = 256
  const c = document.createElement('canvas')
  c.width = c.height = S
  const g = c.getContext('2d')
  const r = S / 2

  // body
  const body = g.createRadialGradient(r * 0.68, r * 0.62, r * 0.06, r, r, r)
  body.addColorStop(0, `hsla(${hue}, 100%, 88%, 0.42)`)
  body.addColorStop(0.55, `hsla(${hue}, 100%, 72%, 0.16)`)
  body.addColorStop(0.86, `hsla(${hue}, 100%, 66%, 0.26)`)
  body.addColorStop(1, `hsla(${hue}, 100%, 78%, 0)`)
  g.fillStyle = body
  g.beginPath()
  g.arc(r, r, r * 0.98, 0, Math.PI * 2)
  g.fill()

  // rim
  g.strokeStyle = `hsla(${hue}, 100%, 85%, 0.55)`
  g.lineWidth = S * 0.012
  g.beginPath()
  g.arc(r, r, r * 0.93, 0, Math.PI * 2)
  g.stroke()

  // specular highlight
  const hi = g.createRadialGradient(r * 0.62, r * 0.5, 0, r * 0.62, r * 0.5, r * 0.34)
  hi.addColorStop(0, 'rgba(255,255,255,0.85)')
  hi.addColorStop(1, 'rgba(255,255,255,0)')
  g.fillStyle = hi
  g.beginPath()
  g.ellipse(r * 0.62, r * 0.5, r * 0.3, r * 0.22, -0.5, 0, Math.PI * 2)
  g.fill()

  // soft bottom bounce light
  const lo = g.createRadialGradient(r * 1.25, r * 1.4, 0, r * 1.25, r * 1.4, r * 0.5)
  lo.addColorStop(0, `hsla(${hue}, 100%, 90%, 0.35)`)
  lo.addColorStop(1, 'rgba(255,255,255,0)')
  g.fillStyle = lo
  g.beginPath()
  g.arc(r, r, r * 0.95, 0, Math.PI * 2)
  g.fill()

  return c
}

export default function Bubbles({ active = true, onPop }) {
  const ref = useRef(null)
  const onPopRef = useRef(onPop)
  onPopRef.current = onPop

  useEffect(() => {
    if (!active) return
    const canvas = ref.current
    const ctx = canvas.getContext('2d', { alpha: true })
    const sprites = HUES.map(makeSprite)
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let w = 0
    let h = 0
    let dpr = 1
    const bubbles = []
    const rings = []
    const drops = []

    const rand = (a, b) => a + Math.random() * (b - a)

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = canvas.clientWidth
      h = canvas.clientHeight
      canvas.width = Math.floor(w * dpr)
      canvas.height = Math.floor(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const spawn = (x, y) => {
      const target = rand(Math.min(w, h) * 0.055, Math.min(w, h) * 0.155)
      bubbles.push({
        x: x ?? rand(target, w - target),
        y: y ?? rand(h * 0.6, h + target),
        vx: rand(-0.28, 0.28),
        vy: rand(-0.5, -0.18),
        r: 1,
        target,
        s: rand(0.014, 0.03),
        hue: (Math.random() * HUES.length) | 0,
        life: rand(6.5, 13) * 60,
        spin: rand(-0.01, 0.01)
      })
    }

    const pop = (b) => {
      rings.push({ x: b.x, y: b.y, r: b.r * 0.9, max: b.r * 2.1, a: 0.85, hue: HUES[b.hue] })
      const n = 5 + ((Math.random() * 4) | 0)
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2 + Math.random()
        const sp = rand(1.4, 3.6)
        drops.push({
          x: b.x,
          y: b.y,
          vx: Math.cos(a) * sp,
          vy: Math.sin(a) * sp,
          r: rand(1.5, 3.6),
          a: 0.9,
          hue: HUES[b.hue]
        })
      }
    }

    const onTap = (e) => {
      const p = e.touches?.[0] ?? e
      const rect = canvas.getBoundingClientRect()
      const x = p.clientX - rect.left
      const y = p.clientY - rect.top
      for (let i = bubbles.length - 1; i >= 0; i--) {
        const b = bubbles[i]
        if (Math.hypot(b.x - x, b.y - y) < b.r * 1.15) {
          pop(b)
          bubbles.splice(i, 1)
          spawn()
          onPopRef.current?.()
          return
        }
      }
      // tapped empty space: blow a fresh bubble there
      if (bubbles.length < MAX_BUBBLES + 6) spawn(x, y)
    }

    resize()
    const count = reduce ? 10 : window.innerWidth < 420 ? 18 : MAX_BUBBLES
    for (let i = 0; i < count; i++) {
      spawn(rand(40, w - 40), rand(0, h))
      const b = bubbles[bubbles.length - 1]
      b.r = b.target * rand(0.4, 1) // pre-grown so the field starts full
    }

    let raf = 0
    let t = 0
    const step = () => {
      raf = requestAnimationFrame(step)
      t += 1
      ctx.clearRect(0, 0, w, h)
      ctx.globalCompositeOperation = 'lighter'

      // integrate
      for (let i = bubbles.length - 1; i >= 0; i--) {
        const b = bubbles[i]
        if (b.r < b.target) b.r += (b.target - b.r) * b.s + 0.35
        b.life -= 1

        b.vy -= 0.0075 + b.r * 0.00022 // buoyancy, bigger = floatier
        b.vx += Math.sin((t + i * 40) * 0.01) * 0.014 // drifting current
        b.vx *= 0.994
        b.vy *= 0.994
        b.x += b.vx
        b.y += b.vy

        // walls
        if (b.x - b.r < 0) {
          b.x = b.r
          b.vx = Math.abs(b.vx) * 0.82
        } else if (b.x + b.r > w) {
          b.x = w - b.r
          b.vx = -Math.abs(b.vx) * 0.82
        }
        if (b.y + b.r > h) {
          b.y = h - b.r
          b.vy = -Math.abs(b.vy) * 0.7
        }

        if (b.life <= 0 || b.y + b.r < -10) {
          if (b.y + b.r > 0) pop(b)
          bubbles.splice(i, 1)
          spawn()
        }
      }

      // bubble ↔ bubble collisions (elastic, mass ∝ r²)
      for (let i = 0; i < bubbles.length; i++) {
        const a = bubbles[i]
        for (let j = i + 1; j < bubbles.length; j++) {
          const b = bubbles[j]
          const dx = b.x - a.x
          const dy = b.y - a.y
          const d2 = dx * dx + dy * dy
          const min = a.r + b.r
          if (d2 > min * min || d2 === 0) continue
          const d = Math.sqrt(d2)
          const nx = dx / d
          const ny = dy / d
          const overlap = min - d
          const ma = a.r * a.r
          const mb = b.r * b.r
          const tm = ma + mb
          a.x -= nx * overlap * (mb / tm)
          a.y -= ny * overlap * (mb / tm)
          b.x += nx * overlap * (ma / tm)
          b.y += ny * overlap * (ma / tm)
          const rvx = b.vx - a.vx
          const rvy = b.vy - a.vy
          const sep = rvx * nx + rvy * ny
          if (sep > 0) continue
          const imp = (-1.72 * sep) / tm
          a.vx -= imp * mb * nx
          a.vy -= imp * mb * ny
          b.vx += imp * ma * nx
          b.vy += imp * ma * ny
        }
      }

      // draw bubbles
      for (const b of bubbles) {
        const s = sprites[b.hue]
        const d = b.r * 2
        ctx.drawImage(s, b.x - b.r, b.y - b.r, d, d)
      }

      // pop rings
      for (let i = rings.length - 1; i >= 0; i--) {
        const r = rings[i]
        r.r += (r.max - r.r) * 0.22 + 0.6
        r.a -= 0.055
        if (r.a <= 0) {
          rings.splice(i, 1)
          continue
        }
        ctx.strokeStyle = `hsla(${r.hue}, 100%, 82%, ${r.a})`
        ctx.lineWidth = 2.2
        ctx.beginPath()
        ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2)
        ctx.stroke()
      }

      // droplets
      for (let i = drops.length - 1; i >= 0; i--) {
        const p = drops[i]
        p.x += p.vx
        p.y += p.vy
        p.vy += 0.04
        p.vx *= 0.97
        p.vy *= 0.97
        p.a -= 0.026
        if (p.a <= 0) {
          drops.splice(i, 1)
          continue
        }
        ctx.fillStyle = `hsla(${p.hue}, 100%, 86%, ${p.a})`
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fill()
      }

      ctx.globalCompositeOperation = 'source-over'
    }

    raf = requestAnimationFrame(step)
    window.addEventListener('resize', resize)
    window.addEventListener('pointerdown', onTap, { passive: true })

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointerdown', onTap)
    }
  }, [active])

  if (!active) return null
  return <canvas ref={ref} className="bubbles" />
}
