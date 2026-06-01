const { PrismaClient } = require('@prisma/client')
const { config } = require('dotenv')

config({ path: '.env.local' })
config({ path: '.env' })

const prisma = new PrismaClient()

function normalizeWhatsAppNumber(input) {
  const value = String(input || '').trim()
  const match = value.match(/^\s*(?:\+?229[\s.-]*)?(?:0?1)(\d{8})\s*$/)
  if (match) return `+229 01${match[1]}`

  const digits = value.replace(/\D/g, '')
  if (digits.length < 8) return null

  const suffix = digits.slice(-8)
  return `+229 01${suffix}`
}

function samePerson(a, b) {
  return (
    a.prenom.trim().toLowerCase() === b.prenom.trim().toLowerCase() &&
    a.nom.trim().toLowerCase() === b.nom.trim().toLowerCase()
  )
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
  const idsToDelete = new Set()

  for (const [, list] of duplicateGroups) {
    if (list.every((item) => samePerson(item, list[0]))) {
      const keep = list.find((item) => item.raw === item.normalized) || list[0]
      for (const item of list) {
        if (item.id !== keep.id) idsToDelete.add(item.id)
      }
      continue
    }

    const tatianaGroup = list.some((item) => item.prenom.trim().toLowerCase() === 'tatiana' && item.nom.trim().toLowerCase() === 'aboh')
    if (tatianaGroup) {
      const keep = list.find((item) => item.raw === item.normalized) || list[0]
      for (const item of list) {
        if (item.id !== keep.id) idsToDelete.add(item.id)
      }
    }
  }

  if (duplicateGroups.length) {
    console.log('DUPLICATES_AFTER_NORMALIZATION')
    for (const [normalized, list] of duplicateGroups) {
      console.log(normalized)
      for (const item of list) {
        console.log(`  - ${item.id} | ${item.prenom} ${item.nom} | ${item.whatsapp}`)
      }
    }
  }

  let updated = 0
  for (const item of planned) {
    if (item.skipped || item.raw === item.normalized || idsToDelete.has(item.id)) continue
    await prisma.participant.update({
      where: { id: item.id },
      data: { whatsapp: item.normalized },
    })
    updated += 1
  }

  let deleted = 0
  for (const id of idsToDelete) {
    await prisma.participant.delete({ where: { id } })
    deleted += 1
  }

  console.log(JSON.stringify({ total: participants.length, updated, deleted, duplicateGroups: duplicateGroups.length }, null, 2))
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
