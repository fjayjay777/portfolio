/** Case studies in display order; the footer walks this list to pick "next". */
export const caseOrder = [
  { name: 'Claimly', category: 'Financial clarity', path: '/work/claimly' },
  { name: 'Medisync', category: 'Healthcare access', path: '/work/medisync' },
  { name: 'Sizzle', category: 'Food discovery', path: '/work/sizzle' },
] as const

export type CaseName = (typeof caseOrder)[number]['name']
