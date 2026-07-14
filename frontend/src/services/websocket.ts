/* WebSocket service for real-time game communication */

import type { ClientMessage, ServerMessage } from "../types/messages";

type MessageHandler = (msg: ServerMessage) => void;

class WebSocketService {
    private ws: WebSocket | null = null;
    private handlers: Set<MessageHandler> = new Set();
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    private roomCode: string | null = null;
    private token: string | null = null;

    connect(roomCode: string, token: string): Promise<void> {
        this.roomCode = roomCode;
        this.token = token;
        this.reconnectAttempts = 0;

        return new Promise((resolve, reject) => {
            const env = typeof (import.meta as any).env !== 'undefined' ? (import.meta as any).env : {};
            let baseWsUrl: string;

            if (env.VITE_WS_URL) {
                baseWsUrl = env.VITE_WS_URL;
            } else if (env.VITE_API_URL) {
                baseWsUrl = env.VITE_API_URL.replace(/^http/, 'ws') + '/ws';
            } else {
                const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
                const host = window.location.host;
                baseWsUrl = `${protocol}//${host}/ws`;
            }

            const url = `${baseWsUrl}/${roomCode}?token=${token}`;

            this.ws = new WebSocket(url);

            this.ws.onopen = () => {
                console.log("[WS] Connected to room:", roomCode);
                this.reconnectAttempts = 0;
                resolve();
            };

            this.ws.onmessage = (event) => {
                try {
                    const msg: ServerMessage = JSON.parse(event.data);
                    this.handlers.forEach((handler) => handler(msg));
                } catch (err) {
                    console.error("[WS] Failed to parse message:", err);
                }
            };

            this.ws.onclose = (event) => {
                console.log("[WS] Disconnected:", event.code, event.reason);
                if (this.reconnectAttempts < this.maxReconnectAttempts && this.roomCode && this.token) {
                    this.reconnectAttempts++;
                    console.log(`[WS] Reconnecting... attempt ${this.reconnectAttempts}`);
                    setTimeout(() => {
                        if (this.roomCode && this.token) {
                            this.connect(this.roomCode, this.token).catch(console.error);
                        }
                    }, 2000 * this.reconnectAttempts);
                }
            };

            this.ws.onerror = (err) => {
                console.error("[WS] Error:", err);
                reject(err);
            };
        });
    }

    send(message: ClientMessage): void {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(message));
        } else {
            console.warn("[WS] Cannot send — not connected");
        }
    }

    onMessage(handler: MessageHandler): () => void {
        this.handlers.add(handler);
        return () => this.handlers.delete(handler);
    }

    disconnect(): void {
        this.roomCode = null;
        this.token = null;
        this.reconnectAttempts = this.maxReconnectAttempts; // prevent reconnect
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
        this.handlers.clear();
    }

    get isConnected(): boolean {
        return this.ws?.readyState === WebSocket.OPEN;
    }
}

// Singleton
export const wsService = new WebSocketService();
