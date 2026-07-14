/* ProtectedRoute: redirects unauthenticated users to login */

import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-950">
                <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full" />
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
}
