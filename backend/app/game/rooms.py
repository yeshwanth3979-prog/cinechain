"""In-memory room storage and data classes."""

import time
import string
import random
from enum import Enum
from typing import Optional
from dataclasses import dataclass, field
from fastapi import WebSocket


# ─── Enums ───────────────────────────────────────────────────────────

class RoomState(str, Enum):
    LOBBY = "LOBBY"
    PLAYING = "PLAYING"
    FINISHED = "FINISHED"


class PlayerStatus(str, Enum):
    CONNECTED = "connected"
    DISCONNECTED = "disconnected"
    LEFT = "left"


# ─── Data Classes ────────────────────────────────────────────────────

@dataclass
class Player:
    id: str
    username: str
    score: int = 0
    joined_at: float = field(default_factory=time.time)
    status: PlayerStatus = PlayerStatus.CONNECTED
    ready: bool = False
    websocket: Optional[WebSocket] = field(default=None, repr=False)

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "username": self.username,
            "score": self.score,
            "joinedAt": self.joined_at,
            "status": self.status.value,
            "ready": self.ready,
        }


@dataclass
class Challenge:
    hero: str
    movie: str
    heroine: str
    creator_id: str
    round: int

    def to_dict(self) -> dict:
        return {
            "hero": self.hero,
            "movie": self.movie,
            "heroine": self.heroine,
            "creatorId": self.creator_id,
            "round": self.round,
        }

    def get_hints(self) -> dict:
        """Return first letter of each field."""
        return {
            "heroHint": self.hero[0].upper() if self.hero else "",
            "movieHint": self.movie[0].upper() if self.movie else "",
            "heroineHint": self.heroine[0].upper() if self.heroine else "",
        }


@dataclass
class LockedFields:
    hero: bool = False
    movie: bool = False
    heroine: bool = False

    def to_dict(self) -> dict:
        return {"hero": self.hero, "movie": self.movie, "heroine": self.heroine}

    def all_correct(self) -> bool:
        return self.hero and self.movie and self.heroine


@dataclass
class Guess:
    player_id: str
    hero: Optional[str] = None
    movie: Optional[str] = None
    heroine: Optional[str] = None
    locked: LockedFields = field(default_factory=LockedFields)

    def to_dict(self) -> dict:
        return {
            "playerId": self.player_id,
            "hero": self.hero,
            "movie": self.movie,
            "heroine": self.heroine,
            "locked": self.locked.to_dict(),
        }


@dataclass
class Room:
    code: str
    host_id: str
    state: RoomState = RoomState.LOBBY
    players: dict = field(default_factory=dict)       # player_id → Player
    turn_order: list = field(default_factory=list)     # player IDs in join order
    turn_index: int = 0
    current_round: int = 0
    total_rounds: int = 0
    challenge: Optional[Challenge] = None
    guesses: dict = field(default_factory=dict)        # player_id → Guess

    def get_turn_player_id(self) -> Optional[str]:
        if not self.turn_order:
            return None
        return self.turn_order[self.turn_index]

    def get_connected_players(self) -> list:
        return [
            p for p in self.players.values()
            if p.status != PlayerStatus.LEFT
        ]

    def get_scores(self) -> list:
        return sorted(
            [p.to_dict() for p in self.players.values() if p.status != PlayerStatus.LEFT],
            key=lambda x: x["score"],
            reverse=True,
        )

    def all_ready(self) -> bool:
        active = self.get_connected_players()
        return len(active) >= 2 and all(p.ready for p in active)

    def to_dict(self) -> dict:
        return {
            "code": self.code,
            "hostId": self.host_id,
            "state": self.state.value,
            "players": [p.to_dict() for p in self.players.values()],
            "turnOrder": self.turn_order,
            "turnIndex": self.turn_index,
            "currentRound": self.current_round,
            "totalRounds": self.total_rounds,
            "turnPlayerId": self.get_turn_player_id(),
        }


# ─── Global rooms storage ───────────────────────────────────────────

rooms: dict[str, Room] = {}


def generate_room_code() -> str:
    """Generate a unique 6-character alphanumeric room code."""
    chars = string.ascii_uppercase + string.digits
    while True:
        code = "".join(random.choices(chars, k=6))
        if code not in rooms:
            return code


def get_room(code: str) -> Optional[Room]:
    """Get a room by its code."""
    return rooms.get(code)


def create_room(code: str, host_id: str) -> Room:
    """Create a new room."""
    room = Room(code=code, host_id=host_id)
    rooms[code] = room
    return room


def delete_room(code: str):
    """Delete a room from memory."""
    rooms.pop(code, None)
