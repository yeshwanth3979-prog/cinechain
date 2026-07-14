/* App: root component with routing and background */

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { RoomProvider } from "./contexts/RoomContext";
import { GameProvider } from "./contexts/GameContext";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import HomePage from "./pages/HomePage";
import GamePage from "./pages/GamePage";

function BackgroundScene() {
    return (
        <>
            <div className="bg-scene"></div>
            <div className="grid-pattern absolute inset-0 z-0 pointer-events-none opacity-50"></div>
            <div className="orb orb-1"></div>
            <div className="orb orb-2"></div>
            <div className="orb orb-3"></div>
        </>
    );
}

export default function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <RoomProvider>
                    <GameProvider>
                        <div className="relative min-h-screen text-gray-100 overflow-hidden">
                            <BackgroundScene />
                            <div className="relative z-10 w-full h-full">
                                <Routes>
                                    <Route path="/login" element={<LoginPage />} />
                                    <Route path="/register" element={<RegisterPage />} />
                                    <Route
                                        path="/"
                                        element={
                                            <ProtectedRoute>
                                                <HomePage />
                                            </ProtectedRoute>
                                        }
                                    />
                                    <Route
                                        path="/game/:code"
                                        element={
                                            <ProtectedRoute>
                                                <GamePage />
                                            </ProtectedRoute>
                                        }
                                    />
                                    <Route path="*" element={<Navigate to="/" replace />} />
                                </Routes>
                            </div>
                        </div>
                    </GameProvider>
                </RoomProvider>
            </AuthProvider>
        </BrowserRouter>
    );
}
