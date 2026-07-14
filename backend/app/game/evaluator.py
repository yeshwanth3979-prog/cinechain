"""Evaluation helper utilities."""

from app.game.rooms import Room, Guess


def get_pending_guesses_for_creator(room: Room) -> list[dict]:
    """
    Get all submitted guesses for the creator to review.
    Only returns guesses that have at least one field submitted.
    """
    pending = []
    for pid, guess in room.guesses.items():
        if guess.hero or guess.movie or guess.heroine:
            player = room.players.get(pid)
            pending.append({
                "playerId": pid,
                "username": player.username if player else "Unknown",
                "hero": guess.hero,
                "movie": guess.movie,
                "heroine": guess.heroine,
                "locked": guess.locked.to_dict(),
            })
    return pending
