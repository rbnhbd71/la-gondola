'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export interface BillingData {
  billing_status: string
  billing_notes: string | null
  monthly_rate: number | null
  client_since: string | null
  tier_id: string | null
}

export async function updateBilling(
  restaurantId: string,
  data: BillingData,
): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: adminRow } = await supabase
    .from('super_admins')
    .select('id')
    .eq('user_id', user.id)
    .single()
  if (!adminRow) return { error: 'Not authorized.' }

  const { error } = await supabase
    .from('client_billing')
    .upsert(
      {
        restaurant_id: restaurantId,
        billing_status: data.billing_status,
        billing_notes: data.billing_notes || null,
        monthly_rate: data.monthly_rate,
        client_since: data.client_since || null,
        tier_id: data.tier_id || null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'restaurant_id' },
    )

  if (error) return { error: error.message }

  revalidatePath(`/admin/clients/${restaurantId}`)
  return {}
}
