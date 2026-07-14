"""WebSocket endpoint and message routing for real-time game events."""

import json
import asyncio
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.auth.jwt import verify_token
from app.game.rooms import (
    rooms, get_room, Player, PlayerStatus, Guess, LockedFields,
)
from app.game.models import ClientMsgType, ServerMsgType
from app.game import manager
from app.game.evaluator import get_pending_guesses_for_creator
from app.config import MIN_PLAYERS

router = APIRouter()


# ─── Utility: send typed message ────────────────────────────────────

async def send_msg(ws: WebSocket, msg_type: ServerMsgType, data: dict = None):
    """Send a typed JSON message to a single client."""
    payload = {"type": msg_type.value}
    if data:
        payload.update(data)
    try:
        await ws.send_json(payload)
    except Exception:
        pass


async def broadcast(room_code: str, msg_type: ServerMsgType, data: dict = None, exclude: str = None):
    """Broadcast a typed message to all connected players in a room."""
    room = get_room(room_code)
    if not room:
        return
    for player in room.players.values():
        if player.status == PlayerStatus.CONNECTED and player.websocket:
            if exclude and player.id == exclude:
                continue
            await send_msg(player.websocket, msg_type, data)


async def send_to_player(room_code: str, player_id: str, msg_type: ServerMsgType, data: dict = None):
    """Send a message to a specific player."""
    room = get_room(room_code)
    if not room:
        return
    player = room.players.get(player_id)
    if player and player.websocket and player.status == PlayerStatus.CONNECTED:
        await send_msg(player.websocket, msg_type, data)


# ─── WebSocket Endpoint ─────────────────────────────────────────────

@router.websocket("/ws/{room_code}")
async def websocket_endpoint(websocket: WebSocket, room_code: str):
    """Main WebSocket endpoint for game communication."""
    # Accept connection first
    await websocket.accept()

    # Authenticate via token query param
    token = websocket.query_params.get("token")
    if not token:
        await send_msg(websocket, ServerMsgType.ERROR, {"message": "No token provided"})
        await websocket.close()
        return

    try:
        payload = verify_token(token)
    except Exception:
        await send_msg(websocket, ServerMsgType.ERROR, {"message": "Invalid token"})
        await websocket.close()
        return

    user_id = str(payload.get("sub"))
    username = payload.get("username", "Unknown")

    # Get room
    room = get_room(room_code)
    if not room:
        await send_msg(websocket, ServerMsgType.ERROR, {"message": "Room not found"})
        await websocket.close()
        return

    # Check if player is reconnecting
    existing_player = room.players.get(user_id)
    if existing_player:
        # Reconnection
        existing_player.websocket = websocket
        existing_player.status = PlayerStatus.CONNECTED
        await broadcast(room_code, ServerMsgType.PLAYER_RECONNECTED, {"playerId": user_id})
        # Send full state sync
        await send_room_state(websocket, room, user_id)
    else:
        # New player
        from app.config import MAX_PLAYERS
        if len(room.get_connected_players()) >= MAX_PLAYERS:
            await send_msg(websocket, ServerMsgType.ERROR, {"message": "Room is full"})
            await websocket.close()
            return

        if room.state != "LOBBY":
            await send_msg(websocket, ServerMsgType.ERROR, {"message": "Game already in progress"})
            await websocket.close()
            return

        player = Player(id=user_id, username=username, websocket=websocket)
        room.players[user_id] = player
        room.turn_order.append(user_id)

        # Set host if first player
        if not room.host_id:
            room.host_id = user_id

        # Broadcast player joined
        await broadcast(room_code, ServerMsgType.PLAYER_JOINED, {
            "players": [p.to_dict() for p in room.players.values()],
            "hostId": room.host_id,
        })

    # ─── Message loop ────────────────────────────────────────────
    try:
        while True:
            raw = await websocket.receive_text()
            try:
                msg = json.loads(raw)
            except json.JSONDecodeError:
                await send_msg(websocket, ServerMsgType.ERROR, {"message": "Invalid JSON"})
                continue

            msg_type = msg.get("type")
            await handle_message(room_code, user_id, msg_type, msg)

    except WebSocketDisconnect:
        await handle_disconnect(room_code, user_id)


# ─── Room State Sync (for reconnection) ─────────────────────────────

