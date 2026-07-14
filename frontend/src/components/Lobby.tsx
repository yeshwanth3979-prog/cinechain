/* Lobby: waiting room with player list and ready button */

import { useRoom } from "../contexts/RoomContext";
import { useGame } from "../contexts/GameContext";
import { useAuth } from "../contexts/AuthContext";
import { wsService } from "../services/websocket";

export default function Lobby() {
    const { roomCode, players, hostId } = useRoom();
    const { readyPlayers } = useGame();
    const { user } = useAuth();
    const myId = String(user?.id);
    const isReady = readyPlayers.includes(myId);

    const handleReady = () => {
        wsService.send({ type: "PLAYER_READY" });
    };

    return (
        <div className="flex flex-col items-center gap-10 w-full max-w-md animate-fade-in-up stagger-1">
            {/* Room Code Display */}
            <div className="text-center glass-card px-10 py-6 rounded-3xl w-full">
                <p className="text-purple-300 text-sm font-bold uppercase tracking-[0.2em] mb-2 opacity-80">Room Code</p>
                <div className="text-5xl font-mono font-black tracking-[0.4em] bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent glow-text">
                    {roomCode}
                </div>
            </div>

            {/* Player List */}
            <div className="w-full glass-card rounded-3xl overflow-hidden shadow-2xl">
                <div className="px-6 py-4 bg-gray-900/40 border-b border-gray-700/50 flex justify-between items-center backdrop-blur-md">
                    <h3 className="text-sm font-bold text-gray-200">Players ({players.length})</h3>
                    <span className="text-xs font-semibold text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">
                        Min 2 to start
                    </span>
                </div>
                <div className="p-4 space-y-2">
                    {players.map((player) => (
                        <div
                            key={player.id}
                            className="flex items-center justify-between px-5 py-3.5 rounded-2xl bg-gray-950/40 border border-gray-700/30 hover:border-purple-500/30 transition-all group"
                        >
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center text-sm font-black text-white shadow-lg shadow-purple-500/20 z-10 relative">
                                        {player.username[0].toUpperCase()}
                                    </div>
                                    {player.id === hostId && (
                                        <div className="absolute -top-1 -right-1 text-xs z-20" title="Host">👑</div>
                                    )}
                                </div>
                                <span className="text-gray-100 font-semibold group-hover:text-white transition-colors">
                                    {player.username}
                                </span>
                            </div>

                            <div className={`flex flex-col items-end gap-1`}>
                                {readyPlayers.includes(player.id) ? (
                                    <span className="text-sm font-bold text-green-400 flex items-center gap-1 bg-green-500/10 px-3 py-1 rounded-full border border-green-500/20 shadow-[0_0_10px_rgba(74,222,128,0.2)]">
                                        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                                        Ready
                                    </span>
                                ) : (
                                    <span className="text-sm font-bold text-gray-500 flex items-center gap-1 bg-gray-800/80 px-3 py-1 rounded-full border border-gray-700">
                                        <span className="w-2 h-2 rounded-full bg-gray-500"></span>
                                        Waiting
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Ready Button */}
            {!isReady ? (
                <button
                    onClick={handleReady}
                    className="btn-glow w-full py-5 bg-gradient-to-r from-green-500 to-emerald-600 border-none text-white font-extrabold text-xl rounded-2xl transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-green-500/30 glow-purple"
                >
                    <span className="relative z-10">I'm Ready!</span>
                </button>
            ) : (
                <div className="w-full py-5 text-center glass-card rounded-2xl border-green-500/30">
                    <div className="text-green-400 font-bold text-lg flex items-center justify-center gap-3">
                        <span className="animate-spin text-2xl">⏳</span>
                        Waiting for others...
                    </div>
                </div>
            )}
        </div>
    );
}
