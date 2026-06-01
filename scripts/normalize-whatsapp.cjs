const { PrismaClient } = require('@prisma/client')
const { config } = require('dotenv')

config({ path: '.env.local' })
config({ path: '.env' })

const prisma = new PrismaClient()

function normalizeWhatsAppNumber(input) {
  const value = String(input || '').trim()
  const match = value.match(/^\s*(?:\+?229[\s.-]*)?(?:0?1)(\d{8})\s*$/)
  if (!match) return null
  return `+229 01${match[1]}`
}

async function main() {
  const participants = await prisma.participant.findMany({
    select: { id: true, prenom: true, nom: true, whatsapp: true },
    orderBy: { createdAt: 'asc' },
  })

  const planned = []
  const conflicts = new Map()

  for (const participant of participants) {
    const normalized = normalizeWhatsAppNumber(participant.whatsapp)
    if (!normalized) {
      planned.push({
        id: participant.id,
        raw: participant.whatsapp,
        normalized: null,
        skipped: true,
        reason: 'format non reconnu',
      })
      continue
    }

    if (!conflicts.has(normalized)) conflicts.set(normalized, [])
    conflicts.get(normalized).push(participant)

    planned.push({
      id: participant.id,
      raw: participant.whatsapp,
      normalized,
      skipped: false,
    })
  }

  const duplicateGroups = [...conflicts.entries()].filter(([, list]) => list.length > 1)

  if (duplicateGroups.length) {
    console.log('DUPLICATES_AFTER_NORMALIZATION')
    for (const [normalized, list] of duplicateGroups) {
      console.log(normalized)
      for (const item of list) {
        console.log(`  - ${item.id} | ${item.prenom} ${item.nom} | ${item.whatsapp}`)
      }
    }
    process.exitCode = 2
    return
  }

  let updated = 0
  for (const item of planned) {
    if (item.skipped || item.raw === item.normalized) continue
    await prisma.participant.update({
      where: { id: item.id },
      data: { whatsapp: item.normalized },
    })
    updated += 1
  }

  console.log(JSON.stringify({ total: participants.length, updated }, null, 2))
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

