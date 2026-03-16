<script setup lang="ts">
interface GitHubActivity {
  isActive: boolean
  lastCommit: {
    message: string
    hoursAgo: number
    timeText: string
    url: string
  } | null
  weekCommits: number
  streak: number
  languages: Record<string, number>
  currentRepo: string | null
  timeOfDay: 'morning' | 'office' | 'evening' | 'night' | 'sleep'
}

const { data: activity } = await useFetch<GitHubActivity>('/api/github/activity')

const mediaRef = ref<HTMLElement | null>(null)
const heroRef = ref<HTMLElement | null>(null)

let rafId: number | null = null
let tl: gsap.core.Timeline | null = null
let titleLoop: gsap.core.Timeline | null = null
let visibilityHandler: (() => void) | null = null
let targetX = 0
let targetY = 0
let currentX = 0
let currentY = 0

const setDefaults = () => {
  const el = mediaRef.value
  if (!el) return
  targetX = 0
  targetY = 0
  el.style.setProperty('--glow-opacity', '0.9')
  el.style.setProperty('--glow-brightness', '1.15')
}

const animate = () => {
  const el = mediaRef.value
  if (!el) return
  const ease = 0.08
  currentX += (targetX - currentX) * ease
  currentY += (targetY - currentY) * ease
  el.style.setProperty('--tilt-x', `${currentX}deg`)
  el.style.setProperty('--tilt-y', `${currentY}deg`)
  rafId = requestAnimationFrame(animate)
}

const handleMove = (event: PointerEvent) => {
  const el = mediaRef.value
  if (!el) return
  const rect = el.getBoundingClientRect()
  const x = (event.clientX - rect.left) / rect.width
  const y = (event.clientY - rect.top) / rect.height
  targetX = (0.5 - y) * 12
  targetY = (x - 0.5) * 12
  el.style.setProperty('--glow-opacity', '1')
  el.style.setProperty('--glow-brightness', '1.7')
}

const handleEnter = () => {
  const el = mediaRef.value
  if (!el) return
  el.style.setProperty('--glow-opacity', '1')
  el.style.setProperty('--glow-brightness', '1.7')
}

const handleLeave = () => {
  setDefaults()
}

