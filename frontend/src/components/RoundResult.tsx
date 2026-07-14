/* RoundResult: shows correct answer after a round ends */

import { useGame } from "../contexts/GameContext";
import ScoreBoard from "./ScoreBoard";

export default function RoundResult() {
    const { answer, solverName } = useGame();

    return (
        <div className="flex flex-col items-center gap-8 w-full max-w-md animate-fade-in-up stagger-1">
            {/* Solver announcement */}
            {solverName && (
                <div className="text-center w-full">
                    <div className="inline-block p-4 rounded-full bg-green-500/10 border border-green-500/30 shadow-[0_0_30px_rgba(74,222,128,0.2)] mb-4 animate-scale-in">
                        <div className="text-6xl drop-shadow-2xl">🎉</div>
                    </div>
                    <h2 className="text-3xl font-extrabold text-white mb-2 tracking-tight">
                        <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent glow-text">
                            {solverName}
                        </span> solved it!
                    </h2>
                    <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-green-500/20 border border-green-500/40 text-green-400 font-bold text-sm">
                        <span className="text-lg">+1</span> Point
                    </div>
                </div>
            )}

            {/* Correct Answer reveal */}
            {answer && (
                <div className="w-full glass-card rounded-[2rem] p-8 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -ml-10 -mb-10"></div>

                    <h3 className="text-xs font-black text-purple-400 uppercase tracking-[0.2em] mb-6 text-center">
                        Revealed Answer
                    </h3>
                    <div className="space-y-3 relative z-10">
                        {[
                            { label: "Hero", value: answer.hero, color: "border-purple-500/30 group-hover:border-purple-500/50 focus-within:border-purple-500" },
                            { label: "Movie", value: answer.movie, color: "border-pink-500/30 group-hover:border-pink-500/50 focus-within:border-pink-500" },
                            { label: "Heroine", value: answer.heroine, color: "border-blue-500/30 group-hover:border-blue-500/50 focus-within:border-blue-500" },
                        ].map((item) => (
                            <div key={item.label} className={`flex justify-between items-center px-5 py-4 bg-gray-950/40 rounded-xl border ${item.color} transition-colors`}>
                                <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">{item.label}</span>
                                <span className="text-white font-extrabold text-lg text-right truncate pl-4">{item.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="w-full">
                <ScoreBoard />
            </div>

            <div className="flex items-center gap-3 text-purple-400 font-bold bg-purple-500/10 px-6 py-3 rounded-full border border-purple-500/20 animate-pulse">
                <span className="animate-spin">⏳</span>
                Next round starting...
            </div>
        </div>
    );
}
