import { supabaseAdmin as supabase } from "../../config/supabase";

export async function startSoloSession(
  userId: string,
  gameId: string,
  stake: number,
) {
  if (stake <= 0) {
    throw new Error("Stake must be greater than 0");
  }

  // 1. Check user balance
  const { data: wallet, error: walletErr } = await supabase
    .from("wallets")
    .select("balance")
    .eq("user_id", userId)
    .single();

  if (walletErr || !wallet) throw new Error("Wallet not found");
  if (wallet.balance < stake) throw new Error("Insufficient funds");

  // 2. Deduct stake
  const { error: decErr } = await supabase.rpc("decrement_wallet_balance", {
    p_user_id: userId,
    p_amount: stake,
  });

  if (decErr) throw new Error("Failed to deduct stake: " + decErr.message);

  // 3. Log transaction
  await supabase.from("transactions").insert({
    user_id: userId,
    type: "game_entry",
    amount: stake,
    status: "successful",
    meta: { game_id: gameId, mode: "soloearn" },
  });

  // 4. Create session
  const { data: session, error: sessErr } = await supabase
    .from("soloearn_sessions")
    .insert({
      user_id: userId,
      game_id: gameId,
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
  // 1. Fetch session
  const { data: session, error: sessErr } = await supabase
    .from("soloearn_sessions")
    .select("*")
    .eq("id", sessionId)
    .eq("user_id", userId)
    .single();

  if (sessErr || !session) throw new Error("Session not found");
  if (session.status !== "in_progress")
    throw new Error("Session already completed");

  // --- Anti-Cheat: Time Validation ---
  if (session.created_at) {
    const createdAt = new Date(session.created_at).getTime();
    const now = Date.now();
    const elapsedSeconds = (now - createdAt) / 1000;

    if (rawMultiplier > 0 && elapsedSeconds < 3) {
      throw new Error("Session ended suspiciously fast. Score rejected.");
    }
    if (rawMultiplier >= 1.5 && elapsedSeconds < 10) {
      throw new Error(
        "High multiplier achieved suspiciously fast. Score rejected.",
      );
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

    await supabase.from("transactions").insert({
      user_id: userId,
      type: "winnings",
      amount: payout,
      status: "successful",
      meta: {
        game_id: session.game_id,
        mode: "soloearn",
        session_id: sessionId,
      },
    });
  }

  // 5. Log Game History for User Profile
  const formattedGameName = session.game_id
    .split("-")
    .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  await supabase.from("game_history").insert({
    user_id: userId,
    game_name: `Solo: ${formattedGameName}`,
    status:
      payout > session.stake
        ? "win"
        : payout === session.stake
          ? "draw"
          : "loss",
    score: Math.round(cappedMultiplier * 100), // Storing the multiplier as score (e.g. 1.5x -> 150)
    winnings: payout,
    played_at: new Date().toISOString(),
  });

  return { payout, multiplier: cappedMultiplier };
}
