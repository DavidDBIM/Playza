import { supabaseAdmin } from '../../config/supabase'

export interface BlogPostInput {
  title: string
  slug: string
  excerpt: string
  content: string
  cover_image_url: string | null
  author_name: string
  tags: string[]
  is_published: boolean
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 100)
}

export async function generateUniqueSlug(title: string, excludeId?: string) {
  const base = slugify(title) || 'post'
  let slug = base
  let counter = 2

  // Loop until we find a slug that isn't taken by another post
  while (true) {
    let query = supabaseAdmin.from('blog_posts').select('id').eq('slug', slug)
    if (excludeId) query = query.neq('id', excludeId)
    const { data, error } = await query.maybeSingle()
    if (error) throw new Error(error.message)
    if (!data) return slug
    slug = `${base}-${counter}`
    counter += 1
  }
}

export async function getAllPosts() {
  const { data, error } = await supabaseAdmin
    .from('blog_posts')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data
}

export async function getPublishedPosts(limit?: number) {
  let query = supabaseAdmin
    .from('blog_posts')
    .select('id, title, slug, excerpt, cover_image_url, author_name, tags, published_at, view_count')
    .eq('is_published', true)
    .order('published_at', { ascending: false })

  if (limit) query = query.limit(limit)

  const { data, error } = await query
  if (error) throw new Error(error.message)
  return data
}

export async function getPostBySlug(slug: string, publishedOnly = true) {
  let query = supabaseAdmin.from('blog_posts').select('*').eq('slug', slug)
  if (publishedOnly) query = query.eq('is_published', true)

  const { data, error } = await query.single()
  if (error) throw new Error(error.message)
  return data
}

export async function getPostById(id: string) {
  const { data, error } = await supabaseAdmin.from('blog_posts').select('*').eq('id', id).single()
  if (error) throw new Error(error.message)
  return data
}

export async function incrementViewCount(id: string) {
  const { error } = await supabaseAdmin.rpc('increment_blog_view_count', { post_id: id })
  // Fall back silently — the counter is a nice-to-have, never block the read
  if (error) {
    const { data } = await supabaseAdmin.from('blog_posts').select('view_count').eq('id', id).single()
    await supabaseAdmin
      .from('blog_posts')
      .update({ view_count: (data?.view_count || 0) + 1 })
      .eq('id', id)
  }
}

export async function createPost(input: Partial<BlogPostInput>) {
  if (!input.title) throw new Error('Title is required')

  const slug = input.slug ? slugify(input.slug) : await generateUniqueSlug(input.title)

  const payload = {
    title: input.title,
    slug,
    excerpt: input.excerpt || '',
    content: input.content || '',
    cover_image_url: input.cover_image_url || null,
    author_name: input.author_name || 'Playza Team',
    tags: input.tags || [],
    is_published: input.is_published ?? false,
    published_at: input.is_published ? new Date().toISOString() : null,
  }

  const { data, error } = await supabaseAdmin.from('blog_posts').insert([payload]).select().single()
  if (error) throw new Error(error.message)
  return data
}

export async function updatePost(id: string, input: Partial<BlogPostInput>) {
  const existing = await getPostById(id)

  const payload: Record<string, any> = { ...input, updated_at: new Date().toISOString() }

  if (input.slug) {
    payload.slug = await generateUniqueSlug(input.slug, id)
  }

  // Stamp published_at the moment a post transitions into published state
  if (input.is_published === true && !existing.published_at) {
    payload.published_at = new Date().toISOString()
  }
  if (input.is_published === false) {
    payload.published_at = null
  }

  const { data, error } = await supabaseAdmin
    .from('blog_posts')
    .update(payload)
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function deletePost(id: string) {
  const { error } = await supabaseAdmin.from('blog_posts').delete().eq('id', id)
  if (error) throw new Error(error.message)
  return { success: true }
}