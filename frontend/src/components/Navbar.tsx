/* Navbar: top navigation */

import { useAuth } from "../contexts/AuthContext";
import { useRoom } from "../contexts/RoomContext";
import { useNavigate } from "react-router-dom";
import { wsService } from "../services/websocket";

export default function Navbar() {
    const { user, logout } = useAuth();
    const { roomCode, resetRoom } = useRoom();
    const navigate = useNavigate();

    const handleLogout = () => {
        wsService.disconnect();
        resetRoom();
        logout();
        navigate("/login");
    };

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 glass border-b-0 border-b border-gray-700/20 shadow-sm shadow-purple-900/10">
            <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                <button
                    onClick={() => navigate("/")}
                    className="text-2xl font-extrabold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent hover:opacity-80 transition-opacity tracking-tight"
                >
                    CineChain
                </button>

                <div className="flex items-center gap-5">
                    {roomCode && (
                        <div className="hidden sm:flex items-center gap-2 px-4 py-1.5 rounded-full bg-gray-900/50 border border-purple-500/20">
                            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                            <span className="text-sm font-mono font-bold text-purple-300 tracking-wider">
                                {roomCode}
                            </span>
                        </div>
                    )}
                    {user && (
                        <div className="flex items-center gap-4 pl-4 border-l border-gray-700/50">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center text-sm font-black shadow-lg shadow-purple-500/20 border border-white/10">
                                    {user.username[0].toUpperCase()}
                                </div>
                                <span className="text-sm font-semibold text-gray-200 hidden md:block">
                                    {user.username}
                                </span>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="text-sm font-semibold text-gray-400 hover:text-red-400 transition-colors bg-gray-800/50 hover:bg-red-400/10 px-3 py-1.5 rounded-lg border border-transparent hover:border-red-400/20"
                            >
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}
