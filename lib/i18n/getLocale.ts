import { cookies } from 'next/headers'
import type { Locale } from './dictionary'

const VALID: Locale[] = ['en', 'it', 'fr', 'es']

export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies()
  const value = cookieStore.get('locale')?.value
  if (value && (VALID as string[]).includes(value)) return value as Locale
  return 'en'
}
