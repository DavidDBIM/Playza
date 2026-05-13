import { supabaseAdmin } from '../../config/supabase';

export async function recordH2HRevenue(gameSlug: string, amount: number) {
  if (amount <= 0) return;

  const { error } = await supabaseAdmin.rpc('increment_game_revenue', {
    p_game_slug: gameSlug,
    p_amount: amount
  });

  if (error) {
    // If RPC doesn't exist, fallback to manual update
    console.warn(`[H2HHelper] increment_game_revenue RPC failed, falling back:`, error.message);
    const { data: game } = await supabaseAdmin
      .from('games')
      .select('total_revenue')
      .eq('slug', gameSlug)
      .single();
    
    await supabaseAdmin
      .from('games')
      .update({ total_revenue: (Number(game?.total_revenue) || 0) + amount })
      .eq('slug', gameSlug);
  }
}
