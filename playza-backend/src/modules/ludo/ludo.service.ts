import { supabaseAdmin } from '../../config/supabase'
import crypto from 'crypto'
import { getBotLudoMove, SYSTEM_BOT_ID } from './bot'

export type PieceColor = "red" | "green" | "yellow" | "blue";
export type PlayerSide = "host" | "guest";

const NEXT_TURN: Record<PieceColor, PieceColor> = {
  red: "green",
  green: "yellow",
  yellow: "blue",
  blue: "red",
};

const INITIAL_PIECES = [
  { id: "r1", color: "red", position: -1 }, { id: "r2", color: "red", position: -1 }, { id: "r3", color: "red", position: -1 }, { id: "r4", color: "red", position: -1 },
  { id: "g1", color: "green", position: -1 }, { id: "g2", color: "green", position: -1 }, { id: "g3", color: "green", position: -1 }, { id: "g4", color: "green", position: -1 },
  { id: "y1", color: "yellow", position: -1 }, { id: "y2", color: "yellow", position: -1 }, { id: "y3", color: "yellow", position: -1 }, { id: "y4", color: "yellow", position: -1 },
  { id: "b1", color: "blue", position: -1 }, { id: "b2", color: "blue", position: -1 }, { id: "b3", color: "blue", position: -1 }, { id: "b4", color: "blue", position: -1 },
];

function generateRoomCode(): string {
  return crypto.randomBytes(3).toString('hex').toUpperCase()
}

function getInitialBoard() {
  return {
    pieces: INITIAL_PIECES,
    turn: "red",
    diceValue: null,
    hasRolled: false,
    sixCount: 0,
    history: ["Game started! Host controls Red & Yellow. Rival controls Green & Blue."],
  };
}

async function handleGameOver(roomId: string, winnerId: string | null, stake: number) {
  // 1. Update room status
  const { data: room } = await supabaseAdmin
    .from('ludo_rooms')
    .update({ 
      status: 'finished', 
      winner_id: winnerId 
    })
    .eq('id', roomId)
    .select('host_id, guest_id')
    .single()

  if (!room) return

  // 2. Handle Prize & Transactions for Winner
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
      reference: `PLZ-LUDO-WIN-${roomId}`,
    })
  }

  // 3. Record Game History for both players
  const players = [room.host_id, room.guest_id].filter(id => id && id !== SYSTEM_BOT_ID)
  
  for (const uid of players) {
    const isWinner = uid === winnerId
    const isDraw = winnerId === null
    
    await supabaseAdmin.from('game_history').insert({
      user_id: uid,
      game_name: 'Ludo',
      status: isDraw ? 'draw' : (isWinner ? 'win' : 'loss'),
      winnings: isWinner ? (stake * 1.8) : (isDraw ? stake : 0),
      played_at: new Date().toISOString()
    })
  }

  // 4. If draw, return stakes to wallet
  if (stake > 0 && !winnerId) {
    for (const uid of [room.host_id, room.guest_id]) {
      if (uid && uid !== SYSTEM_BOT_ID) {
        await supabaseAdmin.rpc('increment_wallet_balance', {
          p_user_id: uid,
          p_amount: stake,
        })
      }
    }
  }
}

export async function listWaitingRooms() {
  const { data: rooms, error } = await supabaseAdmin
    .from("ludo_rooms")
    .select(`id, code, stake, created_at, host_id`)
    .eq("status", "waiting")
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) throw error;
  if (!rooms) return [];

  // Manually fetch host info for each room
  const hostIds = rooms.map(r => r.host_id).filter(Boolean);
  const { data: users } = await supabaseAdmin
    .from("users")
    .select("id, username, avatar_url")
    .in("id", hostIds);
  
  const userMap = (users || []).reduce((acc: any, u: any) => {
    acc[u.id] = u;
    return acc;
  }, {});

  return rooms.map(r => ({
    ...r,
    host: userMap[r.host_id] || null
  }));
}

export async function createLudoRoom(userId: string, stakeValue: number) {
  const code = generateRoomCode();
  const stake = Number(stakeValue);

  const { data, error } = await supabaseAdmin
    .from("ludo_rooms")
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
    const { data: wallet } = await supabaseAdmin.from("wallets").select("balance").eq("user_id", userId).single();
    if (!wallet || wallet.balance < stake) throw new Error("Insufficient balance to create this game");
  }

  return { room_code: code, room_id: data.id, stake, status: "waiting" };
}

