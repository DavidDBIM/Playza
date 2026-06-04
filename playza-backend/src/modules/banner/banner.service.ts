import { supabaseAdmin } from '../../config/supabase'

export interface BannerSlideInput {
  tag: string
  title: string
  subtitle: string
  description: string
  button_text: string
  button_link: string
  image_url: string | null
  color: string
  accent: string
  is_active: boolean
  sort_order: number
}

export async function getAllBanners() {
  const { data, error } = await supabaseAdmin
    .from('banners')
    .select('*')
    .order('sort_order', { ascending: true })

  if (error) throw new Error(error.message)
  return data
}

export async function getActiveBanners() {
  const { data, error } = await supabaseAdmin
    .from('banners')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  if (error) throw new Error(error.message)
  return data
}

export async function createBanner(input: BannerSlideInput) {
  const { data, error } = await supabaseAdmin
    .from('banners')
    .insert([input])
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function updateBanner(id: string, input: Partial<BannerSlideInput>) {
  const { data, error } = await supabaseAdmin
    .from('banners')
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function deleteBanner(id: string) {
  const { error } = await supabaseAdmin
    .from('banners')
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)
  return { success: true }
}

export async function reorderBanners(ids: string[]) {
  const updates = ids.map((id, index) =>
    supabaseAdmin
      .from('banners')
      .update({ sort_order: index, updated_at: new Date().toISOString() })
      .eq('id', id)
  )
  await Promise.all(updates)
  return { success: true }
}
