'use server'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import type { Locale } from './dictionary'

const VALID: Locale[] = ['en', 'it', 'fr', 'es']

export async function setLocale(locale: Locale): Promise<void> {
  if (!(VALID as string[]).includes(locale)) return
  const cookieStore = await cookies()
  cookieStore.set('locale', locale, { path: '/', maxAge: 60 * 60 * 24 * 365, sameSite: 'lax' })
  revalidatePath('/', 'layout')
}
