/* AuthContext: manages user authentication state, login, register, logout */

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { loginUser, registerUser, getMe } from "../services/api";

interface User {
    id: number;
    username: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    loading: boolean;
    login: (username: string, password: string) => Promise<void>;
    register: (username: string, password: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
    const [loading, setLoading] = useState(true);

    // On mount, verify token
    useEffect(() => {
        if (token) {
            getMe()
                .then((userData) => {
                    setUser(userData);
                })
                .catch(() => {
                    localStorage.removeItem("token");
                    setToken(null);
                    setUser(null);
                })
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    const login = async (username: string, password: string) => {
        const data = await loginUser(username, password);
        localStorage.setItem("token", data.access_token);
        setToken(data.access_token);
        setUser(data.user);
    };

    const register = async (username: string, password: string) => {
        await registerUser(username, password);
    };

    const logout = () => {
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within AuthProvider");
    return context;
}
