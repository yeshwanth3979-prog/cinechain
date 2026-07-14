/* WinnerScreen: final game over screen with scores and winner */

import { useGame } from "../contexts/GameContext";
import { useRoom } from "../contexts/RoomContext";
import { wsService } from "../services/websocket";
import { useNavigate } from "react-router-dom";
import Confetti from "./Confetti";

export default function WinnerScreen() {
    const { scores, winnerName, resetGame } = useGame();
    const { resetRoom } = useRoom();
    const navigate = useNavigate();

    const handlePlayAgain = () => {
        wsService.send({ type: "PLAY_AGAIN" });
        resetGame();
    };

    const handleLeave = () => {
        wsService.send({ type: "LEAVE_ROOM" });
        wsService.disconnect();
        resetGame();
        resetRoom();
        navigate("/");
    };

    return (
        <div className="flex flex-col items-center gap-10 w-full max-w-md animate-fade-in-up stagger-1 relative z-10">

            {/* Winner Banner */}
            <div className="text-center relative">
                <div className="absolute inset-0 bg-yellow-500/20 blur-[80px] rounded-full z-0"></div>
                <div className="relative z-10">
                    <div className="text-8xl mb-6 animate-float drop-shadow-[0_10px_20px_rgba(234,179,8,0.4)]">🏆</div>
                    <h1 className="text-4xl font-black text-white mb-3 tracking-tighter uppercase">
                        Game Over!
                    </h1>
                    <div className="inline-block px-8 py-3 bg-gradient-to-r from-yellow-600/20 via-yellow-500/20 to-amber-600/20 border border-yellow-500/30 rounded-2xl backdrop-blur-md shadow-[0_0_30px_rgba(234,179,8,0.2)]">
                        <p className="text-lg text-gray-300 font-bold uppercase tracking-wider mb-1 text-center">Winner</p>
                        <p className="text-3xl bg-gradient-to-r from-yellow-300 via-yellow-400 to-amber-300 bg-clip-text text-transparent font-black text-center glow-text">
                            {winnerName}
                        </p>
                    </div>
                </div>
            </div>

            {/* Final Scores */}
            <div className="w-full glass-card rounded-[2rem] overflow-hidden shadow-2xl">
                <div className="px-6 py-4 border-b border-gray-700/50 bg-gray-900/40">
                    <h3 className="text-sm font-extrabold text-white text-center uppercase tracking-widest">Final Standings</h3>
                </div>
                <div className="p-4 space-y-2">
                    {scores.map((player, i) => (
                        <div
                            key={player.id}
                            className={`flex items-center justify-between px-5 py-4 rounded-2xl transition-all ${i === 0
                                    ? "bg-yellow-500/15 border-2 border-yellow-500/40 shadow-[0_0_15px_rgba(234,179,8,0.2)] transform scale-[1.02]"
                                    : i === 1
                                        ? "bg-gray-300/10 border border-gray-400/30"
                                        : i === 2
                                            ? "bg-amber-700/10 border border-amber-700/30"
                                            : "bg-gray-950/40 border border-gray-700/30"
                                }`}
                        >
                            <div className="flex items-center gap-4">
                                <span className="text-2xl drop-shadow-md w-8 text-center">
                                    {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : <span className="text-lg font-black text-gray-600">{i + 1}</span>}
                                </span>
                                <span className={`font-bold text-lg ${i === 0 ? "text-yellow-400" : "text-white"}`}>
                                    {player.username}
                                </span>
                            </div>
                            <span className={`text-2xl font-black ${i === 0 ? "text-yellow-400" : i === 1 ? "text-gray-300" : i === 2 ? "text-amber-500" : "text-gray-500"} tabular-nums`}>
                                {player.score}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex w-full gap-4">
                <button
                    onClick={handlePlayAgain}
                    className="btn-glow flex-1 py-4.5 bg-gray-900 border border-gray-700 text-white font-bold text-lg rounded-xl transition-all transform hover:-translate-y-1 active:translate-y-0 shadow-xl glow-purple"
                >
                    <span className="relative z-10 flex justify-center items-center gap-2 text-purple-400">
                        <span>🔄</span> Play Again
                    </span>
                </button>
                <button
                    onClick={handleLeave}
                    className="flex-1 py-4.5 bg-gray-900/30 border border-gray-700/50 text-gray-300 font-bold text-lg rounded-xl transition-all hover:bg-gray-800 hover:text-white hover:-translate-y-1"
                >
                    Leave Room
                </button>
            </div>
        </div>
    );
}
