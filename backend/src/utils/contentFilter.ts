const FORBIDDEN_KEYWORDS = [
  'violence', 'violent', 'tuer', 'meurtre', 'sang', 'gore',
  'sexe', 'pornographie', 'nudité', 'nu', 'adulte', '18+',
  'drogue', 'alcool excessif', 'arme à feu',
  'harcèlement', 'insulte', 'racisme', 'discrimination'
]

export const detectForbiddenContent = (title: string, description: string): boolean => {
  const text = `${title} ${description}`.toLowerCase()
  return FORBIDDEN_KEYWORDS.some(keyword => text.includes(keyword))
}

export const generateVerificationCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export const getCodeExpireTime = (): Date => {
  const now = new Date()
  now.setMinutes(now.getMinutes() + 15)
  return now
}
