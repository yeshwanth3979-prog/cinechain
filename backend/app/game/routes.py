"""REST routes for room creation and joining."""

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from app.auth.jwt import get_current_user
from app.game.rooms import generate_room_code, create_room, get_room
from app.config import MAX_PLAYERS

router = APIRouter(prefix="/api/rooms", tags=["rooms"])


class CreateRoomResponse(BaseModel):
    room_code: str


class JoinRoomRequest(BaseModel):
    room_code: str


class JoinRoomResponse(BaseModel):
    room_code: str
    players: list


@router.post("/create", response_model=CreateRoomResponse)
async def create_room_endpoint(current_user: dict = Depends(get_current_user)):
    """Create a new room and return the room code."""
    code = generate_room_code()
    room = create_room(code, host_id=str(current_user["id"]))
    return CreateRoomResponse(room_code=code)


@router.post("/join", response_model=JoinRoomResponse)
async def join_room_endpoint(req: JoinRoomRequest, current_user: dict = Depends(get_current_user)):
    """Validate a room code before the client opens the WebSocket."""
    room = get_room(req.room_code.upper())
    if not room:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Room not found",
        )

    if room.state != "LOBBY":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Game already in progress",
        )

    if len(room.get_connected_players()) >= MAX_PLAYERS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Room is full",
        )

    return JoinRoomResponse(
        room_code=room.code,
        players=[p.to_dict() for p in room.players.values()],
    )
