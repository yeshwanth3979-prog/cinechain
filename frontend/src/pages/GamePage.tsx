/* GamePage: renders the correct sub-view based on GameState */

import { useParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useRoom } from "../contexts/RoomContext";
import { useGame } from "../contexts/GameContext";
import { useAuth } from "../contexts/AuthContext";
import { GameState } from "../types/game";
import { wsService } from "../services/websocket";

import Navbar from "../components/Navbar";
import Lobby from "../components/Lobby";
import ChallengeForm from "../components/ChallengeForm";
import GuessForm from "../components/GuessForm";
import EvaluationCard from "../components/EvaluationCard";
import ScoreBoard from "../components/ScoreBoard";
import RoundResult from "../components/RoundResult";
import WinnerScreen from "../components/WinnerScreen";
import ChatBox from "../components/ChatBox";

export default function GamePage() {
    const { code } = useParams<{ code: string }>();
    const { roomCode, setRoomCode, players } = useRoom();
    const { gameState, turnPlayerId, currentRound, totalRounds } = useGame();
    const { user } = useAuth();
    const navigate = useNavigate();
    const myId = String(user?.id);

    // Set room code from URL if not already set
    useEffect(() => {
        if (code && !roomCode) {
            setRoomCode(code);
        }
    }, [code, roomCode, setRoomCode]);

    // If WS isn't connected and we don't have a room, go home
    useEffect(() => {
        if (!wsService.isConnected && !roomCode) {
            navigate("/");
        }
    }, [roomCode, navigate]);

    // Get current turn player's username
    const turnPlayer = players.find((p) => p.id === turnPlayerId);
    const isMyTurn = turnPlayerId === myId;

    const renderGameView = () => {
        switch (gameState) {
            case GameState.LOBBY:
                return <Lobby />;

            case GameState.CREATE_CHALLENGE:
                return (
                    <div className="flex flex-col items-center gap-6 w-full max-w-md mx-auto">
                        <div className="text-center">
                            <p className="text-sm text-purple-400 uppercase tracking-widest mb-1">
                                Round {currentRound} / {totalRounds}
                            </p>
                            <p className="text-gray-400 text-sm">It's your turn!</p>
                        </div>
                        <ChallengeForm />
                    </div>
                );

            case GameState.GUESSING:
                return (
                    <div className="flex flex-col items-center gap-6 w-full max-w-md mx-auto">
                        <div className="text-center">
                            <p className="text-sm text-purple-400 uppercase tracking-widest mb-1">
                                Round {currentRound} / {totalRounds}
                            </p>
                            <p className="text-gray-400 text-sm">
                                {turnPlayer?.username || "Someone"}'s challenge
                            </p>
                        </div>
                        <GuessForm />
                        <ScoreBoard />
                    </div>
                );

            case GameState.EVALUATION:
                return (
                    <div className="flex flex-col items-center gap-6 w-full max-w-lg mx-auto">
                        <EvaluationCard />
                        <ScoreBoard />
                    </div>
                );

            case GameState.ROUND_RESULT:
                return <RoundResult />;

            case GameState.GAME_OVER:
                return <WinnerScreen />;

            default:
                return <Lobby />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-950">
            <Navbar />
            <div className="flex flex-col lg:flex-row items-center lg:items-start justify-center min-h-[calc(100vh-4rem)] px-4 pt-24 pb-8 gap-8 w-full max-w-6xl mx-auto">
                <div className="w-full flex-1 flex flex-col items-center">
                    {renderGameView()}
                </div>

                {roomCode && (
                    <div className="w-full max-w-sm shrink-0 self-center lg:self-start lg:sticky lg:top-24 mt-8 lg:mt-0 flex justify-center lg:justify-start">
                        <ChatBox />
                    </div>
                )}
            </div>
        </div>
    );
}
