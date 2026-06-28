import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

async function signOut() {
  'use server'
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return (
    <div className="min-h-screen p-8">
      <p className="text-lg">Welcome, {user.email}</p>
      <nav className="mt-6 flex flex-col gap-2">
        <Link href="/dashboard/reservations" className="text-sm text-blue-600 hover:underline">
          Reservations →
        </Link>
      </nav>
      <form action={signOut} className="mt-8">
        <button
          type="submit"
          className="text-sm text-gray-600 underline hover:text-black"
        >
          Log out
        </button>
      </form>
    </div>
  )
}
