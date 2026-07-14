/* GuessForm: form for guessers to submit their guesses with locked field support */

import { useState, useEffect } from "react";
import { useGame } from "../contexts/GameContext";
import { wsService } from "../services/websocket";

const InputField = ({
    label, value, setter, isLocked, isWrong, hint, guessValue, colorClass, onSubmit, disabled
}: {
    label: string, value: string, setter: (v: string) => void, isLocked: boolean, isWrong: boolean, hint: string, guessValue?: string, colorClass: string, onSubmit: () => void, disabled: boolean
}) => (
    <div className="group relative">
        <label className={`block text-sm font-bold mb-2 uppercase tracking-wider transition-colors ${isWrong ? 'text-red-400' : `text-gray-400 group-focus-within:${colorClass}`
            }`}>
            {label}
            {isWrong && <span className="ml-2 text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full border border-red-500/30">❌ Incorrect</span>}
        </label>
        {isLocked ? (
            <div className="flex items-center gap-3 px-5 py-4 bg-green-500/10 border border-green-500/30 rounded-xl shadow-[0_0_15px_rgba(74,222,128,0.1)] transition-all">
                <span className="text-xl">✅</span>
                <span className="text-green-400 font-bold text-lg">{guessValue}</span>
                <span className="ml-auto text-green-500/50 text-xl font-bold">LOCKED</span>
            </div>
        ) : (
            <div className="flex gap-2 relative">
                <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <div className={`w-8 h-8 rounded-lg ${isWrong ? 'bg-red-500/20 border-red-500/30 text-red-500' : colorClass.replace("text-", "bg-").replace("400", "500/20") + " border " + colorClass.replace("text-", "border-").replace("400", "500/30") + " " + colorClass} flex items-center justify-center font-bold`}>
                            {hint}
                        </div>
                    </div>
                    <input
                        type="text"
                        value={value}
                        onChange={(e) => setter(e.target.value)}
                        placeholder={`Type your guess...`}
                        className={`w-full pr-5 py-4 bg-gray-950/40 border rounded-xl text-white font-medium placeholder-gray-600 focus:outline-none transition-all ${isWrong
                            ? 'border-red-500/50 shadow-[0_0_15px_rgba(248,113,113,0.15)] focus:border-red-500 focus:ring-1 focus:ring-red-500'
                            : 'border-gray-700/50 input-glow'
                            }`}
                        style={{ paddingLeft: '4rem' }}
                    />
                </div>
                <button
                    type="button"
                    onClick={onSubmit}
                    disabled={disabled || !value.trim()}
                    className={`shrink-0 px-4 py-4 rounded-xl font-bold transition-all ${(!value.trim() || disabled)
                        ? 'bg-gray-900 border border-gray-800 text-gray-700 cursor-not-allowed'
                        : `bg-gray-800 border-2 border-gray-600 ${colorClass} hover:bg-gray-700 hover:border-gray-500`
                        }`}
                >
                    ↑
                </button>
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

    const handleIndividualSubmit = (field: "hero" | "movie" | "heroine", value: string) => {
        if (!value.trim()) return;
        setSubmitted(true);
        const guess: { type: "SUBMIT_GUESS"; hero?: string; movie?: string; heroine?: string } = {
            type: "SUBMIT_GUESS",
        };
        guess[field] = value.trim();
        wsService.send(guess);
        setTimeout(() => setSubmitted(false), 1000);
    };

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
                        isWrong={myGuess?.wrong?.hero ?? false}
                        hint={challenge.heroHint}
                        guessValue={myGuess?.hero ?? undefined}
                        colorClass="text-purple-400"
                        onSubmit={() => handleIndividualSubmit("hero", hero)}
                        disabled={submitted}
                    />

                    <InputField
                        label="Movie"
                        value={movie}
                        setter={setMovie}
                        isLocked={locked.movie}
                        isWrong={myGuess?.wrong?.movie ?? false}
                        hint={challenge.movieHint}
                        guessValue={myGuess?.movie ?? undefined}
                        colorClass="text-pink-400"
                        onSubmit={() => handleIndividualSubmit("movie", movie)}
                        disabled={submitted}
                    />

                    <InputField
                        label="Heroine"
                        value={heroine}
                        setter={setHeroine}
                        isLocked={locked.heroine}
                        isWrong={myGuess?.wrong?.heroine ?? false}
                        hint={challenge.heroineHint}
                        guessValue={myGuess?.heroine ?? undefined}
                        colorClass="text-blue-400"
                        onSubmit={() => handleIndividualSubmit("heroine", heroine)}
                        disabled={submitted}
                    />

                    {(!locked.hero || !locked.movie || !locked.heroine) && (
                        <button
                            type="submit"
                            disabled={submitted}
                            className="btn-glow w-full mt-4 py-4.5 bg-gray-900 border border-gray-700 text-white font-bold text-lg rounded-xl transition-all transform hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 disabled:transform-none shadow-xl glow-blue"
                        >
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                {submitted ? "Submitted ✓" : "Submit Remaining Guesses"}
                            </span>
                        </button>
                    )}
                </form>
            </div>
        </div>
    );
}