async def send_room_state(ws: WebSocket, room, user_id: str):
    """Send full room state to a reconnecting player."""
    state_data = room.to_dict()

    # Include challenge hints if game is in progress
    if room.challenge:
        state_data["hints"] = room.challenge.get_hints()

    # Include this player's guess/locked fields (private)
    guess = room.guesses.get(user_id)
    if guess:
        state_data["myGuess"] = guess.to_dict()

    # If this player is the creator, include all pending guesses
    if room.challenge and room.challenge.creator_id == user_id:
        state_data["pendingGuesses"] = get_pending_guesses_for_creator(room)

    await send_msg(ws, ServerMsgType.ROOM_STATE, state_data)


# ─── Message Handler ────────────────────────────────────────────────

async def handle_message(room_code: str, user_id: str, msg_type: str, msg: dict):
    """Route incoming messages to appropriate handlers."""
    room = get_room(room_code)
    if not room:
        return

    if msg_type == ClientMsgType.PLAYER_READY:
        await handle_player_ready(room, user_id)

    elif msg_type == ClientMsgType.CREATE_CHALLENGE:
        await handle_create_challenge(room, user_id, msg)

    elif msg_type == ClientMsgType.SUBMIT_GUESS:
        await handle_submit_guess(room, user_id, msg)

    elif msg_type == ClientMsgType.EVALUATE_FIELD:
        await handle_evaluate_field(room, user_id, msg)

    elif msg_type == ClientMsgType.PLAY_AGAIN:
        await handle_play_again(room, user_id)

    elif msg_type == ClientMsgType.LEAVE_ROOM:
        await handle_leave(room, user_id)

    elif msg_type == ClientMsgType.CHAT_MESSAGE:
        await handle_chat_message(room, user_id, msg)


# ─── Individual Handlers ────────────────────────────────────────────

async def handle_chat_message(room, user_id: str, msg: dict):
    """Handle an incoming chat message."""
    text = msg.get("message", "").strip()
    if not text:
        return

    player = room.players.get(user_id)
    if not player:
        return

    import uuid
    from datetime import datetime
    
    # Broadcast to all players in the room
    await broadcast(room.code, ServerMsgType.CHAT_MESSAGE, {
        "id": str(uuid.uuid4()),
        "senderId": user_id,
        "senderName": player.username,
        "text": text,
        "timestamp": datetime.utcnow().isoformat() + "Z"
    })

async def handle_player_ready(room, user_id: str):
    """Handle a player marking themselves as ready."""
    player = room.players.get(user_id)
    if not player or room.state != "LOBBY":
        return

    player.ready = True
    ready_players = [p.id for p in room.players.values() if p.ready]

    await broadcast(room.code, ServerMsgType.PLAYER_READY_UPDATE, {
        "playerId": user_id,
        "readyPlayers": ready_players,
    })

    # Check if all players are ready and we have minimum
    if room.all_ready():
        manager.start_game(room)
        await broadcast(room.code, ServerMsgType.GAME_STARTED, {
            "players": [p.to_dict() for p in room.players.values()],
            "totalRounds": room.total_rounds,
            "currentRound": room.current_round,
            "turnPlayerId": room.get_turn_player_id(),
        })


async def handle_create_challenge(room, user_id: str, msg: dict):
    """Handle the turn player creating a challenge."""
    # Verify it's this player's turn
    if room.get_turn_player_id() != user_id:
        player = room.players.get(user_id)
        if player and player.websocket:
            await send_msg(player.websocket, ServerMsgType.ERROR, {"message": "Not your turn"})
        return

    hero = msg.get("hero", "").strip()
    movie = msg.get("movie", "").strip()
    heroine = msg.get("heroine", "").strip()

    if not hero or not movie or not heroine:
        player = room.players.get(user_id)
        if player and player.websocket:
            await send_msg(player.websocket, ServerMsgType.ERROR, {"message": "All fields required"})
        return

    manager.set_challenge(room, user_id, hero, movie, heroine)

    # Broadcast hints to all players (including creator)
    hints = room.challenge.get_hints()
    await broadcast(room.code, ServerMsgType.NEW_CHALLENGE, hints)


async def handle_submit_guess(room, user_id: str, msg: dict):
    """Handle a guess submission."""
    if not room.challenge or room.challenge.creator_id == user_id:
        return

    hero = msg.get("hero")
    movie = msg.get("movie")
    heroine = msg.get("heroine")

    guess = manager.submit_guess(room, user_id, hero, movie, heroine)
    if not guess:
        return

    # Notify creator that a guess arrived (with guess details for evaluation)
    creator_id = room.challenge.creator_id
    player = room.players.get(user_id)
    await send_to_player(room.code, creator_id, ServerMsgType.GUESS_RECEIVED, {
        "playerId": user_id,
        "username": player.username if player else "Unknown",
        "hero": guess.hero,
        "movie": guess.movie,
        "heroine": guess.heroine,
        "locked": guess.locked.to_dict(),
    })


