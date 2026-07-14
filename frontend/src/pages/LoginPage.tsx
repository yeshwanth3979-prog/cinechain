import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";

// Icons 
const ClapperIcon = () => (
    <svg className="w-14 h-14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 6H20M4 6V18C4 19.1046 4.89543 20 6 20H18C19.1046 20 20 19.1046 20 18V6M4 6L8 10M8 6L12 10M12 6L16 10M16 6L20 10" stroke="url(#logo_gradient)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <defs>
            <linearGradient id="logo_gradient" x1="4" y1="6" x2="20" y2="20" gradientUnits="userSpaceOnUse">
                <stop stopColor="#9F6EFF" />
                <stop offset="1" stopColor="#7C5CFF" />
            </linearGradient>
        </defs>
    </svg>
);

const UserIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
    </svg>
);

const LockIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
);

const EyeIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
    </svg>
);

const EyeOffIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
        <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
);

export default function LoginPage() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setError("");
        setLoading(true);

        try {
            await login(username, password);
            navigate("/");
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Login failed");
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSubmit();
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#0B0A14] overflow-hidden relative font-inter py-10 px-4">
            {/* Cinematic Background Glows */}
            <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-[#7C5CFF]/15 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#9F6EFF]/10 rounded-full blur-[100px] pointer-events-none"></div>

            {/* Logo Header */}
            <div className="relative z-10 flex flex-col items-center animate-fade-in-up mb-10 w-full max-w-[500px]">
                <div className="mb-4 drop-shadow-[0_0_15px_rgba(124,92,255,0.4)]">
                    <ClapperIcon />
                </div>
                <h1 className="text-[2.5rem] font-black tracking-widest leading-none drop-shadow-md flex items-center">
                    <span className="text-white">CINE</span>
                    <span className="text-[#9F6EFF]">CHAIN</span>
                </h1>
                <p className="text-[#A7A7C7] mt-3 font-medium text-sm tracking-wide">
                    Real-Time Multiplayer Movie Guessing
                </p>
            </div>

            {/* Authorization Card */}
            <div className="relative z-10 w-full max-w-[480px] bg-[#171421]/90 backdrop-blur-xl border border-white/5 rounded-[24px] p-10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] animate-fade-in-up stagger-1 mx-auto">
                <h2 className="text-2xl font-bold text-white mb-8 text-center tracking-tight">Welcome Back</h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Username Input */}
                    <div>
                        <label className="block text-sm font-semibold text-[#A7A7C7] mb-2 px-1">Username</label>
                        <div className="relative group">
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                onKeyDown={handleKeyDown}
                                className="w-full h-[54px] px-5 bg-[#0B0A14] border border-transparent rounded-[16px] text-white placeholder-[#A7A7C7]/50 focus:outline-none focus:border-[#7C5CFF]/50 focus:ring-2 focus:ring-[#7C5CFF]/20 focus:bg-[#171421] transition-all font-medium shadow-inner"
                                placeholder="Enter your username"
                                required
                            />
                        </div>
                    </div>

                    {/* Password Input */}
                    <div>
                        <label className="block text-sm font-semibold text-[#A7A7C7] mb-2 px-1">Password</label>
                        <div className="relative group">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onKeyDown={handleKeyDown}
                                className="w-full h-[54px] pl-5 pr-12 bg-[#0B0A14] border border-transparent rounded-[16px] text-white placeholder-[#A7A7C7]/50 focus:outline-none focus:border-[#7C5CFF]/50 focus:ring-2 focus:ring-[#7C5CFF]/20 focus:bg-[#171421] transition-all font-medium shadow-inner"
                                placeholder="Enter your password"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#A7A7C7] hover:text-white transition-colors h-full"
                            >
                                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                            </button>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading || !username || !password}
                        className="w-full h-[54px] mt-2 bg-gradient-to-r from-[#7C5CFF] to-[#9F6EFF] text-white font-bold rounded-[16px] transition-all shadow-[0_0_20px_rgba(124,92,255,0.2)] hover:shadow-[0_0_30px_rgba(159,110,255,0.4)] hover:-translate-y-0.5 active:translate-y-0 active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <span className="animate-spin text-xl">⏳</span>
                                <span>Authenticating...</span>
                            </>
                        ) : (
                            "Log In"
                        )}
                    </button>

                    {/* Error Message */}
                    {error && (
                        <div className="mt-4 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm font-medium text-center animate-fade-in">
                            {error}
                        </div>
                    )}
                </form>

                {/* Footer Link */}
                <div className="mt-8 text-center">
                    <p className="text-[#A7A7C7] font-medium text-sm">
                        Don't have an account?{" "}
                        <Link to="/register" className="text-[#9F6EFF] hover:text-[#7C5CFF] hover:underline font-bold transition-all">
                            Create Account
                        </Link>
                    </p>
                </div>
            </div>

            {/* Cinematic Features Bottom - Desktop only */}
            <div className="hidden md:flex items-center justify-center gap-16 mt-16 text-[#A7A7C7] relative z-10 animate-fade-in-up stagger-2">
                <div className="flex items-center gap-4 group">
                    <span className="text-3xl filter drop-shadow-[0_0_10px_rgba(124,92,255,0.3)] group-hover:scale-110 transition-transform">👥</span>
                    <div className="flex flex-col">
                        <span className="font-bold text-gray-200">Multiplayer</span>
                        <span className="text-xs">Real-time fun</span>
                    </div>
                </div>
                <div className="flex items-center gap-4 group">
                    <span className="text-3xl filter drop-shadow-[0_0_10px_rgba(124,92,255,0.3)] group-hover:scale-110 transition-transform">⚡</span>
                    <div className="flex flex-col">
                        <span className="font-bold text-gray-200">No Waiting</span>
                        <span className="text-xs">Instant actions</span>
                    </div>
                </div>
                <div className="flex items-center gap-4 group">
                    <span className="text-3xl filter drop-shadow-[0_0_10px_rgba(124,92,255,0.3)] group-hover:scale-110 transition-transform">🏆</span>
                    <div className="flex flex-col">
                        <span className="font-bold text-gray-200">Win & Score</span>
                        <span className="text-xs">Be the champion</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
