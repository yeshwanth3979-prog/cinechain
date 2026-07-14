/* GuessForm: form for guessers to submit their guesses with locked field support */

import { useState, useEffect } from "react";
import { useGame } from "../contexts/GameContext";
import { wsService } from "../services/websocket";

const InputField = ({
    label, value, setter, isLocked, hint, guessValue, colorClass
}: {
    label: string, value: string, setter: (v: string) => void, isLocked: boolean, hint: string, guessValue?: string, colorClass: string
}) => (
    <div className="group">
        <label className={`block text-sm font-bold text-gray-400 mb-2 uppercase tracking-wider transition-colors group-focus-within:${colorClass}`}>
            {label}
        </label>
        {isLocked ? (
            <div className="flex items-center gap-3 px-5 py-4 bg-green-500/10 border border-green-500/30 rounded-xl shadow-[0_0_15px_rgba(74,222,128,0.1)] transition-all">
                <span className="text-xl">✅</span>
                <span className="text-green-400 font-bold text-lg">{guessValue}</span>
                <span className="ml-auto text-green-500/50 text-xl font-bold">LOCKED</span>
            </div>
        ) : (
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <div className={`w-8 h-8 rounded-lg ${colorClass.replace("text-", "bg-").replace("400", "500/20")} border ${colorClass.replace("text-", "border-").replace("400", "500/30")} flex items-center justify-center font-bold ${colorClass}`}>
                        {hint}
                    </div>
                </div>
                <input
                    type="text"
                    value={value}
                    onChange={(e) => setter(e.target.value)}
                    placeholder={`Type your guess...`}
                    className="w-full pl-15 pr-5 py-4 bg-gray-950/40 border border-gray-700/50 rounded-xl text-white font-medium placeholder-gray-600 input-glow focus:outline-none"
                />
            </div>
        )}
    </div>
);

export default function GuessForm() {
    const { challenge, myGuess } = useGame();
    const [hero, setHero] = useState("");
    const [movie, setMovie] = useState("");
    const [heroine, setHeroine] = useState("");
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        setHero("");
        setMovie("");
        setHeroine("");
        setSubmitted(false);
    }, [challenge]);

    if (!challenge) {
        return (
            <div className="text-center py-20">
                <div className="text-6xl mb-6 animate-spin drop-shadow-2xl" style={{ animationDuration: '3s' }}>⏳</div>
                <p className="text-gray-300 font-bold text-xl tracking-tight">Waiting for challenge...</p>
                <div className="mt-4 flex justify-center gap-2">
                    <span className="w-3 h-3 bg-purple-500 rounded-full animate-pulse stagger-1"></span>
                    <span className="w-3 h-3 bg-pink-500 rounded-full animate-pulse stagger-2"></span>
                    <span className="w-3 h-3 bg-blue-500 rounded-full animate-pulse stagger-3"></span>
                </div>
            </div>
        );
    }

    const locked = myGuess?.locked ?? { hero: false, movie: false, heroine: false };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitted(true);

        const guess: { type: "SUBMIT_GUESS"; hero?: string; movie?: string; heroine?: string } = {
            type: "SUBMIT_GUESS",
        };

        if (!locked.hero && hero.trim()) guess.hero = hero.trim();
        if (!locked.movie && movie.trim()) guess.movie = movie.trim();
        if (!locked.heroine && heroine.trim()) guess.heroine = heroine.trim();

        wsService.send(guess);
        setTimeout(() => setSubmitted(false), 1000);
    };

    return (
        <div className="w-full max-w-md animate-fade-in-up stagger-1">
            <div className="text-center mb-6">
                <h2 className="text-3xl font-extrabold text-white mb-2 tracking-tight">Crack the Code!</h2>
                <p className="text-purple-300 font-medium text-sm">Use the starting letters to guess.</p>
            </div>

            <div className="glass-card rounded-[2rem] p-8 relative">
                <form onSubmit={handleSubmit} className="space-y-6 relative z-10">

                    <InputField
                        label="Hero"
                        value={hero}
                        setter={setHero}
                        isLocked={locked.hero}
                        hint={challenge.heroHint}
                        guessValue={myGuess?.hero ?? undefined}
                        colorClass="text-purple-400"
                    />

                    <InputField
                        label="Movie"
                        value={movie}
                        setter={setMovie}
                        isLocked={locked.movie}
                        hint={challenge.movieHint}
                        guessValue={myGuess?.movie ?? undefined}
                        colorClass="text-pink-400"
                    />

                    <InputField
                        label="Heroine"
                        value={heroine}
                        setter={setHeroine}
                        isLocked={locked.heroine}
                        hint={challenge.heroineHint}
                        guessValue={myGuess?.heroine ?? undefined}
                        colorClass="text-blue-400"
                    />

                    {(!locked.hero || !locked.movie || !locked.heroine) && (
                        <button
                            type="submit"
                            disabled={submitted}
                            className="btn-glow w-full mt-4 py-4.5 bg-gray-900 border border-gray-700 text-white font-bold text-lg rounded-xl transition-all transform hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 disabled:transform-none shadow-xl glow-blue"
                        >
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                {submitted ? "Submitted ✓" : "Submit Guess"}
                            </span>
                        </button>
                    )}
                </form>
            </div>
        </div>
    );
}
