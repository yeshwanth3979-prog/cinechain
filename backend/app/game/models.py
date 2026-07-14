"""WebSocket message type enums and payload schemas."""

from enum import Enum
from pydantic import BaseModel
from typing import Optional


# ─── Client → Server message types ──────────────────────────────────
class ClientMsgType(str, Enum):
    PLAYER_READY = "PLAYER_READY"
    CREATE_CHALLENGE = "CREATE_CHALLENGE"
    SUBMIT_GUESS = "SUBMIT_GUESS"
    EVALUATE_FIELD = "EVALUATE_FIELD"
    PLAY_AGAIN = "PLAY_AGAIN"
    LEAVE_ROOM = "LEAVE_ROOM"
    CHAT_MESSAGE = "CHAT_MESSAGE"


# ─── Server → Client message types ──────────────────────────────────
class ServerMsgType(str, Enum):
    PLAYER_JOINED = "PLAYER_JOINED"
    PLAYER_READY_UPDATE = "PLAYER_READY_UPDATE"
    GAME_STARTED = "GAME_STARTED"
    NEW_TURN = "NEW_TURN"
    NEW_CHALLENGE = "NEW_CHALLENGE"
    GUESS_RECEIVED = "GUESS_RECEIVED"
    EVALUATION_RESULT = "EVALUATION_RESULT"
    PLAYER_SOLVED = "PLAYER_SOLVED"
    ROUND_FINISHED = "ROUND_FINISHED"
    SCORE_UPDATED = "SCORE_UPDATED"
    GAME_OVER = "GAME_OVER"
    PLAYER_LEFT = "PLAYER_LEFT"
    PLAYER_DISCONNECTED = "PLAYER_DISCONNECTED"
    PLAYER_RECONNECTED = "PLAYER_RECONNECTED"
    ERROR = "ERROR"
    ROOM_STATE = "ROOM_STATE"  # Full state sync for reconnection
    CHAT_MESSAGE = "CHAT_MESSAGE"