onMounted(() => {
  setDefaults()
  const el = mediaRef.value
  if (!el) return
  el.addEventListener('pointermove', handleMove)
  el.addEventListener('pointerenter', handleEnter)
  el.addEventListener('pointerleave', handleLeave)
  rafId = requestAnimationFrame(animate)
  if (!prefersReducedMotion() && heroRef.value) {
    const ctx = heroRef.value

    // initial states
    gsap.set(ctx.querySelectorAll('.hero__eyebrow'), { opacity: 0, y: -12 })
    gsap.set(ctx.querySelectorAll('.hero__title-phrase--name'), {
      opacity: 0,
      x: 0,
      filter: 'blur(1px)',
      clipPath: 'inset(0 100% 0 0)',
    })
    gsap.set(ctx.querySelectorAll('.hero__title-phrase--quality'), {
      opacity: 0,
      x: 0,
      filter: 'blur(1px)',
      clipPath: 'inset(0 100% 0 0)',
    })
    gsap.set(ctx.querySelectorAll('.hero__subtitle'), { opacity: 0, y: 18 })
    gsap.set(ctx.querySelectorAll('.hero__actions .btn'), { opacity: 0, y: 18, scale: 0.98 })
    gsap.set(ctx.querySelectorAll('.hero__meta'), { opacity: 0, y: 10 })
    gsap.set(ctx.querySelectorAll('.hero__media'), { opacity: 0, scale: 0.98 })
    gsap.set(ctx.querySelectorAll('.hero__glow'), { opacity: 0, scale: 0.8 })

    // Bold, cinematic timeline
    tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

    // backdrop glow entrance
    tl.to(ctx.querySelectorAll('.hero__glow'), { opacity: 1, scale: 1.15, duration: 1.2 }, 0)

    // media (headshot) pops in with slight overshoot
    tl.to(ctx.querySelectorAll('.hero__media'), { opacity: 1, scale: 1, duration: 0.9, ease: 'back.out(1.2)' }, 0.05)

    // eyebrow slide-in
    tl.to(ctx.querySelectorAll('.hero__eyebrow'), { opacity: 1, y: 0, duration: 0.45 }, 0.12)

    // title entrance (starts with the name)
    tl.to(
      ctx.querySelectorAll('.hero__title-phrase--name'),
      {
        opacity: 1,
        x: 0,
        filter: 'blur(0px)',
        clipPath: 'inset(0 0% 0 0)',
        duration: 0.72,
        ease: 'power2.out',
      },
      0.25,
    )

    // subtitle and actions
    tl.to(ctx.querySelectorAll('.hero__subtitle'), { opacity: 1, y: 0, duration: 0.5 }, 1.05)
    tl.to(ctx.querySelectorAll('.hero__actions .btn'), { opacity: 1, y: 0, scale: 1, duration: 0.45, stagger: 0.08 }, 1.2)

    // meta line
    tl.to(ctx.querySelectorAll('.hero__meta'), { opacity: 1, y: 0, duration: 0.45 }, 1.5)

    // gentle glow breathing loop (keeps subtle motion after entrance)
    gsap.to(ctx.querySelectorAll('.hero__glow'), { scale: 1.05, duration: 6, yoyo: true, repeat: -1, ease: 'sine.inOut', delay: 1.6 })

    const namePhrase = ctx.querySelector('.hero__title-phrase--name')
    const qualityPhrase = ctx.querySelector('.hero__title-phrase--quality')
    const sweepLine = ctx.querySelector('.hero__title-sweep')

    if (namePhrase && qualityPhrase) {
      gsap.set(namePhrase, { opacity: 1, x: 0, filter: 'blur(0px)', clipPath: 'inset(0 0% 0 0)', zIndex: 2 })
      gsap.set(qualityPhrase, { opacity: 0, x: 0, filter: 'blur(1px)', clipPath: 'inset(0 100% 0 0)', zIndex: 1 })
      if (sweepLine) {
        gsap.set(sweepLine, { opacity: 0, xPercent: -120 })
      }

      titleLoop = gsap.timeline({ repeat: -1, repeatDelay: 0.2, delay: 1.8 })

      titleLoop
        .to({}, { duration: 3.6 })
        .call(() => {
          gsap.set(qualityPhrase, { opacity: 0, x: 0, filter: 'blur(1px)', clipPath: 'inset(0 100% 0 0)' })
          gsap.set(namePhrase, { opacity: 1, x: 0, filter: 'blur(0px)', clipPath: 'inset(0 0% 0 0)' })
          gsap.set(qualityPhrase, { zIndex: 3 })
          gsap.set(namePhrase, { zIndex: 2 })
        })
        .to(namePhrase, { opacity: 0, x: 4, filter: 'blur(1px)', duration: 0.3, ease: 'power2.inOut' }, 'swap-to-quality')
        .to(qualityPhrase, { opacity: 1, x: 0, filter: 'blur(0px)', clipPath: 'inset(0 0% 0 0)', duration: 0.3, ease: 'power2.out' }, 'swap-to-quality')
        .to(sweepLine, { opacity: 0.9, xPercent: 0, duration: 0.22, ease: 'power2.out' }, 'swap-to-quality')
        .to(sweepLine, { opacity: 0, xPercent: 110, duration: 0.2, ease: 'power1.in' }, 'swap-to-quality+=0.18')
        .set(namePhrase, { opacity: 0, x: 4, filter: 'blur(1px)', clipPath: 'inset(0 0% 0 100%)' }, 'swap-to-quality+=0.31')
        .set(qualityPhrase, { opacity: 1, x: 0, filter: 'blur(0px)', clipPath: 'inset(0 0% 0 0)' }, 'swap-to-quality+=0.31')
        .to({}, { duration: 3.6 })
        .call(() => {
          gsap.set(namePhrase, { opacity: 0, x: 0, filter: 'blur(1px)', clipPath: 'inset(0 100% 0 0)' })
          gsap.set(qualityPhrase, { opacity: 1, x: 0, filter: 'blur(0px)', clipPath: 'inset(0 0% 0 0)' })
          gsap.set(namePhrase, { zIndex: 3 })
          gsap.set(qualityPhrase, { zIndex: 2 })
        })
        .to(qualityPhrase, { opacity: 0, x: 4, filter: 'blur(1px)', duration: 0.3, ease: 'power2.inOut' }, 'swap-to-name')
        .to(namePhrase, { opacity: 1, x: 0, filter: 'blur(0px)', clipPath: 'inset(0 0% 0 0)', duration: 0.3, ease: 'power2.out' }, 'swap-to-name')
        .to(sweepLine, { opacity: 0.9, xPercent: 0, duration: 0.22, ease: 'power2.out' }, 'swap-to-name')
        .to(sweepLine, { opacity: 0, xPercent: 110, duration: 0.2, ease: 'power1.in' }, 'swap-to-name+=0.18')
        .set(qualityPhrase, { opacity: 0, x: 4, filter: 'blur(1px)', clipPath: 'inset(0 0% 0 100%)' }, 'swap-to-name+=0.31')
        .set(namePhrase, { opacity: 1, x: 0, filter: 'blur(0px)', clipPath: 'inset(0 0% 0 0)' }, 'swap-to-name+=0.31')

      visibilityHandler = () => {
        if (!titleLoop) return
        if (document.hidden) {
          titleLoop.pause()
        } else {
          titleLoop.resume()
        }
      }

      document.addEventListener('visibilitychange', visibilityHandler)
    }
  }
})