export async function joinLudoRoom(userId: string, code: string) {
  const { data: room, error } = await supabaseAdmin.from("ludo_rooms").select("*").eq("code", code.toUpperCase()).single();
  if (error || !room) throw new Error("Room not found");
  if (room.status !== "waiting") throw new Error("Room no longer available");
  if (room.host_id === userId) throw new Error("You cannot join your own room");

  if (room.stake > 0) {
    // Deduct Host
    const { data: hostWallet } = await supabaseAdmin.from('wallets').select('balance').eq('user_id', room.host_id).single();
    if (!hostWallet || hostWallet.balance < room.stake) throw new Error("Host no longer has sufficient balance");
    await handleEntryFee(room.host_id, room.stake, `HOST-${room.id}`);

    // Deduct Guest
    const { data: guestWallet } = await supabaseAdmin.from('wallets').select('balance').eq('user_id', userId).single();
    if (!guestWallet || guestWallet.balance < room.stake) throw new Error("Insufficient balance to join this game");
    await handleEntryFee(userId, room.stake, `JOIN-${room.id}`);
  }

  const initialBoard = getInitialBoard();
  const { error: updateError } = await supabaseAdmin.from("ludo_rooms").update({
    guest_id: userId,
    status: "active",
    board_state: initialBoard,
    current_turn: room.host_id,
  }).eq("id", room.id);

  if (updateError) throw updateError;
  return { room_id: room.id, room_code: room.code, stake: room.stake, status: "active", board_state: initialBoard };
}


export async function createBotRoom(userId: string, stakeValue: number) {
  const code = generateRoomCode();
  const stake = Number(stakeValue);

  await handleEntryFee(userId, stake, `BOT-${code}`);
  const initialBoard = getInitialBoard();

  const { data, error } = await supabaseAdmin
    .from("ludo_rooms")
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
  return { room_id: data.id, code, stake, status: "active", board_state: initialBoard };
}

export async function getRoom(roomId: string, userId: string) {
  // Try UUID first without joins to avoid 'relationship not found' errors
  let query = supabaseAdmin
    .from("ludo_rooms")
    .select(`id, code, status, board_state, current_turn, stake, winner_id, created_at, host_id, guest_id`);

  const isUuid = roomId.includes('-');
  
  if (isUuid) {
    query = query.eq("id", roomId);
  } else {
    query = query.eq("code", roomId.toUpperCase());
  }

  let { data: room, error } = await query.single();

  if (error) {
     if (isUuid) {
       const { data: fallbackRoom, error: fallbackError } = await supabaseAdmin
        .from("ludo_rooms")
        .select(`id, code, status, board_state, current_turn, stake, winner_id, created_at, host_id, guest_id`)
        .eq("code", roomId.toUpperCase())
        .single();
       
       if (!fallbackError && fallbackRoom) {
         room = fallbackRoom;
         error = null;
       }
    }
  }

  if (error || !room) {
    console.error(`[LudoService] getRoom Error for ${roomId}:`, error);
    throw new Error("Room not found");
  }

  // Manually fetch host & guest info
  const userIds = [room.host_id, room.guest_id].filter(Boolean);
  const { data: users } = await supabaseAdmin
    .from("users")
    .select("id, username, avatar_url")
    .in("id", userIds);

  const userMap = (users || []).reduce((acc: any, u: any) => {
    acc[u.id] = u;
    return acc;
  }, {});

  return {
    ...room,
    host: userMap[room.host_id] || null,
    guest: userMap[room.guest_id] || null
  };
}



export async function findQuickMatch(userId: string, stakeValue: number) {
  const stake = Number(stakeValue);

  const { data: rooms } = await supabaseAdmin.from("ludo_rooms").select("id, code, stake, status, host_id").eq("status", "waiting").eq("stake", stake).neq("host_id", userId).order("created_at", { ascending: true }).limit(1);

  if (rooms && rooms.length > 0) {
    try {
      return await joinLudoRoom(userId, rooms[0].code);
    } catch (e) {
      console.error("Quick Match join failed:", e);
    }
  }

  return await createLudoRoom(userId, stake);
}

