import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

async function signOut() {
  'use server'
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: adminRow } = await supabase
    .from('super_admins')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!adminRow) redirect('/dashboard')

  return (
    <div className="flex min-h-screen bg-bg">
      <aside className="w-52 flex-shrink-0 flex flex-col bg-ink">
        <div className="px-5 py-5 border-b border-white/10">
          <p className="font-display font-medium text-sm text-white/90 leading-snug">
            La Gondola Admin
          </p>
          <p className="text-xs text-white/40 mt-0.5 truncate">{user.email}</p>
        </div>
        <nav className="flex flex-col py-3 flex-1">
          <Link
            href="/admin/clients"
            className="text-sm py-2 px-4 mx-2 rounded-md text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            Clients
          </Link>
        </nav>
        <div className="px-5 py-4 border-t border-white/10 space-y-2">
          <Link
            href="/dashboard"
            className="block text-xs text-white/40 hover:text-white/60 transition-colors"
          >
            ← Dashboard
          </Link>
          <form action={signOut}>
            <button
              type="submit"
              className="text-xs text-white/40 hover:text-white/60 transition-colors"
            >
              Log out
            </button>
          </form>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  )
}
