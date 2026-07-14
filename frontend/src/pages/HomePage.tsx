/* HomePage: Create Room and Join Room buttons */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useRoom } from "../contexts/RoomContext";
import { createRoom, joinRoom } from "../services/api";
import { wsService } from "../services/websocket";
import Navbar from "../components/Navbar";

export default function HomePage() {
    const { user, token } = useAuth();
    const { setRoomCode } = useRoom();
    const navigate = useNavigate();

    const [joinCode, setJoinCode] = useState("");
    const [showJoin, setShowJoin] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleCreate = async () => {
        setError("");
        setLoading(true);
        try {
            const data = await createRoom();
            const code = data.room_code;
            setRoomCode(code);
            await wsService.connect(code, token!);
            navigate(`/game/${code}`);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Failed to create room");
        } finally {
            setLoading(false);
        }
    };

    const handleJoin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        if (!joinCode.trim()) return;

        setLoading(true);
        try {
            const data = await joinRoom(joinCode.toUpperCase());
            const code = data.room_code;
            setRoomCode(code);
            await wsService.connect(code, token!);
            navigate(`/game/${code}`);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Failed to join room");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Navbar />
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] px-4 pt-16">

                {/* Welcome */}
                <div className="text-center mb-12 animate-fade-in-up stagger-1">
                    <div className="text-7xl mb-6 animate-float drop-shadow-2xl">🍿</div>
                    <h1 className="text-5xl font-extrabold text-white mb-3 tracking-tight">
                        Welcome,{" "}
                        <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent glow-text">
                            {user?.username}
                        </span>
                    </h1>
                    <p className="text-gray-400 text-xl font-medium">Are you ready to play?</p>
                </div>

                {/* Action Card */}
                <div className="w-full max-w-sm glass-card rounded-[2rem] p-8 animate-fade-in-up stagger-2">
                    <div className="flex flex-col gap-5">
                        {error && (
                            <div className="px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center animate-fade-in">
                                {error}
                            </div>
                        )}

                        <button
                            onClick={handleCreate}
                            disabled={loading}
                            className="btn-glow w-full py-4.5 bg-gray-900 border border-gray-700 text-white font-bold text-lg rounded-xl transition-all transform hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 shadow-xl glow-purple"
                        >
                            <span className="relative z-10">Create Room</span>
                        </button>

                        {!showJoin ? (
                            <button
                                onClick={() => setShowJoin(true)}
                                className="w-full py-4.5 bg-gray-900/30 text-gray-300 font-bold text-lg rounded-xl border border-gray-700/50 hover:bg-gray-800 hover:text-white transition-all hover:-translate-y-1"
                            >
                                Join Room
                            </button>
                        ) : (
                            <form onSubmit={handleJoin} className="space-y-4 animate-scale-in">
                                <input
                                    type="text"
                                    value={joinCode}
                                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                                    placeholder="CODE"
                                    maxLength={6}
                                    className="w-full px-4 py-4 bg-gray-950/40 border border-gray-700/50 rounded-xl text-white text-center text-2xl font-mono tracking-[0.5em] font-bold placeholder-gray-600 focus:outline-none input-glow uppercase"
                                    autoFocus
                                />
                                <div className="flex gap-3">
                                    <button
                                        type="submit"
                                        disabled={loading || joinCode.length < 6}
                                        className="flex-1 py-3.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold rounded-xl transition-transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:transform-none shadow-lg shadow-blue-500/20"
                                    >
                                        {loading ? "..." : "Join"}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => { setShowJoin(false); setJoinCode(""); setError(""); }}
                                        className="px-5 py-3.5 bg-gray-800 text-gray-400 font-semibold rounded-xl hover:text-white hover:bg-gray-700 transition-colors"
                                    >
                                        Back
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