export async function rollDice(roomId: string, userId: string | null): Promise<{ status: string; board_state: any }> {
  const room = await getAndValidateActiveRoom(roomId, userId);
  
  const state = room.board_state;
  if (state.hasRolled || state.diceValue !== null) throw new Error("You already rolled!");

  const isHost = room.host_id === userId;
  const myColors = isHost ? ["red", "yellow"] : ["green", "blue"];
  if (!myColors.includes(state.turn)) throw new Error("Not your turn color");

  const value = Math.floor(Math.random() * 6) + 1;
  let nextSixCount = state.sixCount;

  if (value === 6) nextSixCount++;
  else nextSixCount = 0;

  const pieces = state.pieces.filter((p: any) => p.color === state.turn);
  const canMove = pieces.some((p: any) => {
    if (p.position === 57) return false;
    if (p.position === -1) return value === 6;
    return p.position + value <= 57;
  });

  let nextTurn = state.turn;
  let hasRolled = true;
  let nextDiceValue: number | null = value;

  if (!canMove || nextSixCount === 3) {
    nextTurn = NEXT_TURN[state.turn as PieceColor];
    hasRolled = false;
    nextSixCount = 0;
    nextDiceValue = null;
    state.history.push(`${state.turn} rolled ${value} but couldn't move.`);
  } else {
    state.history.push(`${state.turn} rolled a ${value}`);
  }

  // Update real-time board
  state.diceValue = nextDiceValue;
  state.hasRolled = hasRolled;
  state.turn = nextTurn;
  state.sixCount = nextSixCount;

  let newCurrentTurn = room.current_turn; 
  if (nextTurn === "green" || nextTurn === "blue") newCurrentTurn = room.guest_id;
  if (nextTurn === "red" || nextTurn === "yellow") newCurrentTurn = room.host_id;

  const { error } = await supabaseAdmin.from("ludo_rooms").update({ board_state: state, current_turn: newCurrentTurn }).eq("id", roomId);
  if (error) throw error;

  return triggerBotIfApplicable(roomId, state, room, newCurrentTurn);
}

export async function makeMove(roomId: string, userId: string | null, pieceId: string): Promise<{ status: string; board_state: any }> {
  const room = await getAndValidateActiveRoom(roomId, userId);
  const state = room.board_state;

  if (!state.hasRolled || state.diceValue === null) throw new Error("You need to roll first!");
  
  const piece = state.pieces.find((p: any) => p.id === pieceId);
  if (!piece || piece.color !== state.turn) throw new Error("Invalid piece");

  const value = state.diceValue!;
  let nextPos = piece.position;

  if (piece.position === -1) {
    if (value === 6) nextPos = 0;
    else throw new Error("Cannot move out of home without a 6");
  } else {
    if (piece.position + value > 57) throw new Error("Cannot move past finish");
    nextPos = piece.position + value;
  }

  const pIndex = state.pieces.findIndex((p: any) => p.id === pieceId);
  
  const getGlobalPos = (c: string, p: number) => {
    if (p < 0 || p >= 52) return null;
    const offsets: any = { red: 0, green: 13, yellow: 26, blue: 39 };
    return (p + offsets[c]) % 52;
  };

  const hostColors = ["red", "yellow"];
  const guestColors = ["green", "blue"];
  const friendlyColors = hostColors.includes(piece.color) ? hostColors : guestColors;

  const globalPos = getGlobalPos(piece.color, nextPos);
  let captured = false;
  const isSafe = [0, 8, 13, 21, 26, 34, 39, 47].includes(globalPos || -1);

  if (globalPos !== null && !isSafe) {
    state.pieces.forEach((other: any) => {
      // Only capture if it's NOT a friendly color
      if (!friendlyColors.includes(other.color)) {
        if (getGlobalPos(other.color, other.position) === globalPos) {
          other.position = -1;
          captured = true;
          state.history.push(`${piece.color} captured ${other.color}!`);
        }
      }
    });
  }

  state.pieces[pIndex].position = nextPos;
  
  const isHost = room.host_id === userId;
  const myColors = isHost ? ["red", "yellow"] : ["green", "blue"];
  
  const isWin = state.pieces.filter((p: any) => myColors.includes(p.color)).every((p: any) => p.position === 57);

  let nextTurn = state.turn;
  let nextSixCount = state.sixCount;

  if (value !== 6 && !captured && nextPos !== 57) {
    nextTurn = NEXT_TURN[state.turn as PieceColor];
    nextSixCount = 0;
  }
  
  state.history.push(`${state.turn} moved to ${nextPos}`);
  
  state.hasRolled = false;
  state.diceValue = null;
  state.turn = nextTurn;
  state.sixCount = nextSixCount;

  if (isWin) {
    const winnerId = userId || SYSTEM_BOT_ID;
    await handleGameOver(roomId, winnerId, room.stake);
    return { status: "finished", board_state: state };
  }

  let newCurrentTurn = room.current_turn; 
  if (nextTurn === "green" || nextTurn === "blue") newCurrentTurn = room.guest_id;
  if (nextTurn === "red" || nextTurn === "yellow") newCurrentTurn = room.host_id;

  const { error } = await supabaseAdmin.from("ludo_rooms").update({ board_state: state, current_turn: newCurrentTurn }).eq("id", roomId);
  if (error) throw error;

  return triggerBotIfApplicable(roomId, state, room, newCurrentTurn);
}

