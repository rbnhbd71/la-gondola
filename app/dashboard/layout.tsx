import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import SidebarNav from './SidebarNav'

async function signOut() {
  'use server'
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: restaurant } = await supabase
    .from('restaurants')
    .select('nome_ristorante')
    .eq('owner_id', user.id)
    .single()

  return (
    <div className="flex min-h-screen">
      <aside className="w-56 flex-shrink-0 bg-gray-50 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <p className="text-sm font-semibold text-gray-900 truncate">
            {restaurant?.nome_ristorante ?? '—'}
          </p>
          <p className="text-xs text-gray-400 mt-0.5 truncate">{user.email}</p>
        </div>
        <SidebarNav />
        <div className="mt-auto p-4 border-t border-gray-200">
          <form action={signOut}>
            <button
              type="submit"
              className="text-sm text-gray-500 hover:text-black"
            >
              Log out
            </button>
          </form>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
