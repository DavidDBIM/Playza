import { supabaseAdmin as supabase } from "../../config/supabase";

export async function startSoloSession(
  userId: string,
  gameId: string,
  stake: number,
) {
  // Input validation: stake must be a finite whole number of at least 100
  if (!Number.isFinite(stake) || stake !== Math.round(stake)) {
    throw new Error("Stake must be a whole number.");
  }
  if (stake < 100) {
    throw new Error("Minimum stake is 100.");
  }

  // Fetch game details to get slug
  const { data: game, error: gameErr } = await supabase
    .from("games")
    .select("slug, title")
    .eq("id", gameId)
    .single();

  if (gameErr || !game) throw new Error("Game not found");

  // 1. Check user balance
  const { data: wallet, error: walletErr } = await supabase
    .from("wallets")
    .select("balance")
    .eq("user_id", userId)
    .single();

  if (walletErr || !wallet) throw new Error("Wallet not found");
  if (wallet.balance < stake) throw new Error("Insufficient funds");

  // Concurrent session prevention: auto-abandon any previous active sessions
  const { data: existingSession } = await supabase
    .from('soloearn_sessions')
    .select('id')
    .eq('user_id', userId)
    .eq('status', 'in_progress')
    .single();

  if (existingSession) {
    // Forfeit previous stuck session
    await supabase.from('soloearn_sessions').update({ 
      status: 'completed', 
      multiplier: 0,
      payout: 0
    }).eq('id', existingSession.id);
  }

  // 2. Deduct stake
  const { error: decErr } = await supabase.rpc("decrement_wallet_balance", {
    p_user_id: userId,
    p_amount: stake,
  });

  if (decErr) throw new Error("Failed to deduct stake: " + decErr.message);

  // Record post_balance for tracing
  const { data: updatedWallet } = await supabase.from('wallets').select('balance').eq('user_id', userId).single();

  // 3. Log transaction
  await supabase.from("transactions").insert({
    user_id: userId,
    type: "game_entry",
    amount: stake,
    status: "successful",
    reference: `PLZ-SOLO-ENTRY-${game.slug}-${userId}-${Date.now()}`,
    meta: { game_id: game.slug, mode: "soloearn", post_balance: updatedWallet?.balance || 0 },
  });

  // 4. Create session storing game.slug so Admin Dashboard matches correctly
  const { data: session, error: sessErr } = await supabase
    .from("soloearn_sessions")
    .insert({
      user_id: userId,
      game_id: game.slug,
      stake: stake,
      status: "in_progress",
    })
    .select()
    .single();

  if (sessErr) throw new Error("Failed to create session: " + sessErr.message);

  return session;
}

export async function endSoloSession(
  userId: string,
  sessionId: string,
  rawMultiplier: number,
) {
  // 1. Fetch session for dynamic anti-cheat
  const { data: session, error: sessErr } = await supabase
    .from("soloearn_sessions")
    .select("*")
    .eq("id", sessionId)
    .eq("user_id", userId)
    .single();

  if (sessErr || !session) throw new Error("Session not found: " + (sessErr?.message || 'Unknown DB error'));
  if (session.status !== "in_progress")
    throw new Error("Session already completed");

  // Fetch game title separately
  const { data: gameData } = await supabase.from("games").select("title").eq("slug", session.game_id).single();
  const gameTitle = gameData?.title || session.game_id;

  // rawMultiplier type guard: reject NaN, Infinity and non-numeric values
  if (typeof rawMultiplier !== 'number' || !isFinite(rawMultiplier)) {
    throw new Error('Invalid multiplier value received.');
  }

  // --- Anti-Cheat: Calibrated Time Validation ---
  if (session.created_at) {
    const createdAt = new Date(session.created_at).getTime();
    const now = Date.now();
    const elapsedSeconds = (now - createdAt) / 1000;

    // Maximum session duration: 20 minutes for all games
    if (elapsedSeconds > 1200) {
      console.warn(`[SoloEarn Anti-Cheat] Session ${sessionId} expired (>20 mins).`);
      rawMultiplier = 0;
    }
    
    let violation = false;
    if (gameTitle === 'Memory Rush') {
      if (rawMultiplier > 0 && elapsedSeconds < 10) violation = true;
      if (rawMultiplier >= 0.5 && elapsedSeconds < 15) violation = true;
      if (rawMultiplier >= 1.0 && elapsedSeconds < 30) violation = true;
      if (rawMultiplier >= 1.5 && elapsedSeconds < 80) violation = true;
      if (rawMultiplier >= 2.0 && elapsedSeconds < 130) violation = true;
    } else {
      if (rawMultiplier > 0 && elapsedSeconds < 3) violation = true;
      if (rawMultiplier >= 1.0 && elapsedSeconds < 8) violation = true;
      if (rawMultiplier >= 2.0 && elapsedSeconds < 15) violation = true;
    }

    if (violation) {
      console.warn(`[SoloEarn Anti-Cheat] Violation on ${sessionId}. Mult: ${rawMultiplier}, Time: ${elapsedSeconds}s. Forcing 0x.`);
      rawMultiplier = 0;
    }
  }

  // 2. Enforce 2.0x cap and strict >1.0 win condition
  let cappedMultiplier = Math.min(Math.max(rawMultiplier, 0), 2.0);

  if (cappedMultiplier <= 1.0) {
    cappedMultiplier = 0.0;
  }

  const payout = parseFloat((session.stake * cappedMultiplier).toFixed(2));

  // 3. Update session
  const { error: updErr } = await supabase
    .from("soloearn_sessions")
    .update({
      multiplier: cappedMultiplier,
      payout: payout,
      status: "completed",
    })
    .eq("id", sessionId);

  if (updErr) throw new Error("Failed to update session: " + updErr.message);

  // 4. Pay user if payout > 0
  if (payout > 0) {
    const { error: incErr } = await supabase.rpc("increment_wallet_balance", {
      p_user_id: userId,
      p_amount: payout,
    });

    if (incErr) console.error("Failed to increment wallet:", incErr);

    // Record post_balance for tracing
    const { data: updatedWallet } = await supabase.from('wallets').select('balance').eq('user_id', userId).single();

    await supabase.from("transactions").insert({
      user_id: userId,
      type: "winnings",
      amount: payout,
      status: "successful",
      reference: `PLZ-SOLO-WIN-${session.game_id}-${sessionId}-${userId}`,
      meta: {
        game_id: session.game_id,
        mode: "soloearn",
        session_id: sessionId,
        post_balance: updatedWallet?.balance || 0
      },
    });
  }

  // 5. Log Game History for User Profile
  // We already fetched gameTitle at the top of endSoloSession

  const soloStatus = payout > session.stake ? "win" : payout === session.stake ? "draw" : "loss";

  const { error: histErr } = await supabase.from("game_history").insert({
    user_id: userId,
    game_name: `Solo: ${gameTitle}`,
    status: soloStatus,
    score: Math.round(cappedMultiplier * 100),
    winnings: payout,
    played_at: new Date().toISOString(),
  });
  if (histErr) console.error(`[SoloEarn] game_history insert failed for user ${userId}:`, histErr.message)
  else console.log(`[SoloEarn] game_history recorded for user ${userId}, status=${soloStatus}`)

  return { payout, multiplier: cappedMultiplier };
}
