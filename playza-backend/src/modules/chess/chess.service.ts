import { supabaseAdmin } from '../../config/supabase'
import crypto from 'crypto'
import { Chess } from 'chess.js'
import { getBotMove, SYSTEM_BOT_ID } from './bot'

function generateRoomCode(): string {
  return crypto.randomBytes(3).toString('hex').toUpperCase()
}

async function handleGameOver(roomId: string, winnerId: string | null, stake: number) {
  await supabaseAdmin
    .from('chess_rooms')
    .update({ 
      status: 'finished', 
      winner_id: winnerId 
    })
    .eq('id', roomId)

  if (stake > 0 && winnerId && winnerId !== SYSTEM_BOT_ID) {
    const totalPrize = stake * 2
    const platformCut = totalPrize * 0.1
    const winnerPrize = totalPrize - platformCut

    await supabaseAdmin.rpc('increment_wallet_balance', {
      p_user_id: winnerId,
      p_amount: winnerPrize,
    })

    await supabaseAdmin.from('transactions').insert({
      user_id: winnerId,
      type: 'winnings',
      amount: winnerPrize,
      status: 'successful',
      reference: `PLZ-CHESS-WIN-${roomId}`,
    })
  }

  // If draw, return stakes
  if (stake > 0 && !winnerId) {
    const players = await supabaseAdmin
      .from('chess_rooms')
      .select('host_id, guest_id')
      .eq('id', roomId)
      .single()

    if (players.data) {
      for (const uid of [players.data.host_id, players.data.guest_id]) {
        if (uid) {
          await supabaseAdmin.rpc('increment_wallet_balance', {
            p_user_id: uid,
            p_amount: stake,
          })
        }
      }
    }
  }
}

export async function listWaitingRooms() {
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
    const { data: wallet } = await supabaseAdmin
      .from("wallets")
      .select("balance")
      .eq("user_id", userId)
      .single();

    if (!wallet || wallet.balance < stake)
      throw new Error("Insufficient balance to create this game");

    await supabaseAdmin.rpc("decrement_wallet_balance", {
      p_user_id: userId,
      p_amount: stake,
    });

    await supabaseAdmin.from("transactions").insert({
      user_id: userId,
      type: "game_entry",
      amount: stake,
      status: "successful",
      reference: `PLZ-CHESS-${data.id}`,
    });
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
    const { data: wallet } = await supabaseAdmin
      .from("wallets")
      .select("balance")
      .eq("user_id", userId)
      .single();

    if (!wallet || wallet.balance < room.stake)
      throw new Error("Insufficient balance to join this game");

    await supabaseAdmin.rpc("decrement_wallet_balance", {
      p_user_id: userId,
      p_amount: room.stake,
    });

    await supabaseAdmin.from("transactions").insert({
      user_id: userId,
      type: "game_entry",
      amount: room.stake,
      status: "successful",
      reference: `PLZ-CHESS-JOIN-${room.id}-${userId}`,
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

  const initialBoard = getInitialBoard();

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
  const updatedBoard = {
    fen: chess.fen(),
    last_move: move,
    moves: [...(room.board_state?.moves || []), result.san],
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

  // Check Game Over
  if (chess.isGameOver()) {
    let winner = null;
    if (chess.isCheckmate()) {
      winner = room.current_turn || SYSTEM_BOT_ID;
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

  return await createChessRoom(userId, stake);
}

export async function resignGame(roomId: string, userId: string) {
  const { data: room } = await supabaseAdmin
    .from('chess_rooms')
    .select('*')
    .eq('id', roomId)
    .single()

  if (!room || room.status !== 'active') throw new Error('Invalid game state')

  const winnerId = room.host_id === userId ? room.guest_id : room.host_id
  await handleGameOver(roomId, winnerId, room.stake)

  return { winner_id: winnerId, message: 'Resigned' }
}

function getInitialBoard() {
  return {
    fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    moves: [],
    last_move: null,
  }
}