onBeforeUnmount(() => {
  const el = mediaRef.value
  if (el) {
    el.removeEventListener('pointermove', handleMove)
    el.removeEventListener('pointerenter', handleEnter)
    el.removeEventListener('pointerleave', handleLeave)
  }
  if (rafId !== null) cancelAnimationFrame(rafId)
  if (tl) {
    tl.kill()
    tl = null
  }
  if (titleLoop) {
    titleLoop.kill()
    titleLoop = null
  }
  if (visibilityHandler) {
    document.removeEventListener('visibilitychange', visibilityHandler)
    visibilityHandler = null
  }
})
</script>

<template>
  <section id="hero" ref="heroRef" class="hero grid-pattern">
    <div class="hero__container">
      <div class="hero__grid">
        <div class="hero__content">
          <div class="hero__eyebrow">
            <span>Software Engineer</span>
          </div>
          <h1 class="hero__title">
            <span class="sr-only">Alexander Heffernan</span>
            <span class="hero__title-rotator" aria-hidden="true">
              <span class="hero__title-phrase hero__title-phrase--name">
                <span class="hero__title-line">Alexander</span>
                <span class="hero__title-line hero__title-line--accent">Heffernan</span>
              </span>
              <span class="hero__title-phrase hero__title-phrase--quality">
                <span class="hero__title-line">Quality-first</span>
                <span class="hero__title-line hero__title-line--accent">engineering.</span>
              </span>
              <span class="hero__title-sweep" aria-hidden="true"></span>
            </span>
          </h1>
          <p class="hero__subtitle">
            Using AI to move fast — without cutting corners.
          </p>
          <div class="hero__actions">
            <a class="btn btn--primary" href="#projects">
              View Projects
            </a>
            <a class="btn btn--secondary" href="#contact">
              Contact
            </a>
            <a class="btn btn--secondary" href="/resume.pdf">
              Resume
            </a>
          </div>
          <div class="hero__meta">
            <ActivityTicker v-if="activity" :activity="activity" />
            <span v-else>Building quality software • One commit at a time</span>
          </div>
        </div>
        <div ref="mediaRef" class="hero__media">
          <div class="hero__glow" aria-hidden="true"></div>
          <div class="hero__frame-wrap">
            <div class="hero__frame">
              <img
                class="hero__image"
                src="/headshot.jpeg"
                alt="Alexander Heffernan headshot"
                draggable="false"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero {
  min-height: 100vh;
  display: flex;
  align-items: center;
  padding: 0 var(--space-6) var(--space-12);
}

.hero__container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
}

.hero__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-12);
  align-items: center;
}

