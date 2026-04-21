export const MAX_PARTICIPANTS = 200

// 31 mai 2026 23:59:59.999 en heure Africa/Porto-Novo / Africa/Lagos (UTC+1)
export const REGISTRATION_CLOSES_AT = new Date('2026-05-31T22:59:59.999Z')

export function isRegistrationOpen(now: Date, totalParticipants: number) {
  return now.getTime() <= REGISTRATION_CLOSES_AT.getTime() && totalParticipants < MAX_PARTICIPANTS
}
