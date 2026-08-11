export const MAX_ORDERS = 52

export const AVATAR_COLORS = ['#F87171', '#FBBF24', '#34D399', '#60A5FA', '#A78BFA', '#F472B6']

export const hashString = (str: string) => {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

export const getPlaceholderCustomer = (customerId: string) => {
  const h = hashString(customerId || 'unknown')
  return {
    color: AVATAR_COLORS[h % AVATAR_COLORS.length],
  }
}

// ---- delivery stage progression (Active tab) -------------------------

export const STAGES = [
  { key: 'preparing', label: 'Preparing' },
  { key: 'in_transit', label: 'In Transit' },
  { key: 'delivered', label: 'Delivered' },
] as const

export type StageKey = typeof STAGES[number]['key']

// order.status is 'accepted' before any stage has been set, hence -1
export const getStageIndex = (status: string) => STAGES.findIndex((s) => s.key === status)
