import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getLocale } from '@/lib/i18n/getLocale'
import SidebarNav from './SidebarNav'
import LanguageSwitcher from './LanguageSwitcher'

async function signOut() {
  'use server'
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: restaurant } = await supabase
    .from('restaurants')
    .select('nome_ristorante')
    .eq('owner_id', user.id)
    .single()

  const locale = await getLocale()

  return (
    <div className="flex min-h-screen bg-bg">
      <aside className="w-56 flex-shrink-0 flex flex-col border-r border-line">
        <div className="px-5 py-5 border-b border-line">
          <p className="font-display font-medium text-sm text-ink leading-snug truncate">
            {restaurant?.nome_ristorante ?? '—'}
          </p>
          <p className="text-xs text-ink-faint mt-0.5 truncate">{user.email}</p>
        </div>
        <SidebarNav locale={locale} />
        <div className="mt-auto px-5 py-4 border-t border-line">
          <form action={signOut}>
            <button type="submit" className="text-xs text-ink-faint hover:text-ink transition-colors">
              Log out
            </button>
          </form>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto relative">
        <div className="absolute top-4 right-6 z-10">
          <LanguageSwitcher current={locale} />
        </div>
        {children}
      </main>
    </div>
  )
}
