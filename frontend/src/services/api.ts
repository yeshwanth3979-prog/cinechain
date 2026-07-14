/* REST API service for CineChain */

const API_URL = import.meta.env.VITE_API_URL;
const API_BASE = API_URL || "http://localhost:8000";

function getHeaders(): HeadersInit {
    const headers: HeadersInit = {
        "Content-Type": "application/json",
    };

    const token = localStorage.getItem("token");

    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    return headers;
}

async function handleResponse(res: Response) {
    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.detail || "Something went wrong");
    }

    return data;
}

/* ===========================
   AUTH
=========================== */

export async function registerUser(username: string, password: string) {
    const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            username,
            password,
        }),
    });

    return handleResponse(res);
}

export async function loginUser(username: string, password: string) {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            username,
            password,
        }),
    });

    const data = await handleResponse(res);

    // Save JWT automatically
    if (data.access_token) {
        localStorage.setItem("token", data.access_token);
    }

    return data;
}

export async function getMe() {
    const res = await fetch(`${API_BASE}/api/auth/me`, {
        method: "GET",
        headers: getHeaders(),
    });

    return handleResponse(res);
}

/* ===========================
   ROOMS
=========================== */

export async function createRoom() {
    const res = await fetch(`${API_BASE}/api/rooms/create`, {
        method: "POST",
        headers: getHeaders(),
    });

    return handleResponse(res);
}

export async function joinRoom(roomCode: string) {
    const res = await fetch(`${API_BASE}/api/rooms/join`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({
            code: roomCode,
        }),
    });

    return handleResponse(res);
}