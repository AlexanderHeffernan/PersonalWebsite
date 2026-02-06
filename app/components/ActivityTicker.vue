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

const props = defineProps<{
  activity: GitHubActivity
}>()

const currentMessage = ref('')
const currentIndex = ref(0)
const isTyping = ref(true)

const currentCommitUrl = computed(() => {
  const message = messages.value[currentIndex.value]
  if (message && message.includes('COMMITTED') && props.activity.lastCommit) {
    return props.activity.lastCommit.url
  }
  return null
})

const messageParts = computed(() => {
  const message = currentMessage.value
  if (!currentCommitUrl.value || !message.includes('"')) {
    return { prefix: message, link: null, suffix: null }
  }
  
  const quoteStart = message.indexOf('"')
  const quoteEnd = message.lastIndexOf('"')
  
  if (quoteStart === -1 || quoteEnd === -1 || quoteStart === quoteEnd) {
    return { prefix: message, link: null, suffix: null }
  }
  
  return {
    prefix: message.substring(0, quoteStart),
    link: message.substring(quoteStart, quoteEnd + 1),
    suffix: message.substring(quoteEnd + 1)
  }
})

const messages = computed(() => {
  const { activity } = props
  
  // Fallback for inactive periods
  if (!activity.isActive) {
    if (activity.lastCommit && activity.lastCommit.hoursAgo < 168) { // 7 days
      return ['🟡 BETWEEN SPRINTS • PLANNING THE NEXT BUILD']
    }
    return ['☕ ON BREAK • GREAT CODE NEEDS REST TOO']
  }

  // Active messages
  const msgs = []
  
  // 1. Activity status
  msgs.push(`🟢 ACTIVE TODAY • ${activity.weekCommits} COMMIT${activity.weekCommits !== 1 ? 'S' : ''} THIS WEEK`)
  
  // 2. Latest commit with dynamic time prefix
  if (activity.lastCommit) {
    const msg = activity.lastCommit.message.toUpperCase()
    const hours = activity.lastCommit.hoursAgo
    
    let prefix = '⚡ JUST COMMITTED:'
    if (hours >= 24) {
      const days = Math.floor(hours / 24)
      prefix = `⚡ COMMITTED ${days}D AGO:`
    } else if (hours >= 2) {
      prefix = `⚡ COMMITTED ${Math.floor(hours)}H AGO:`
    } else if (hours >= 1) {
      prefix = '⚡ COMMITTED 1H AGO:'
    }
    
    msgs.push(`${prefix} "${msg}"`)
  }
  
  // 3. Language breakdown
  const langs = Object.entries(activity.languages)
  if (langs.length > 0) {
    // Sort by percentage descending and take top 3 to prevent wrapping
    const topLangs = langs
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([lang, pct]) => `${lang.toUpperCase()} ${pct}%`)
      .join(' • ')
    msgs.push(`💻 THIS WEEK: ${topLangs}`)
  }
  
  // 4. Streak
  if (activity.streak > 1) {
    msgs.push(`🔥 ON A ${activity.streak}-DAY STREAK • MOMENTUM BUILDING`)
  }
  
  // 5. Time of day message
  const timeMessages = {
    morning: '🌅 MORNING MODE • FRESH START',
    office: '☀️ OFFICE HOURS • PROBABLY DEBUGGING SOMETHING',
    evening: '🌆 EVENING SESSION • IN THE FLOW',
    night: '🌙 NIGHT OWL MODE • BEST CODE HAPPENS NOW',
    sleep: '😴 OFFLINE • HUMANS NEED SLEEP TOO',
  }
  msgs.push(timeMessages[activity.timeOfDay])
  
  return msgs
})

const typewriterSpeed = 50 // ms per character
const pauseBetweenMessages = 3000 // ms

let typewriterTimeout: NodeJS.Timeout | null = null

const typeMessage = () => {
  const message = messages.value[currentIndex.value]
  if (!message) return
  
  let charIndex = 0
  
  const typeChar = () => {
    if (charIndex < message.length) {
      currentMessage.value = message.substring(0, charIndex + 1)
      charIndex++
      typewriterTimeout = setTimeout(typeChar, typewriterSpeed)
    } else {
      // Message complete, wait then move to next
      isTyping.value = false
      typewriterTimeout = setTimeout(() => {
        currentIndex.value = (currentIndex.value + 1) % messages.value.length
        currentMessage.value = ''
        isTyping.value = true
        typeMessage()
      }, pauseBetweenMessages)
    }
  }
  
  typeChar()
}

onMounted(() => {
  typeMessage()
})

onBeforeUnmount(() => {
  if (typewriterTimeout) {
    clearTimeout(typewriterTimeout)
  }
})

// Restart animation when activity data changes
watch(() => props.activity, () => {
  if (typewriterTimeout) {
    clearTimeout(typewriterTimeout)
  }
  currentIndex.value = 0
  currentMessage.value = ''
  isTyping.value = true
  typeMessage()
})
</script>

<template>
  <div class="activity-ticker">
    <template v-if="currentCommitUrl && messageParts.link">
      <span class="activity-ticker__text">{{ messageParts.prefix }}</span><a 
        :href="currentCommitUrl" 
        target="_blank" 
        rel="noopener noreferrer"
        class="activity-ticker__text activity-ticker__text--link"
      >{{ messageParts.link }}</a><span class="activity-ticker__text">{{ messageParts.suffix }}</span>
    </template>
    <span v-else class="activity-ticker__text">{{ currentMessage }}</span>
    <span v-if="isTyping" class="activity-ticker__cursor">▋</span>
  </div>
</template>

<style scoped>
.activity-ticker {
  display: inline-flex;
  align-items: center;
  min-height: 1.5em;
}

.activity-ticker__text {
  font-size: var(--text-sm, 0.875rem);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted-foreground);
  font-family: var(--font-mono, monospace);
  text-decoration: none;
  transition: color 0.2s ease;
}

.activity-ticker__text--link:hover {
  color: var(--accent);
  text-decoration: underline;
  cursor: pointer;
}

.activity-ticker__cursor {
  display: inline-block;
  margin-left: 2px;
  color: var(--accent);
  animation: blink 1s step-end infinite;
}

@keyframes blink {
  0%, 50% {
    opacity: 1;
  }
  50.01%, 100% {
    opacity: 0;
  }
}
</style>