async def handle_evaluate_field(room, user_id: str, msg: dict):
    """Handle instant field evaluation (right/wrong checkbox)."""
    if not room.challenge or room.challenge.creator_id != user_id:
        return

    player_id = msg.get("playerId")
    field_name = msg.get("field")
    status = msg.get("status", "pending")

    if field_name not in ("hero", "movie", "heroine"):
        return

    result = manager.evaluate_field(room, player_id, field_name, status)
    if not result:
        return

    # Send evaluation result ONLY to the guesser (private)
    await send_to_player(room.code, player_id, ServerMsgType.EVALUATION_RESULT, result)

    # Also send updated state to creator
    await send_to_player(room.code, user_id, ServerMsgType.EVALUATION_RESULT, result)

    # Check if player solved
    if manager.check_player_solved(room, player_id):
        manager.award_point(room, player_id)
        solver = room.players.get(player_id)

        # Broadcast that someone solved (no guess details revealed)
        await broadcast(room.code, ServerMsgType.PLAYER_SOLVED, {
            "playerId": player_id,
            "username": solver.username if solver else "Unknown",
        })

        # Brief delay for dramatic effect
        await asyncio.sleep(1)

        # Get answer (from challenge, not from guess)
        answer = {
            "hero": room.challenge.hero,
            "movie": room.challenge.movie,
            "heroine": room.challenge.heroine,
        }

        # Advance turn
        game_over = manager.advance_turn(room)

        if game_over:
            winner_info = manager.get_winner(room)
            await broadcast(room.code, ServerMsgType.ROUND_FINISHED, {
                "answer": answer,
                "scores": room.get_scores(),
            })
            await asyncio.sleep(1)
            await broadcast(room.code, ServerMsgType.GAME_OVER, {
                "scores": room.get_scores(),
                **winner_info,
            })
        else:
            await broadcast(room.code, ServerMsgType.ROUND_FINISHED, {
                "answer": answer,
                "scores": room.get_scores(),
            })
            await asyncio.sleep(2)
            # Announce next turn
            await broadcast(room.code, ServerMsgType.NEW_TURN, {
                "turnPlayerId": room.get_turn_player_id(),
                "currentRound": room.current_round,
            })


async def handle_play_again(room, user_id: str):
    """Handle Play Again request."""
    manager.reset_for_replay(room)

    await broadcast(room.code, ServerMsgType.PLAYER_JOINED, {
        "players": [p.to_dict() for p in room.players.values()],
        "hostId": room.host_id,
    })


async def handle_leave(room, user_id: str):
    """Handle player leaving."""
    player = room.players.get(user_id)
    if player:
        player.status = PlayerStatus.LEFT
        player.websocket = None

    # Remove from turn order
    if user_id in room.turn_order:
        room.turn_order.remove(user_id)

    await broadcast(room.code, ServerMsgType.PLAYER_LEFT, {
        "playerId": user_id,
        "players": [p.to_dict() for p in room.get_connected_players()],
    })

    # Transfer host if needed
    if room.host_id == user_id:
        connected = room.get_connected_players()
        if connected:
            room.host_id = connected[0].id

    # Delete room if empty
    from app.game.rooms import delete_room
    if not room.get_connected_players():
        delete_room(room.code)


async def handle_disconnect(room_code: str, user_id: str):
    """Handle WebSocket disconnection."""
    room = get_room(room_code)
    if not room:
        return

    player = room.players.get(user_id)
    if player:
        player.status = PlayerStatus.DISCONNECTED
        player.websocket = None

    await broadcast(room_code, ServerMsgType.PLAYER_DISCONNECTED, {
        "playerId": user_id,
    })

    # Transfer host if needed
    if room.host_id == user_id:
        connected = room.get_connected_players()
        connected_only = [p for p in connected if p.status == PlayerStatus.CONNECTED]
        if connected_only:
            room.host_id = connected_only[0].id

    # Delete room if all players disconnected/left
    all_gone = all(
        p.status in (PlayerStatus.DISCONNECTED, PlayerStatus.LEFT)
        for p in room.players.values()
    )
    if all_gone:
        from app.game.rooms import delete_room
        delete_room(room_code)
