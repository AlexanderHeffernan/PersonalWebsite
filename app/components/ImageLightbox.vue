<template>
  <Teleport to="body">
    <Transition name="lightbox-fade">
        <div v-if="show" class="lightbox-overlay" @click.self="close" role="dialog" aria-modal="true" aria-label="Image viewer">
          <div class="lightbox-content" @touchstart="onTouchStart" @touchend="onTouchEnd">
          <button ref="closeBtn" class="lightbox-close" @click.stop="close" aria-label="Close image viewer">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>

          <button class="lightbox-nav lightbox-nav--left" @click.stop="prev" aria-label="Previous image">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>

          <div class="lightbox-figure">
            <img :src="currentImage?.url" :alt="currentImage?.alt || 'Image'" />
          </div>

          <button class="lightbox-nav lightbox-nav--right" @click.stop="next" aria-label="Next image">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>

          <div class="lightbox-counter" aria-hidden="true">{{ current + 1 }} / {{ imagesLength }}</div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount, nextTick, computed } from 'vue'

type Img = { url: string; alt?: string | null }

const props = defineProps({
  images: { type: Array as () => Img[], default: () => [] },
  show: { type: Boolean, default: false },
  startIndex: { type: Number, default: 0 }
})

const emit = defineEmits(['update:show', 'update:index', 'close'])

const current = ref(props.startIndex)
const show = ref(props.show)

const imagesLength = computed(() => (props.images ? props.images.length : 0))
const currentImage = computed(() => {
  if (!props.images || imagesLength.value === 0) return null
  return props.images[Math.min(Math.max(0, current.value), imagesLength.value - 1)] ?? null
})

const closeBtn = ref<HTMLElement | null>(null)

let touchStartX = 0
let touchEndX = 0
const swipeThreshold = 50

function onTouchStart(e: TouchEvent) {
  const touch = e.changedTouches[0]
  if (touch) touchStartX = touch.clientX
}

function onTouchEnd(e: TouchEvent) {
  const touch = e.changedTouches[0]
  if (!touch) return
  touchEndX = touch.clientX
  const diff = touchStartX - touchEndX
  if (Math.abs(diff) >= swipeThreshold) {
    if (diff > 0) next()
    else prev()
  }
}

function prev() {
  if (imagesLength.value === 0) return
  current.value = (current.value - 1 + imagesLength.value) % imagesLength.value
  emit('update:index', current.value)
}

function next() {
  if (imagesLength.value === 0) return
  current.value = (current.value + 1) % imagesLength.value
  emit('update:index', current.value)
}

function close() {
  show.value = false
  emit('update:show', false)
  emit('close')
}

watch(() => props.startIndex, (v) => { current.value = Math.min(Math.max(0, v), Math.max(0, imagesLength.value - 1)) })
watch(() => props.show, async (v) => {
  show.value = v
  if (v) {
    await nextTick()
    closeBtn.value?.focus()
    addKeyListeners()
  } else {
    removeKeyListeners()
  }
})

function onKeydown(e: KeyboardEvent) {
  if (!show.value) return
  if (e.key === 'Escape') {
    e.preventDefault(); close()
  } else if (e.key === 'ArrowLeft') {
    e.preventDefault(); prev()
  } else if (e.key === 'ArrowRight') {
    e.preventDefault(); next()
  } else if (e.key === 'Tab') {
    // simple focus trap: keep focus on closeBtn
    e.preventDefault()
    closeBtn.value?.focus()
  }
}

function addKeyListeners() { window.addEventListener('keydown', onKeydown) }
function removeKeyListeners() { window.removeEventListener('keydown', onKeydown) }

onBeforeUnmount(() => removeKeyListeners())

onMounted(() => {
  // keep reactive in sync initially
  current.value = props.startIndex
  show.value = props.show
  if (show.value) addKeyListeners()
})

// prevent background scroll when lightbox is open
watch(() => show.value, (v) => {
  if (typeof window === 'undefined') return
  if (v) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})

onBeforeUnmount(() => {
  // ensure body overflow restored
  if (typeof window !== 'undefined') document.body.style.overflow = ''
})
</script>

<style scoped>
.lightbox-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0,0,0,0.6);
  backdrop-filter: blur(6px) saturate(120%);
  z-index: 10000;
  padding: 24px;
}

.lightbox-content {
  position: relative;
  display: inline-block;
  max-width: 96vw;
  max-height: 92vh;
  width: auto;
}

.lightbox-figure img {
  display: block;
  width: auto;
  height: auto;
  max-width: 100%;
  max-height: calc(100vh - 120px);
  object-fit: contain;
  border-radius: 8px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.6);
}

.lightbox-close {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  border: none;
  background: color-mix(in srgb, black, transparent 40%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 2;
}

.lightbox-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: none;
  background: color-mix(in srgb, black, transparent 30%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.15s ease, background 0.15s ease;
  z-index: 2;
}

.lightbox-nav--left { left: 12px }
.lightbox-nav--right { right: 12px }

.lightbox-content:hover .lightbox-nav { opacity: 1 }

@media (pointer: coarse) {
  .lightbox-nav { opacity: 1 }
}

.lightbox-counter {
  position: absolute;
  bottom: 14px;
  left: 50%;
  transform: translateX(-50%);
  color: rgba(255,255,255,0.9);
  font-size: 0.9rem;
  z-index: 2;
}

.lightbox-fade-enter-active, .lightbox-fade-leave-active { transition: opacity 0.18s ease }
.lightbox-fade-enter-from, .lightbox-fade-leave-to { opacity: 0 }
</style>