.hero__content {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.hero__eyebrow {
  display: inline-flex;
  align-items: center;
  width: fit-content;
  padding: var(--space-1) var(--space-3);
  border: 1px solid var(--border);
  border-radius: 999px;
  background: var(--secondary);
  font-size: var(--text-sm);
  text-transform: uppercase;
  letter-spacing: 0.2em;
  color: var(--muted-foreground);
}

.hero__title {
  font-size: clamp(2.5rem, 4vw, 4rem);
  font-weight: var(--font-weight-bold);
  line-height: 1.02;
  letter-spacing: -0.02em;
  margin: 0;
}

.hero__title-rotator {
  position: relative;
  display: grid;
  min-height: 2.15em;
  overflow: hidden;
  padding-bottom: 0.14em;
}

.hero__title-phrase {
  grid-area: 1 / 1;
  display: flex;
  flex-direction: column;
  gap: 0.04em;
  will-change: opacity, transform, filter, clip-path;
  overflow: hidden;
}

.hero__title-sweep {
  grid-area: 1 / 1;
  align-self: end;
  height: 1px;
  width: 40%;
  margin-top: auto;
  background: linear-gradient(90deg, transparent 0%, color-mix(in srgb, var(--accent), #fff 8%) 40%, transparent 100%);
  opacity: 0;
  pointer-events: none;
  z-index: 4;
}

.hero__title-line {
  display: block;
}

.hero__title-line--accent {
  color: var(--accent);
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.hero__subtitle {
  font-size: clamp(1.05rem, 2vw, 1.4rem);
  color: var(--muted-foreground);
  max-width: 32rem;
  margin: 0;
  white-space: nowrap;
}

@media (max-width: 640px) {
  .hero__subtitle {
    white-space: normal;
  }
}

.hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-lg);
  font-weight: var(--font-weight-medium);
  border: 1px solid transparent;
  transition: transform 0.2s ease, color 0.2s ease, background 0.2s ease, border-color 0.2s ease;
}

.btn:hover {
  transform: translateY(-1px);
}

.btn--primary {
  background: var(--accent);
  color: var(--accent-foreground);
}

.btn--primary:hover {
  background: color-mix(in srgb, var(--accent), #000 10%);
}

.btn--secondary {
  background: var(--secondary);
  color: var(--foreground);
  border-color: var(--border);
}

.btn--secondary:hover {
  border-color: var(--accent);
}

.hero__meta {
  padding-top: var(--space-6);
  border-top: 1px solid var(--border);
  font-size: var(--text-sm);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted-foreground);
  width: 100%;
}

.hero__media {
  position: relative;
  display: flex;
  justify-content: center;
  perspective: 1000px;
  --tilt-x: 0deg;
  --tilt-y: 0deg;
  --glow-opacity: 0.9;
  --glow-brightness: 1.15;
  overflow: visible;
}

.hero__glow {
  position: absolute;
  inset: -10%;
  background: radial-gradient(
    circle at center,
    color-mix(in srgb, var(--accent), transparent 40%),
    transparent 70%
  );
  filter: blur(120px) brightness(var(--glow-brightness));
  border-radius: 50%;
  opacity: var(--glow-opacity);
  animation: glow-pulse 8s ease-in-out infinite;
  transition: opacity 0.35s ease, filter 0.35s ease;
  z-index: 0;
}

.hero__frame-wrap {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  transform-style: preserve-3d;
  will-change: transform;
  transform: rotateX(var(--tilt-x)) rotateY(var(--tilt-y));
}

.hero__frame-wrap::before {
  content: "";
  position: absolute;
  inset: -10px;
  border-radius: 34px;
  border: 1px solid color-mix(in srgb, var(--accent), transparent 60%);
  transform: translate3d(0, 0, -1px);
  opacity: 0.4;
  pointer-events: none;
  transition: border-color 0.35s ease, opacity 0.35s ease;
}

.hero__media:hover .hero__frame-wrap::before {
  border-color: color-mix(in srgb, var(--accent), transparent 35%);
  opacity: 0.75;
}

.hero__frame {
  position: relative;
  width: min(420px, 80vw);
  aspect-ratio: 1 / 1;
  border-radius: 24px;
  border: 2px solid var(--border);
  background: var(--secondary);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
  transform: translateZ(0);
}

.hero__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  user-select: none;
}

@keyframes glow-pulse {
  0%,
  100% {
    transform: scale(0.95);
  }
  50% {
    transform: scale(1.05);
  }
}

@media (max-width: 900px) {
  .hero__grid {
    grid-template-columns: 1fr;
    text-align: center;
    margin-top: 30px;
  }

  .hero__content {
    align-items: center;
  }

  .hero__actions {
    justify-content: center;
  }
  
  .hero__meta {
    display: none;
  }
}
</style>
