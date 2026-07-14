/* GameContext: manages turn, challenge, guesses, evaluation, scores, and game state transitions */

import {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    type ReactNode,
} from "react";
import { GameState } from "../types/game";
import type { Player, Challenge, Guess, PendingGuess, Answer, LockedFields, ChatMessage } from "../types/game";
import type { ServerMessage } from "../types/messages";
import { wsService } from "../services/websocket";
import { useRoom } from "./RoomContext";
import { useAuth } from "./AuthContext";

interface GameContextType {
    gameState: GameState;
    turnPlayerId: string | null;
    currentRound: number;
    totalRounds: number;
    challenge: Challenge | null;
    myGuess: Guess | null;
    pendingGuesses: PendingGuess[];
    scores: Player[];
    answer: Answer | null;
    winnerId: string | null;
    winnerName: string | null;
    solverName: string | null;
    readyPlayers: string[];
    chatMessages: ChatMessage[];
    setGameState: (state: GameState) => void;
    resetGame: () => void;
}

const GameContext = createContext<GameContextType | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
    const { setPlayers, setHostId } = useRoom();
    const { user } = useAuth();

    const [gameState, setGameState] = useState<GameState>(GameState.LOBBY);
    const [turnPlayerId, setTurnPlayerId] = useState<string | null>(null);
    const [currentRound, setCurrentRound] = useState(0);
    const [totalRounds, setTotalRounds] = useState(0);
    const [challenge, setChallenge] = useState<Challenge | null>(null);
    const [myGuess, setMyGuess] = useState<Guess | null>(null);
    const [pendingGuesses, setPendingGuesses] = useState<PendingGuess[]>([]);
    const [scores, setScores] = useState<Player[]>([]);
    const [answer, setAnswer] = useState<Answer | null>(null);
    const [winnerId, setWinnerId] = useState<string | null>(null);
    const [winnerName, setWinnerName] = useState<string | null>(null);
    const [solverName, setSolverName] = useState<string | null>(null);
    const [readyPlayers, setReadyPlayers] = useState<string[]>([]);
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

    const resetGame = useCallback(() => {
        setGameState(GameState.LOBBY);
        setTurnPlayerId(null);
        setCurrentRound(0);
        setTotalRounds(0);
        setChallenge(null);
        setMyGuess(null);
        setPendingGuesses([]);
        setScores([]);
        setAnswer(null);
        setWinnerId(null);
        setWinnerName(null);
        setSolverName(null);
        setReadyPlayers([]);
        setChatMessages([]);
    }, []);

    // Handle incoming WebSocket messages
    const handleMessage = useCallback(
        (msg: ServerMessage) => {
            switch (msg.type) {
                case "PLAYER_JOINED": {
                    setPlayers(msg.players as Player[]);
                    setHostId(msg.hostId as string);
                    break;
                }

                case "PLAYER_READY_UPDATE": {
                    setReadyPlayers(msg.readyPlayers as string[]);
                    break;
                }

                case "GAME_STARTED": {
                    setPlayers(msg.players as Player[]);
                    setTotalRounds(msg.totalRounds as number);
                    setCurrentRound(msg.currentRound as number);
                    setTurnPlayerId(msg.turnPlayerId as string);
                    setScores(msg.players as Player[]);
                    setChallenge(null);
                    setMyGuess(null);
                    setPendingGuesses([]);
                    setAnswer(null);
                    setSolverName(null);

                    // If it's our turn, go to CREATE_CHALLENGE, otherwise wait
                    const myId = String(user?.id);
                    if (msg.turnPlayerId === myId) {
                        setGameState(GameState.CREATE_CHALLENGE);
                    } else {
                        setGameState(GameState.GUESSING);
                    }
                    break;
                }

                case "NEW_TURN": {
                    setTurnPlayerId(msg.turnPlayerId as string);
                    setCurrentRound(msg.currentRound as number);
                    setChallenge(null);
                    setMyGuess(null);
                    setPendingGuesses([]);
                    setAnswer(null);
                    setSolverName(null);

                    const myId = String(user?.id);
                    if (msg.turnPlayerId === myId) {
                        setGameState(GameState.CREATE_CHALLENGE);
                    } else {
                        setGameState(GameState.GUESSING);
                    }
                    break;
                }

                case "NEW_CHALLENGE": {
                    const hints: Challenge = {
                        heroHint: msg.heroHint as string,
                        movieHint: msg.movieHint as string,
                        heroineHint: msg.heroineHint as string,
                    };
                    setChallenge(hints);

                    const myId = String(user?.id);
                    if (turnPlayerId === myId) {
                        // Creator sees evaluation view
                        setGameState(GameState.EVALUATION);
                    } else {
                        // Guessers see guess form
                        setMyGuess({
                            playerId: myId,
                            hero: null,
                            movie: null,
                            heroine: null,
                            locked: { hero: false, movie: false, heroine: false },
                            wrong: { hero: false, movie: false, heroine: false },
                        });
                        setGameState(GameState.GUESSING);
                    }
                    break;
                }

                case "GUESS_RECEIVED": {
                    // Only creator sees this
                    setPendingGuesses((prev) => {
                        const existing = prev.findIndex((g) => g.playerId === msg.playerId);
                        const guess: PendingGuess = {
                            playerId: msg.playerId as string,
                            username: msg.username as string,
                            hero: msg.hero as string | null,
                            movie: msg.movie as string | null,
                            heroine: msg.heroine as string | null,
                            locked: msg.locked as LockedFields,
                            wrong: msg.wrong as LockedFields,
                        };
                        if (existing >= 0) {
                            const updated = [...prev];
                            updated[existing] = guess;
                            return updated;
                        }
                        return [...prev, guess];
                    });
                    break;
                }

                case "EVALUATION_RESULT": {
                    const pid = msg.playerId as string;
                    const field = msg.field as "hero" | "movie" | "heroine";
                    const status = msg.status as string;
                    const locked = msg.locked as LockedFields;
                    const wrong = msg.wrong as LockedFields;
                    const myId = String(user?.id);

                    if (pid === myId) {
                        // I'm the guesser — update my locked fields
                        setMyGuess((prev) => {
                            if (!prev) return prev;
                            return { ...prev, locked, wrong };
                        });
                    }

                    // Update pending guesses (creator view)
                    setPendingGuesses((prev) =>
                        prev.map((g) => {
                            if (g.playerId === pid) {
                                return { ...g, locked, wrong };
                            }
                            return g;
                        })
                    );
                    break;
                }

                case "PLAYER_SOLVED": {
                    setSolverName(msg.username as string);
                    break;
                }

                case "ROUND_FINISHED": {
                    setAnswer(msg.answer as Answer);
                    setScores(msg.scores as Player[]);
                    setGameState(GameState.ROUND_RESULT);
                    break;
                }

                case "GAME_OVER": {
                    setScores(msg.scores as Player[]);
                    setWinnerId(msg.winnerId as string);
                    setWinnerName(msg.winnerName as string);
                    setGameState(GameState.GAME_OVER);
                    break;
                }

                case "PLAYER_LEFT": {
                    setPlayers(msg.players as Player[]);
                    break;
                }

                case "PLAYER_DISCONNECTED": {
                    // Could show toast notification
                    break;
                }

                case "PLAYER_RECONNECTED": {
                    break;
                }

                case "ROOM_STATE": {
                    // Full state sync on reconnection
                    setPlayers(msg.players as Player[]);
                    setTurnPlayerId(msg.turnPlayerId as string | null);
                    setCurrentRound(msg.currentRound as number);
                    setTotalRounds(msg.totalRounds as number);

                    if (msg.hints) {
                        setChallenge(msg.hints as Challenge);
                    }
                    if (msg.myGuess) {
                        setMyGuess(msg.myGuess as Guess);
                    }
                    if (msg.pendingGuesses) {
                        setPendingGuesses(msg.pendingGuesses as PendingGuess[]);
                    }

                    // Determine game state from room state
                    const state = msg.state as string;
                    if (state === "LOBBY") {
                        setGameState(GameState.LOBBY);
                    } else if (state === "FINISHED") {
                        setGameState(GameState.GAME_OVER);
                    } else if (state === "PLAYING") {
                        const myId = String(user?.id);
                        if (msg.turnPlayerId === myId && !msg.hints) {
                            setGameState(GameState.CREATE_CHALLENGE);
                        } else if (msg.turnPlayerId === myId && msg.hints) {
                            setGameState(GameState.EVALUATION);
                        } else {
                            setGameState(GameState.GUESSING);
                        }
                    }
                    break;
                }

                case "CHAT_MESSAGE": {
                    const chatMsg: ChatMessage = {
                        id: msg.id as string,
                        senderId: msg.senderId as string,
                        senderName: msg.senderName as string,
                        text: msg.text as string,
                        timestamp: msg.timestamp as string,
                    };
                    setChatMessages((prev) => [...prev, chatMsg]);
                    break;
                }

                case "ERROR": {
                    console.error("[Game Error]:", msg.message);
                    break;
                }
            }
        },
        [user, setPlayers, setHostId, turnPlayerId]
    );

    // Subscribe to WS messages
    useEffect(() => {
        const unsubscribe = wsService.onMessage(handleMessage);
        return unsubscribe;
    }, [handleMessage]);

    return (
        <GameContext.Provider
            value={{
                gameState,
                turnPlayerId,
                currentRound,
                totalRounds,
                challenge,
                myGuess,
                pendingGuesses,
                scores,
                answer,
                winnerId,
                winnerName,
                solverName,
                readyPlayers,
                chatMessages,
                setGameState,
                resetGame,
            }}
        >
            {children}
        </GameContext.Provider>
    );
}

export function useGame() {
    const context = useContext(GameContext);
    if (!context) throw new Error("useGame must be used within GameProvider");
    return context;
}
