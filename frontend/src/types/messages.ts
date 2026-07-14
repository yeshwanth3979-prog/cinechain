/* WebSocket message type definitions */

// Client → Server
export type ClientMessage =
    | { type: "PLAYER_READY" }
    | { type: "CREATE_CHALLENGE"; hero: string; movie: string; heroine: string }
    | { type: "SUBMIT_GUESS"; hero?: string; movie?: string; heroine?: string }
    | { type: "EVALUATE_FIELD"; playerId: string; field: "hero" | "movie" | "heroine"; status: "correct" | "wrong" | "pending" }
    | { type: "PLAY_AGAIN" }
    | { type: "LEAVE_ROOM" };

// Server → Client
export type ServerMessageType =
    | "PLAYER_JOINED"
    | "PLAYER_READY_UPDATE"
    | "GAME_STARTED"
    | "NEW_TURN"
    | "NEW_CHALLENGE"
    | "GUESS_RECEIVED"
    | "EVALUATION_RESULT"
    | "PLAYER_SOLVED"
    | "ROUND_FINISHED"
    | "SCORE_UPDATED"
    | "GAME_OVER"
    | "PLAYER_LEFT"
    | "PLAYER_DISCONNECTED"
    | "PLAYER_RECONNECTED"
    | "ERROR"
    | "ROOM_STATE";

export interface ServerMessage {
    type: ServerMessageType;
    [key: string]: unknown;
}
