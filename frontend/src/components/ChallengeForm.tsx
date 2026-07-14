/* ChallengeForm: form for the turn player to create a challenge */

import { useState } from "react";
import { wsService } from "../services/websocket";

export default function ChallengeForm() {
    const [hero, setHero] = useState("");
    const [movie, setMovie] = useState("");
    const [heroine, setHeroine] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!hero.trim() || !movie.trim() || !heroine.trim()) return;

        setLoading(true);
        wsService.send({
            type: "CREATE_CHALLENGE",
            hero: hero.trim(),
            movie: movie.trim(),
            heroine: heroine.trim(),
        });
    };

    return (
        <div className="w-full max-w-md animate-fade-in-up stagger-1">
            <div className="text-center mb-8">
                <div className="inline-block p-4 rounded-3xl bg-purple-500/10 border border-purple-500/20 shadow-xl shadow-purple-500/10 mb-4 animate-float">
                    <div className="text-6xl drop-shadow-2xl">🎭</div>
                </div>
                <h2 className="text-3xl font-extrabold text-white mb-2 tracking-tight">Create Challenge</h2>
                <p className="text-purple-300 font-medium text-sm">Enter a movie, its hero, and heroine.</p>
            </div>

            <div className="glass-card rounded-[2rem] p-8 relative">
                <form onSubmit={handleSubmit} className="space-y-6 relative z-10">

                    <div className="group">
                        <label className="block text-sm font-bold text-gray-300 mb-2 uppercase tracking-wider group-focus-within:text-purple-400 transition-colors">Hero</label>
                        <input
                            type="text"
                            value={hero}
                            onChange={(e) => setHero(e.target.value)}
                            placeholder="e.g. Ram Charan"
                            className="w-full px-5 py-4 bg-gray-950/40 border border-gray-700/50 rounded-xl text-white font-medium placeholder-gray-600 input-glow focus:outline-none"
                            required
                        />
                    </div>

                    <div className="group">
                        <label className="block text-sm font-bold text-gray-300 mb-2 uppercase tracking-wider group-focus-within:text-pink-400 transition-colors">Movie</label>
                        <input
                            type="text"
                            value={movie}
                            onChange={(e) => setMovie(e.target.value)}
                            placeholder="e.g. Rangasthalam"
                            className="w-full px-5 py-4 bg-gray-950/40 border border-gray-700/50 rounded-xl text-white font-medium placeholder-gray-600 input-glow focus:outline-none"
                            required
                        />
                    </div>

                    <div className="group">
                        <label className="block text-sm font-bold text-gray-300 mb-2 uppercase tracking-wider group-focus-within:text-blue-400 transition-colors">Heroine</label>
                        <input
                            type="text"
                            value={heroine}
                            onChange={(e) => setHeroine(e.target.value)}
                            placeholder="e.g. Samantha Ruth Prabhu"
                            className="w-full px-5 py-4 bg-gray-950/40 border border-gray-700/50 rounded-xl text-white font-medium placeholder-gray-600 input-glow focus:outline-none"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !hero.trim() || !movie.trim() || !heroine.trim()}
                        className="btn-glow w-full mt-4 py-4.5 bg-gray-900 border border-gray-700 text-white font-bold text-lg rounded-xl transition-all transform hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 disabled:transform-none shadow-xl glow-purple"
                    >
                        <span className="relative z-10 flex items-center justify-center gap-2">
                            {loading ? "Submitting..." : "Submit Challenge"}
                        </span>
                    </button>
                </form>
            </div>
        </div>
    );
}
