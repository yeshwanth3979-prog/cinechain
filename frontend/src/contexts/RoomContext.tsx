/* RoomContext: manages room state, players, join/leave */

import { createContext, useContext, useState, type ReactNode } from "react";
import type { Player } from "../types/game";

interface RoomContextType {
    roomCode: string | null;
    players: Player[];
    hostId: string | null;
    setRoomCode: (code: string | null) => void;
    setPlayers: (players: Player[]) => void;
    setHostId: (id: string | null) => void;
    resetRoom: () => void;
}

const RoomContext = createContext<RoomContextType | null>(null);

export function RoomProvider({ children }: { children: ReactNode }) {
    const [roomCode, setRoomCode] = useState<string | null>(null);
    const [players, setPlayers] = useState<Player[]>([]);
    const [hostId, setHostId] = useState<string | null>(null);

    const resetRoom = () => {
        setRoomCode(null);
        setPlayers([]);
        setHostId(null);
    };

    return (
        <RoomContext.Provider
            value={{ roomCode, players, hostId, setRoomCode, setPlayers, setHostId, resetRoom }}
        >
            {children}
        </RoomContext.Provider>
    );
}

export function useRoom() {
    const context = useContext(RoomContext);
    if (!context) throw new Error("useRoom must be used within RoomProvider");
    return context;
}
