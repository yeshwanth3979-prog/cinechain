import { useState, useRef, useEffect } from "react";
import { useGame } from "../contexts/GameContext";
import { useAuth } from "../contexts/AuthContext";
import { wsService } from "../services/websocket";
import type { ChatMessage } from "../types/game";

export default function ChatBox() {
    const { chatMessages } = useGame();
    const { user } = useAuth();
    const [message, setMessage] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [chatMessages]);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        const trimMsg = message.trim();
        if (!trimMsg) return;

        // Send to backend
        wsService.send({
            type: "CHAT_MESSAGE",
            message: trimMsg,
        });

        setMessage("");
    };

    const formatTime = (iso: string) => {
        try {
            const d = new Date(iso);
            return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } catch {
            return "";
        }
    };

    return (
        <div className="flex flex-col h-[400px] w-full max-w-sm glass-card rounded-[2rem] overflow-hidden shadow-2xl relative animate-fade-in-up md:h-[500px]">
            {/* Header */}
            <div className="p-4 border-b border-gray-700/50 bg-gray-950/40 backdrop-blur-md flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-xl">💬</span>
                    <h3 className="text-white font-black tracking-wide">Room Chat</h3>
                </div>
                <div className="px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-400 text-xs font-bold">
                    {chatMessages.length} Messages
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {chatMessages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center opacity-50 space-y-3">
                        <span className="text-4xl">👻</span>
                        <p className="text-sm font-semibold text-gray-300">It's quiet here...</p>
                    </div>
                ) : (
                    chatMessages.map((msg: ChatMessage, idx) => {
                        const isMe = msg.senderId === String(user?.id);

                        // Compute a stable avatar color based on names
                        const colorCycle = ["from-pink-500 to-rose-500", "from-purple-500 to-indigo-500", "from-blue-500 to-cyan-500", "from-emerald-500 to-teal-500", "from-amber-500 to-orange-500"];
                        const colorHash = msg.senderName.charCodeAt(0) % colorCycle.length;
                        const avatarGradient = colorCycle[colorHash];

                        return (
                            <div key={msg.id || idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} animate-fade-in-up`}>
                                {!isMe && (
                                    <span className="text-xs font-black text-gray-500 uppercase tracking-widest pl-1 mb-1 shadow-sm">
                                        {msg.senderName}
                                    </span>
                                )}

                                <div className={`flex gap-2 max-w-[85%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                                    {/* Avatar */}
                                    <div className={`shrink-0 w-8 h-8 rounded-full bg-gradient-to-tr ${avatarGradient} flex items-center justify-center text-white text-xs font-bold shadow-md`}>
                                        {msg.senderName.charAt(0).toUpperCase()}
                                    </div>

                                    {/* Bubble */}
                                    <div className="flex flex-col">
                                        <div className={`px-4 py-2.5 rounded-2xl relative ${isMe
                                                ? 'bg-blue-600/90 text-white shadow-blue-500/20 rounded-tr-sm border border-blue-500/50'
                                                : 'bg-gray-800 text-gray-100 shadow-xl rounded-tl-sm border border-gray-700/50'
                                            } shadow-lg backdrop-blur-md`}>
                                            <p className="text-sm font-medium break-words leading-relaxed">{msg.text}</p>
                                        </div>
                                        <span className={`text-[10px] text-gray-500 font-bold mt-1 ${isMe ? 'text-right pr-1' : 'pl-1'}`}>
                                            {formatTime(msg.timestamp)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 bg-gray-950/60 border-t border-gray-700/50 backdrop-blur-xl">
                <form onSubmit={handleSend} className="relative flex items-center">
                    <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="w-full bg-gray-900 border border-gray-700 rounded-xl pr-12 pl-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all font-medium"
                    />
                    <button
                        type="submit"
                        disabled={!message.trim()}
                        className={`absolute right-2 px-3 py-1.5 rounded-lg font-bold text-lg flex items-center justify-center transition-all ${message.trim()
                                ? 'bg-blue-500 text-white hover:bg-blue-400 active:scale-95 shadow-lg shadow-blue-500/20'
                                : 'bg-gray-800 text-gray-600 cursor-not-allowed'
                            }`}
                    >
                        ➤
                    </button>
                </form>
            </div>
        </div>
    );
}