export async function resignGame(roomId: string, userId: string) {
  const { data: room, error } = await supabaseAdmin.from('ludo_rooms').select('*').eq('id', roomId).single();
  if (error || !room || room.status !== 'active') throw new Error('Invalid room');
  
  const winnerId = room.host_id === userId ? (room.guest_id || SYSTEM_BOT_ID) : room.host_id;
  await handleGameOver(roomId, winnerId, room.stake);
  return { winner_id: winnerId, message: 'Resigned' };
}

// Helpers
async function getAndValidateActiveRoom(roomId: string, userId: string | null) {
  const { data: room, error } = await supabaseAdmin.from("ludo_rooms").select("*").eq("id", roomId).single();
  if (error) throw error;
  if (!room) throw new Error("Room not found");
  if (room.status !== "active") throw new Error("Game is not active");
  if (userId !== null && room.current_turn !== userId) throw new Error("Not your overall turn");
  return room;
}

export async function cancelLudoRoom(roomId: string, userId: string) {
  const { data: room } = await supabaseAdmin.from('ludo_rooms').select('*').eq('id', roomId).single()
  if (!room) throw new Error('Room not found')
  if (room.host_id !== userId) throw new Error('Unauthorized')
  if (room.status !== 'waiting') throw new Error('Cannot cancel active or finished game')

  await supabaseAdmin.from('ludo_rooms').delete().eq('id', roomId)
}

async function handleEntryFee(userId: string, stake: number, ref: string) {
  if (stake > 0) {
    const { data: wallet } = await supabaseAdmin.from("wallets").select("balance").eq("user_id", userId).single();
    if (!wallet || wallet.balance < stake) throw new Error("Insufficient balance");
    await supabaseAdmin.rpc("decrement_wallet_balance", { p_user_id: userId, p_amount: stake });
    await supabaseAdmin.from("transactions").insert({ user_id: userId, type: "game_entry", amount: stake, status: "successful", reference: `PLZ-LUDO-${ref}` });
  }
}

// Very basic bot recursion for fast gameplay loop simulation
async function triggerBotIfApplicable(roomId: string, state: any, room: any, currentTurn: string | null): Promise<{ status: string; board_state: any }> {
  if (currentTurn === null && room.status === "active") {
    (async () => {
      try {
        // 1. Bot Rolls
        if (!state.hasRolled && state.diceValue === null) {
          await new Promise(r => setTimeout(r, 800));
          const rollRes = await rollDice(roomId, null);
          
          // 2. Bot Moves (if roll allowed a move)
          const newState = rollRes.board_state;
          if (newState.hasRolled && newState.diceValue !== null) {
            await new Promise(r => setTimeout(r, 800));
            const botPieceId = getBotLudoMove(newState.pieces, newState.diceValue, ["green", "blue"]);
            if (botPieceId) {
              await makeMove(roomId, null, botPieceId);
            }
          }
        }
      } catch (err) {
        console.error("Ludo Bot Error:", err);
      }
    })();
  }
  return { status: room.status, board_state: state };
}
