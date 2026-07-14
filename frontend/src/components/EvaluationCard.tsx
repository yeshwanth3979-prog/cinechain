/* EvaluationCard: creator evaluates each guesser's fields with instant checkboxes */

import { useGame } from "../contexts/GameContext";
import { wsService } from "../services/websocket";

export default function EvaluationCard() {
    const { pendingGuesses, challenge, currentRound, totalRounds } = useGame();

    const handleToggle = (playerId: string, field: "hero" | "movie" | "heroine", currentValue: boolean) => {
        wsService.send({
            type: "EVALUATE_FIELD",
            playerId,
            field,
            correct: !currentValue,
        });
    };

    return (
        <div className="w-full max-w-2xl animate-fade-in-up stagger-1">
            <div className="text-center mb-8">
                <div className="inline-block p-4 rounded-3xl bg-blue-500/10 border border-blue-500/20 shadow-xl shadow-blue-500/10 mb-4 animate-float">
                    <div className="text-6xl drop-shadow-2xl">👀</div>
                </div>
                <h2 className="text-3xl font-extrabold text-white mb-2 tracking-tight">Evaluate Guesses</h2>
                <p className="text-blue-300 font-medium text-sm">Round {currentRound} / {totalRounds} — Review answers carefully!</p>
            </div>

            {challenge && (
                <div className="flex justify-center gap-3 mb-8 flex-wrap">
                    {[
                        { label: "Hero", hint: challenge.heroHint, color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
                        { label: "Movie", hint: challenge.movieHint, color: "text-pink-400", bg: "bg-pink-500/10", border: "border-pink-500/20" },
                        { label: "Heroine", hint: challenge.heroineHint, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
                    ].map((h) => (
                        <div key={h.label} className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${h.border} ${h.bg} shadow-sm backdrop-blur-sm`}>
                            <span className={`text-xs font-bold uppercase tracking-wider text-gray-400`}>{h.label}</span>
                            <span className={`text-lg font-black ${h.color}`}>{h.hint}<span className="opacity-50">_ _</span></span>
                        </div>
                    ))}
                </div>
            )}

            {pendingGuesses.length === 0 ? (
                <div className="glass-card rounded-[2rem] p-12 text-center">
                    <div className="text-5xl mb-4 animate-spin drop-shadow-2xl mx-auto" style={{ animationDuration: '4s' }}>⚙️</div>
                    <p className="text-gray-300 font-bold text-xl tracking-wide">Waiting for players to guess...</p>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2">
                    {pendingGuesses.map((guess, index) => (
                        <div
                            key={guess.playerId}
                            className="glass-card rounded-[1.5rem] p-6 relative overflow-hidden group transition-all hover:border-purple-500/30 hover:shadow-[0_0_30px_rgba(168,85,247,0.15)]"
                            style={{ animationDelay: `${index * 0.1}s` }}
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 opacity-50"></div>

                            <div className="flex items-center gap-3 mb-5 mt-2">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center text-sm font-black text-white shadow-lg shadow-purple-500/30">
                                    {guess.username[0].toUpperCase()}
                                </div>
                                <span className="text-white font-bold text-lg tracking-tight">{guess.username}</span>
                            </div>

                            <div className="space-y-4">
                                {(["hero", "movie", "heroine"] as const).map((field) => {
                                    const value = guess[field];
                                    const isLocked = guess.locked[field];

                                    return (
                                        <div
                                            key={field}
                                            className={`flex items-center justify-between p-3 rounded-xl border transition-all ${isLocked
                                                    ? 'bg-green-500/10 border-green-500/30 shadow-[inset_0_0_15px_rgba(74,222,128,0.1)]'
                                                    : 'bg-gray-950/40 border-gray-700/50 hover:bg-gray-900/60'
                                                }`}
                                        >
                                            <div className="flex-1 min-w-0 pr-3">
                                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-0.5">{field}</span>
                                                <p className={`text-sm font-semibold truncate ${!value ? 'text-gray-600 italic' : isLocked ? 'text-green-400' : 'text-gray-200'
                                                    }`}>
                                                    {value || "No guess yet"}
                                                </p>
                                            </div>

                                            <button
                                                onClick={() => handleToggle(guess.playerId, field, isLocked)}
                                                disabled={!value}
                                                className={`shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-all ${!value
                                                        ? "bg-gray-900 border-2 border-gray-800 text-transparent cursor-not-allowed"
                                                        : isLocked
                                                            ? "bg-gradient-to-br from-green-400 to-emerald-600 border-none text-white shadow-lg shadow-green-500/30 transform scale-105"
                                                            : "bg-gray-800 border-2 border-gray-600 text-gray-500 hover:border-green-500 hover:text-green-500 active:scale-95"
                                                    }`}
                                            >
                                                {isLocked && <span className="text-xl drop-shadow-md">✓</span>}
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
