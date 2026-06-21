import { supabaseAdmin } from '../../config/supabase'
import crypto from 'crypto'
import { Chess } from 'chess.js'
import { recordH2HRevenue } from '../gamesession/h2h.helper'
import { SYSTEM_BOT_ID, getBotMove } from './bot'

const BOT_PERSONAS = [
  { username: 'KwameMaster', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b1' },
  { username: 'Chioma_Moves', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b2' },
  { username: 'EmekaCheck', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b3' },
  { username: 'Aisha_Queen', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b4' },
  { username: 'TundeTactics', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b5' },
  { username: 'ZainabPlays', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b6' },
  { username: 'Nia_Strategist', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b7' },
  { username: 'Kenzo_AI', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b8' },
  { username: 'YukiMate', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b9' },
  { username: 'Hiroshi_X', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b10' },
  { username: 'Mei_Lin_Chess', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b11' },
  { username: 'Wei_Master', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b12' },
  { username: 'Chen_G', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b13' },
  { username: 'Sakura_Pawn', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b14' },
  { username: 'Jin_Woo', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b15' },
  { username: 'Arjun_King', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b16' },
  { username: 'Priya_Play', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b17' },
  { username: 'Ravi_Knight', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b18' },
  { username: 'Deepak_Pro', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b19' },
  { username: 'Aditi_Rook', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b20' },
  { username: 'John_Smith_99', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b21' },
  { username: 'Sarah_Connor', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b22' },
  { username: 'Mike_Checkmate', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b23' },
  { username: 'Emily_Bishop', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b24' },
  { username: 'David_Castle', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b25' },
  { username: 'Jessica_Win', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b26' },
  { username: 'James_Bond_007', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b27' },
  { username: 'Maria_Garcia', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b28' },
  { username: 'Carlos_Mate', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b29' },
  { username: 'Ana_Silva', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b30' },
  { username: 'Luis_Pro', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b31' },
  { username: 'Elena_V', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b32' },
  { username: 'Diego_Armando', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b33' },
  { username: 'Isabella_Queen', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b34' },
  { username: 'Mateo_King', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b35' },
  { username: 'Sofia_Mate', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b36' },
  { username: 'Lucas_X', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b37' },
  { username: 'Mia_G', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b38' },
  { username: 'Oliver_Twist', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b39' },
  { username: 'Emma_Watson', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b40' },
  { username: 'Noah_Ark', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b41' },
  { username: 'Ava_Max', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b42' },
  { username: 'William_Tell', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b43' },
  { username: 'Sophia_Loren', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b44' },
  { username: 'James_Cameron', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b45' },
  { username: 'Charlotte_Web', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b46' },
  { username: 'Benjamin_Button', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b47' },
  { username: 'Amelia_Earhart', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b48' },
  { username: 'Elijah_Wood', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b49' },
  { username: 'Harper_Lee', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b50' },
  { username: 'Kofi_Annan', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b51' },
  { username: 'Fatima_B', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b52' },
  { username: 'Idris_E', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b53' },
  { username: 'Ngozi_O', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b54' },
  { username: 'Tariq_St', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b55' },
  { username: 'Amira_H', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b56' },
  { username: 'Zane_M', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b57' },
  { username: 'Aaliyah_D', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b58' },
  { username: 'Jamal_W', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b59' },
  { username: 'Keisha_C', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b60' },
  { username: 'Satoshi_N', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b61' },
  { username: 'Miko_Y', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b62' },
  { username: 'Kenji_S', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b63' },
  { username: 'Yuna_K', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b64' },
  { username: 'Ryu_Street', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b65' },
  { username: 'Chun_Li', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b66' },
  { username: 'Jackie_C', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b67' },
  { username: 'Bruce_L', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b68' },
  { username: 'Jet_L', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b69' },
  { username: 'Donnie_Y', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b70' },
  { username: 'Magnus_C', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b71' },
  { username: 'Hikaru_N', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b72' },
  { username: 'Garry_K', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b73' },
  { username: 'Anatoly_K', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b74' },
  { username: 'Bobby_F', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b75' },
  { username: 'Mikhail_T', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b76' },
  { username: 'Jose_R', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b77' },
  { username: 'Emanuel_L', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b78' },
  { username: 'Wilhelm_S', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b79' },
  { username: 'Paul_M', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b80' },
  { username: 'Judit_P', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b81' },
  { username: 'Hou_Y', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b82' },
  { username: 'Maia_C', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b83' },
  { username: 'Nona_G', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b84' },
  { username: 'Vera_M', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b85' },
  { username: 'Xie_J', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b86' },
  { username: 'Alexandra_K', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b87' },
  { username: 'Anna_M', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b88' },
  { username: 'Mariya_M', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b89' },
  { username: 'Elisabeth_P', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b90' },
  { username: 'Kateryna_L', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b91' },
  { username: 'Nana_D', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b92' },
  { username: 'Pia_C', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b93' },
  { username: 'Zhu_C', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b94' },
  { username: 'Antoaneta_S', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b95' },
  { username: 'Humpy_K', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b96' },
  { username: 'Ju_W', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b97' },
  { username: 'Tan_Z', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b98' },
  { username: 'Lei_T', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b99' },
  { username: 'Aleksandra_G', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b100' },
];

function getRandomBot() {
  return BOT_PERSONAS[Math.floor(Math.random() * BOT_PERSONAS.length)];
}

function generateRoomCode(): string {
  return crypto.randomBytes(3).toString('hex').toUpperCase()
}

async function handleGameOver(roomId: string, winnerId: string | null, stake: number) {
  // 1. Update room status
  const { data: room, error: updateErr } = await supabaseAdmin
    .from('chess_rooms')
    .update({ 
      status: 'finished', 
      winner_id: winnerId 
    })
    .eq('id', roomId)
    .select('host_id, guest_id')
    .single()

  if (updateErr) {
    console.error(`[Chess handleGameOver] Failed to update room ${roomId}:`, updateErr);
    return;
  }
  if (!room) {
    console.error(`[Chess handleGameOver] Room ${roomId} update returned null data without error`);
    return;
  }

  // 2. Handle Prize & Transactions for Winner
  if (stake > 0 && winnerId && winnerId !== SYSTEM_BOT_ID) {
    const totalPrize = stake * 2
    
    // Fetch the actual platform fee from the games table
    const { data: gameInfo } = await supabaseAdmin
      .from('games')
      .select('platform_fee_percentage')
      .eq('slug', 'chess')
      .single();

    const feePercent = Number(gameInfo?.platform_fee_percentage || 10);
    const platformCut = totalPrize * (feePercent / 100);
    const winnerPrize = totalPrize - platformCut;

    await supabaseAdmin.rpc('increment_wallet_balance', {
      p_user_id: winnerId,
      p_amount: winnerPrize,
    })

    // Fetch current balance for tracing
    const { data: wallet } = await supabaseAdmin
      .from('wallets')
      .select('balance')
      .eq('user_id', winnerId)
      .single();

    await supabaseAdmin.from('transactions').insert({
      user_id: winnerId,
      type: 'winnings',
      amount: winnerPrize,
      status: 'successful',
      reference: `PLZ-CHESS-WIN-${roomId}`,
      meta: { post_balance: wallet?.balance || 0 }
    })

    // Track Revenue
    await recordH2HRevenue('chess', platformCut);
  }

  // 3. Record Game History for both players
  const players = [room.host_id, room.guest_id].filter(id => id && id !== SYSTEM_BOT_ID)
  
  for (const uid of players) {
    const isWinner = uid === winnerId
    const isDraw = winnerId === null
    
    const { error: histErr } = await supabaseAdmin.from('game_history').insert({
      user_id: uid,
      game_name: 'Chess',
      status: isDraw ? 'draw' : (isWinner ? 'win' : 'loss'),
      winnings: isWinner ? (stake * 1.8) : (isDraw ? stake : 0),
      played_at: new Date().toISOString()
    })
    if (histErr) console.error(`[Chess] game_history insert failed for user ${uid}:`, histErr.message)
    else console.log(`[Chess] game_history recorded for user ${uid}, status=${isDraw ? 'draw' : (isWinner ? 'win' : 'loss')}`)
  }

  // 4. If draw, return stakes minus platform fee
  if (stake > 0 && !winnerId) {
    const { data: drawGameInfo } = await supabaseAdmin
      .from('games')
      .select('platform_fee_percentage')
      .eq('slug', 'chess')
      .single();

    const drawFeePercent = Number(drawGameInfo?.platform_fee_percentage || 10);
    const refundAmount = stake * (1 - (drawFeePercent / 100));
    for (const uid of [room.host_id, room.guest_id]) {
      if (uid && uid !== SYSTEM_BOT_ID) {
        await supabaseAdmin.rpc('increment_wallet_balance', {
          p_user_id: uid,
          p_amount: refundAmount,
        })
        
        await supabaseAdmin.from('transactions').insert({
          user_id: uid,
          type: 'bonus', // Using 'bonus' or could use a new 'refund' type if added to schema
          amount: refundAmount,
          status: 'successful',
          reference: `PLZ-CHESS-DRAW-${roomId}`,
          meta: { reason: 'Game draw refund (90%)' }
        })
      }
    }
  }

  // 5. Tournament hook — if this chess_rooms match belongs to a tournament
  // fixture, advance the bracket (knockout) or update the standings table
  // (group stage). Stake is always 0 for tournament matches, so none of
  // the H2H prize logic above ever double-pays a tournament player —
  // tournament prizes are paid separately once the whole event finishes.
  try {
    const { data: fixture } = await supabaseAdmin
      .from('chess_tournament_fixtures')
      .select('id, tournament_id, group_number, player1_id, player2_id')
      .eq('chess_room_id', roomId)
      .maybeSingle()

    if (fixture) {
      const { advanceKnockoutFixture, recordGroupResult, finishChessTournament } =
        await import('../chess-tournament/chess-tournament.service')

      if (fixture.group_number) {
        await recordGroupResult(fixture.id, winnerId, fixture.player1_id, fixture.player2_id)
      } else {
        const loserId = winnerId
          ? (winnerId === fixture.player1_id ? fixture.player2_id : fixture.player1_id)
          : null // draw in a knockout match — handled by caller via replay/tiebreak in future; for now no elimination on draw
        if (winnerId) {
          const result = await advanceKnockoutFixture(fixture.id, winnerId, loserId)
          if (result.tournamentComplete && result.championId) {
            await finishChessTournament(fixture.tournament_id, result.championId)
          }
        }
      }
    }
  } catch (tErr) {
    console.error(`[Chess handleGameOver] Tournament hook failed for room ${roomId}:`, tErr)
  }
}

export async function listWaitingRooms() {
  // --- CLEANUP STALE ROOMS ---
  // Delete rooms that are 'waiting' and older than 10 minutes
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
  await supabaseAdmin
    .from("chess_rooms")
    .delete()
    .eq("status", "waiting")
    .lt("created_at", tenMinutesAgo);
  // ---------------------------

  const { data, error } = await supabaseAdmin
    .from("chess_rooms")
    .select(
      `
      id, code, stake, created_at, host_id,
      host:users!host_id(id, username, avatar_url)
    `,
    )
    .eq("status", "waiting")
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) throw error;
  return data;
}

export async function createChessRoom(userId: string, stakeValue: number) {
  const code = generateRoomCode();
  const stake = Number(stakeValue);

  const { data, error } = await supabaseAdmin
    .from("chess_rooms")
    .insert({
      code,
      host_id: userId,
      stake,
      status: "waiting",
      board_state: null,
      current_turn: null,
    })
    .select()
    .single();

  if (error) throw error;

  if (stake > 0) {
    // Just check host balance, don't deduct yet.
    const { data: wallet } = await supabaseAdmin
      .from("wallets")
      .select("balance")
      .eq("user_id", userId)
      .single();

    if (!wallet || wallet.balance < stake)
      throw new Error("Insufficient balance to create this game");
  }

  return { room_code: code, room_id: data.id, stake, status: "waiting" };
}

export async function joinChessRoom(userId: string, code: string) {
  const { data: room, error } = await supabaseAdmin
    .from("chess_rooms")
    .select("*")
    .eq("code", code.toUpperCase())
    .single();

  if (error || !room) throw new Error("Room not found");
  if (room.status !== "waiting") throw new Error("Room is no longer available");
  if (room.host_id === userId) throw new Error("You cannot join your own room");

  if (room.stake > 0) {
    // 1. Check & Deduct Host
    const { data: hostWallet } = await supabaseAdmin.from('wallets').select('balance').eq('user_id', room.host_id).single();
    if (!hostWallet || hostWallet.balance < room.stake) throw new Error("Host no longer has sufficient balance");

    // 2. Check & Deduct Guest
    const { data: guestWallet } = await supabaseAdmin.from('wallets').select('balance').eq('user_id', userId).single();
    if (!guestWallet || guestWallet.balance < room.stake) throw new Error("Insufficient balance to join this game");

    // Deduct Host
    await supabaseAdmin.rpc("decrement_wallet_balance", { p_user_id: room.host_id, p_amount: room.stake });
    const { data: hW } = await supabaseAdmin.from('wallets').select('balance').eq('user_id', room.host_id).single();
    await supabaseAdmin.from("transactions").insert({
      user_id: room.host_id,
      type: "game_entry",
      amount: room.stake,
      status: "successful",
      reference: `PLZ-CHESS-HOST-${room.id}`,
      meta: { post_balance: hW?.balance || 0 }
    });

    // Deduct Guest
    await supabaseAdmin.rpc("decrement_wallet_balance", { p_user_id: userId, p_amount: room.stake });
    const { data: gW } = await supabaseAdmin.from('wallets').select('balance').eq('user_id', userId).single();
    await supabaseAdmin.from("transactions").insert({
      user_id: userId,
      type: "game_entry",
      amount: room.stake,
      status: "successful",
      reference: `PLZ-CHESS-JOIN-${room.id}`,
      meta: { post_balance: gW?.balance || 0 }
    });
  }

  const initialBoard = getInitialBoard();

  const { error: updateError } = await supabaseAdmin
    .from("chess_rooms")
    .update({
      guest_id: userId,
      status: "active",
      board_state: initialBoard,
      current_turn: room.host_id,
    })
    .eq("id", room.id);

  if (updateError) throw updateError;

  return {
    room_id: room.id,
    code: room.code,
    stake: room.stake,
    status: "active",
    board_state: initialBoard,
  };
}

export async function createBotRoom(userId: string, stakeValue: number) {
  const code = generateRoomCode();
  const stake = Number(stakeValue);
  const { data: activeBotRooms } = await supabaseAdmin.from('chess_rooms').select('board_state').is('guest_id', null).eq('status', 'active');
  const usedUsernames = new Set(activeBotRooms?.map(r => r.board_state?.bot?.username).filter(Boolean));
  const availableBots = BOT_PERSONAS.filter(b => !usedUsernames.has(b.username));
  const botPersona = availableBots.length > 0 ? availableBots[Math.floor(Math.random() * availableBots.length)] : BOT_PERSONAS[Math.floor(Math.random() * BOT_PERSONAS.length)];

  if (stake > 0) {
    const { data: wallet } = await supabaseAdmin
      .from("wallets")
      .select("balance")
      .eq("user_id", userId)
      .single();

    if (!wallet || wallet.balance < stake)
      throw new Error("Insufficient balance");

    await supabaseAdmin.rpc("decrement_wallet_balance", {
      p_user_id: userId,
      p_amount: stake,
    });
  }

  const initialBoard = {
    ...getInitialBoard(),
    bot: botPersona
  };

  const { data, error } = await supabaseAdmin
    .from("chess_rooms")
    .insert({
      code,
      host_id: userId,
      guest_id: null,
      stake,
      status: "active",
      board_state: initialBoard,
      current_turn: userId,
    })
    .select()
    .single();

  if (error) throw error;

  if (stake > 0) {
    const { data: finalW } = await supabaseAdmin.from('wallets').select('balance').eq('user_id', userId).single();
    await supabaseAdmin.from("transactions").insert({
      user_id: userId,
      type: "game_entry",
      amount: stake,
      status: "successful",
      reference: `PLZ-CHESS-BOT-${data.id}`,
      meta: { post_balance: finalW?.balance || 0 }
    });
  }

  return {
    room_id: data.id,
    code,
    stake,
    status: "active",
    board_state: initialBoard,
  };
}

export async function getRoom(roomId: string, userId: string) {
  const { data: room, error } = await supabaseAdmin
    .from("chess_rooms")
    .select(
      `
      id, code, status, board_state, current_turn, stake, winner_id, created_at, host_id, guest_id,
      host:users!host_id(id, username, avatar_url),
      guest:users!guest_id(id, username, avatar_url)
    `,
    )
    .eq("id", roomId)
    .single();

  if (error) throw error;
  if (!room) throw new Error("Room not found");
  if (room.host_id !== userId && room.guest_id !== userId)
    throw new Error("Unauthorized access");

  return room;
}

export async function makeMove(
  roomId: string,
  userId: string | null,
  move: { from: string; to: string; promotion?: string },
) {
  const { data: room, error } = await supabaseAdmin
    .from("chess_rooms")
    .select("*")
    .eq("id", roomId)
    .single();

  if (error || !room) throw new Error("Room not found");
  if (room.status !== "active") throw new Error("Game over");
  if (room.current_turn !== userId) throw new Error("Waiting for opponent");

  const chess = new Chess(room.board_state?.fen);
  const result = chess.move(move);
  if (!result) throw new Error("Illegal move");

  const nextTurn =
    room.current_turn === room.host_id ? room.guest_id : room.host_id;

  const now = new Date();
  const turnColor = room.current_turn === room.host_id ? "w" : "b";
  let whiteTime = room.board_state?.white_time ?? 600;
  let blackTime = room.board_state?.black_time ?? 600;
  const turnStartedAt = room.board_state?.turn_started_at;

  if (turnStartedAt) {
    const elapsedMs = now.getTime() - new Date(turnStartedAt).getTime();
    const elapsedSeconds = Math.max(0, Math.floor(elapsedMs / 1000));
    if (turnColor === "w") {
      whiteTime = Math.max(0, whiteTime - elapsedSeconds);
    } else {
      blackTime = Math.max(0, blackTime - elapsedSeconds);
    }
  }

  // Enforce Timeout forfeits
  if (turnColor === "w" && whiteTime <= 0) {
    whiteTime = 0;
    await handleGameOver(roomId, room.guest_id || SYSTEM_BOT_ID, room.stake);
    return { move, next_turn: null, status: "finished", message: "White ran out of time" };
  }
  if (turnColor === "b" && blackTime <= 0) {
    blackTime = 0;
    await handleGameOver(roomId, room.host_id, room.stake);
    return { move, next_turn: null, status: "finished", message: "Black ran out of time" };
  }

  // Apply +5s increment
  if (turnColor === "w") {
    whiteTime += 5;
  } else {
    blackTime += 5;
  }

  const updatedBoard = {
    ...room.board_state,
    fen: chess.fen(),
    last_move: move,
    moves: [...(room.board_state?.moves || []), result.san],
    is_checkmate: chess.isCheckmate(),
    is_draw: chess.isDraw(),
    white_time: whiteTime,
    black_time: blackTime,
    turn_started_at: now.toISOString(),
  };

  // Update DB
  const { error: updateError } = await supabaseAdmin
    .from("chess_rooms")
    .update({
      board_state: updatedBoard,
      current_turn: nextTurn,
    })
    .eq("id", roomId);

  if (updateError) throw updateError;

  // Check Game Over (Checkmate or Draw)
  if (chess.isGameOver()) {
    let winner = null;
    if (chess.isCheckmate()) {
      winner = room.current_turn || SYSTEM_BOT_ID; // If current_turn is null, it means the bot won
    }
    await handleGameOver(roomId, winner, room.stake);
    return { move, next_turn: null, status: "finished" };
  }

  // Bot game: guest_id is null, so nextTurn is also null (bot's turn)
  const isBotGame = !room.guest_id;
  if (isBotGame && !chess.isGameOver()) {
    // Fire bot move asynchronously so the HTTP response is NOT delayed
    setImmediate(async () => {
      try {
        // 800 ms budget — bot always replies within ~1 second
        const botMove = getBotMove(chess.fen(), 800);
        if (botMove) {
          await makeMove(roomId, null, botMove);
        }
      } catch (err) {
        console.error("Bot move error:", err);
      }
    });
  }

  return { move, next_turn: nextTurn };
}

export async function findQuickMatch(userId: string, stakeValue: number) {
  const stake = Number(stakeValue);

  // 1. Try to find an existing waiting room with the same stake
  const { data: rooms, error: searchError } = await supabaseAdmin
    .from("chess_rooms")
    .select("id, code, stake, status, host_id")
    .eq("status", "waiting")
    .eq("stake", stake)
    .neq("host_id", userId) // Don't match with self
    .order("created_at", { ascending: true })
    .limit(1);

  if (rooms && rooms.length > 0) {
    const room = rooms[0];
    try {
      return await joinChessRoom(userId, room.code);
    } catch (e) {
      console.error("Quick Match join failed:", e);
    }
  }

  // 2. If no human found, immediately create a bot match
  return await createBotRoom(userId, stake);
}

export async function resignGame(roomId: string, userId: string) {
  const { data: room } = await supabaseAdmin.from('chess_rooms').select('*').eq('id', roomId).single()
  if (!room || room.status !== 'active') throw new Error('Invalid game state')

  const winnerId = room.host_id === userId ? (room.guest_id || SYSTEM_BOT_ID) : room.host_id
  await handleGameOver(roomId, winnerId, room.stake)

  return { winner_id: winnerId, message: 'Resigned' }
}

export async function cancelChessRoom(roomId: string, userId: string) {
  const { data: room } = await supabaseAdmin.from('chess_rooms').select('*').eq('id', roomId).single()
  if (!room) throw new Error('Room not found')
  if (room.host_id !== userId) throw new Error('Unauthorized')
  if (room.status !== 'waiting') throw new Error('Cannot cancel active or finished game')

  await supabaseAdmin.from('chess_rooms').delete().eq('id', roomId)
}

function getInitialBoard() {
  return {
    fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    moves: [],
    last_move: null,
    white_time: 600,
    black_time: 600,
    turn_started_at: new Date().toISOString(),
  }
}
