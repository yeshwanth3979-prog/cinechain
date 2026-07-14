/* ScoreBoard: live scores display */

import { useGame } from "../contexts/GameContext";

export default function ScoreBoard() {
    const { scores, currentRound, totalRounds } = useGame();

    const getRankStyle = (index: number) => {
        switch (index) {
            case 0: return { bg: "bg-yellow-500/10", border: "border-yellow-500/30", text: "text-yellow-400", shadow: "shadow-[0_0_15px_rgba(234,179,8,0.15)]", rank: "text-yellow-500" };
            case 1: return { bg: "bg-gray-300/10", border: "border-gray-400/30", text: "text-gray-200", shadow: "", rank: "text-gray-400" };
            case 2: return { bg: "bg-amber-700/10", border: "border-amber-700/30", text: "text-amber-500", shadow: "", rank: "text-amber-700" };
            default: return { bg: "bg-gray-950/40", border: "border-gray-700/30", text: "text-gray-400", shadow: "", rank: "text-gray-600" };
        }
    };

    return (
        <div className="w-full max-w-sm glass-card rounded-[2rem] overflow-hidden animate-fade-in-up stagger-2 shadow-2xl">
            <div className="px-6 py-4 border-b border-gray-700/50 flex justify-between items-center bg-gray-900/40 backdrop-blur-md">
                <h3 className="text-sm font-extrabold text-white tracking-wide flex items-center gap-2">
                    <span className="text-purple-400">🏆</span> Scoreboard
                </h3>
                <span className="text-xs font-bold font-mono text-purple-300 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">
                    R {currentRound}/{totalRounds}
                </span>
            </div>
            <div className="p-4 space-y-2">
                {scores.map((player, i) => {
                    const style = getRankStyle(i);
                    return (
                        <div
                            key={player.id}
                            className={`flex items-center justify-between px-5 py-3 rounded-2xl border ${style.bg} ${style.border} ${style.shadow} transition-all hover:scale-[1.02]`}
                        >
                            <div className="flex items-center gap-4">
                                <span className={`text-sm font-black ${style.rank} w-5 text-center`}>
                                    {i === 0 ? "1" : i + 1}
                                </span>
                                <span className={`font-bold ${i === 0 ? "text-white" : "text-gray-200"}`}>
                                    {player.username}
                                </span>
                            </div>
                            <span className={`font-black text-xl ${style.text} tabular-nums tracking-tighter`}>
                                {player.score}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
