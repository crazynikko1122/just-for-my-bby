/**
 * Buzz the phone.
 *
 * Android / Chrome: navigator.vibrate, which takes a [on, off, on, …] pattern.
 * iOS Safari has no Vibration API at all, but since 17.4 it plays a system
 * haptic when a `switch`-styled checkbox toggles — so we fall back to ticking
 * a hidden switch. Best effort: on older iOS this simply does nothing.
 */

const canVibrate = () => typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function'

let switchEl = null
function tickSwitch() {
  if (!switchEl) {
    const label = document.createElement('label')
    label.style.cssText = 'position:fixed;top:0;left:0;width:0;height:0;opacity:0;pointer-events:none'
    const input = document.createElement('input')
    input.type = 'checkbox'
    input.setAttribute('switch', '')
    label.appendChild(input)
    document.body.appendChild(label)
    switchEl = label
  }
  switchEl.click()
}

let fallbackTimer = null

/** One short tap. */
export function buzz(ms = 14) {
  if (canVibrate()) navigator.vibrate(ms)
  else tickSwitch()
}

/** A rolling celebration buzz lasting roughly `seconds`. */
export function celebrate(seconds = 5) {
  if (canVibrate()) {
    const pattern = []
    let total = 0
    while (total < seconds * 1000) {
      const on = 55 + Math.round(Math.random() * 75)
      const off = 85 + Math.round(Math.random() * 130)
      pattern.push(on, off)
      total += on + off
    }
    navigator.vibrate(pattern)
    return () => navigator.vibrate(0)
  }

  // iOS: tick the hidden switch on a timer instead
  const stopAt = Date.now() + seconds * 1000
  clearInterval(fallbackTimer)
  fallbackTimer = setInterval(() => {
    if (Date.now() > stopAt) return clearInterval(fallbackTimer)
    tickSwitch()
  }, 320)
  return () => clearInterval(fallbackTimer)
}

export function stopBuzz() {
  if (canVibrate()) navigator.vibrate(0)
  clearInterval(fallbackTimer)
}
