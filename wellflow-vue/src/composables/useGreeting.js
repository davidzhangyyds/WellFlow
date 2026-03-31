export function useGreeting() {
  function greeting() {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 18) return 'Good afternoon'
    return 'Good evening'
  }

  function fmtDate(iso) {
    if (!iso) return ''
    return new Date(iso).toLocaleDateString('en-CA', { month: 'short', day: 'numeric' })
  }

  const CAT_META = {
    sport:     { icon: '🏃', label: 'Sport',     cls: 'sport'     },
    mental:    { icon: '🧘', label: 'Mental',    cls: 'mental'    },
    hydration: { icon: '💧', label: 'Hydration', cls: 'hydration' },
    sleep:     { icon: '😴', label: 'Sleep',     cls: 'sleep'     },
    nutrition: { icon: '🥗', label: 'Nutrition', cls: 'nutrition' },
    break:     { icon: '📵', label: 'Break',     cls: 'break-'    },
  }

  return { greeting, fmtDate, CAT_META }
}
