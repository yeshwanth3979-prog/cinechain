"""Game manager: handles game flow, turns, rounds, scoring, and winner detection."""

from app.game.rooms import Room, RoomState, Guess, LockedFields, Challenge


def start_game(room: Room):
    """Initialize game state when all players are ready."""
    active_players = room.get_connected_players()
    room.state = RoomState.PLAYING
    room.turn_order = [p.id for p in active_players]
    room.turn_index = 0
    room.current_round = 1
    room.total_rounds = len(active_players)
    room.challenge = None
    room.guesses = {}

    # Reset scores
    for player in room.players.values():
        player.score = 0
        player.ready = False


def set_challenge(room: Room, creator_id: str, hero: str, movie: str, heroine: str):
    """Store a new challenge in the room."""
    room.challenge = Challenge(
        hero=hero.strip(),
        movie=movie.strip(),
        heroine=heroine.strip(),
        creator_id=creator_id,
        round=room.current_round,
    )
    # Initialize empty guesses for all non-creator players
    room.guesses = {}
    for pid in room.turn_order:
        if pid != creator_id:
            room.guesses[pid] = Guess(player_id=pid, locked=LockedFields())


def submit_guess(room: Room, player_id: str, hero: str = None, movie: str = None, heroine: str = None):
    """Update a player's guess for unlocked fields only."""
    guess = room.guesses.get(player_id)
    if not guess:
        return None

    # Only update unlocked fields
    if hero is not None and not guess.locked.hero:
        guess.hero = hero.strip()
    if movie is not None and not guess.locked.movie:
        guess.movie = movie.strip()
    if heroine is not None and not guess.locked.heroine:
        guess.heroine = heroine.strip()

    return guess


def evaluate_field(room: Room, player_id: str, field_name: str, status: str) -> dict:
    """
    Evaluate a single field for a player.
    status should be one of "correct", "wrong", or "pending".
    Returns the evaluation result dict.
    """
    guess = room.guesses.get(player_id)
    if not guess:
        return None

    is_correct = (status == "correct")
    is_wrong = (status == "wrong")

    # Update status
    if field_name == "hero":
        guess.locked.hero = is_correct
        guess.wrong.hero = is_wrong
    elif field_name == "movie":
        guess.locked.movie = is_correct
        guess.wrong.movie = is_wrong
    elif field_name == "heroine":
        guess.locked.heroine = is_correct
        guess.wrong.heroine = is_wrong

    return {
        "playerId": player_id,
        "field": field_name,
        "status": status,
        "locked": guess.locked.to_dict(),
        "wrong": guess.wrong.to_dict(),
    }


def check_player_solved(room: Room, player_id: str) -> bool:
    """Check if a player has all fields locked (solved)."""
    guess = room.guesses.get(player_id)
    if not guess:
        return False
    return guess.locked.all_correct()


def award_point(room: Room, player_id: str):
    """Give +1 point to the solving player."""
    player = room.players.get(player_id)
    if player:
        player.score += 1


def advance_turn(room: Room) -> bool:
    """
    Move to the next turn.
    Returns True if game is over (all rounds complete), False otherwise.
    """
    room.turn_index += 1
    room.current_round += 1
    room.challenge = None
    room.guesses = {}

    if room.current_round > room.total_rounds:
        room.state = RoomState.FINISHED
        return True  # Game over

    return False


def get_winner(room: Room) -> dict:
    """Get the winner (highest score). Ties broken by join order."""
    scores = room.get_scores()
    if not scores:
        return None

    max_score = scores[0]["score"]
    # In case of tie, first in the list (which is sorted by score, then by join order)
    winner = scores[0]
    return {
        "winnerId": winner["id"],
        "winnerName": winner["username"],
    }


def reset_for_replay(room: Room):
    """Reset room for a new game (Play Again)."""
    room.state = RoomState.LOBBY
    room.turn_index = 0
    room.current_round = 0
    room.total_rounds = 0
    room.challenge = None
    room.guesses = {}

    for player in room.players.values():
        player.score = 0
        player.ready = False
