import { createClient } from '@supabase/supabase-js'

export default async function Page() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data, error } = await supabase
    .from('restaurants')
    .select('nome_ristorante')
    .eq('id', 'fc1dc756-8e83-473d-9d6d-c32720e4d258')
    .single()

  if (error) return <p>Error: {error.message}</p>
  return <p>{data?.nome_ristorante}</p>
}
