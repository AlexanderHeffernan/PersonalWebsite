import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Fade-up reveal on scroll. Call in onMounted with a ref to the element.
 * Optionally pass a selector to target children (with stagger).
 */
export function useScrollReveal(
  el: Ref<HTMLElement | null>,
  options: {
    children?: string
    y?: number
    duration?: number
    stagger?: number
    delay?: number
  } = {},
) {
  const { children, y = 30, duration = 0.6, stagger = 0, delay = 0 } = options

  onMounted(() => {
    if (!el.value || prefersReducedMotion()) return

    const targets = children ? el.value.querySelectorAll(children) : el.value

    gsap.set(targets, { opacity: 0, y })

    gsap.to(targets, {
      opacity: 1,
      y: 0,
      duration,
      stagger,
      delay,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: el.value,
        start: 'top 85%',
        once: true,
      },
    })
  })

  onBeforeUnmount(() => {
    ScrollTrigger.getAll().forEach((t) => {
      if (t.trigger === el.value) t.kill()
    })
  })
}

export { gsap, ScrollTrigger, prefersReducedMotion }
