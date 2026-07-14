/* Game types and enums */

export enum GameState {
    LOBBY = "LOBBY",
    CREATE_CHALLENGE = "CREATE_CHALLENGE",
    GUESSING = "GUESSING",
    EVALUATION = "EVALUATION",
    ROUND_RESULT = "ROUND_RESULT",
    GAME_OVER = "GAME_OVER",
}

export interface Player {
    id: string;
    username: string;
    score: number;
    joinedAt: number;
    status: "connected" | "disconnected" | "left";
    ready: boolean;
}

export interface LockedFields {
    hero: boolean;
    movie: boolean;
    heroine: boolean;
}

export interface Challenge {
    heroHint: string;
    movieHint: string;
    heroineHint: string;
}

export interface Guess {
    playerId: string;
    hero: string | null;
    movie: string | null;
    heroine: string | null;
    locked: LockedFields;
    wrong: LockedFields;
}

export interface Answer {
    hero: string;
    movie: string;
    heroine: string;
}

export interface PendingGuess {
    playerId: string;
    username: string;
    hero: string | null;
    movie: string | null;
    heroine: string | null;
    locked: LockedFields;
    wrong: LockedFields;
}
