import { createHash, timingSafeEqual } from 'crypto'

function hashValue(value: string) {
  return createHash('sha256').update(value).digest('hex')
}

export function getAdminPassword() {
  return process.env.ADMIN_PASSWORD?.trim() || ''
}

export function getAdminSessionToken() {
  const password = getAdminPassword()
  return password ? hashValue(password) : ''
}

export function isValidAdminPassword(password: string) {
  const configured = getAdminPassword()
  if (!configured) return false

  const receivedHash = Buffer.from(hashValue(password))
  const expectedHash = Buffer.from(hashValue(configured))

  return (
    receivedHash.length === expectedHash.length &&
    timingSafeEqual(receivedHash, expectedHash)
  )
}

export function isAdminSession(session: string | undefined) {
  const token = getAdminSessionToken()
  if (!session || !token) return false

  const received = Buffer.from(session)
  const expected = Buffer.from(token)

  return (
    received.length === expected.length &&
    timingSafeEqual(received, expected)
  )
}
