"""CineChain Backend — FastAPI application entry point."""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import FRONTEND_URL
from app.database.connection import connect_db, disconnect_db
from app.auth.routes import router as auth_router
from app.game.routes import router as game_router
from app.game.websocket import router as ws_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup/shutdown lifecycle."""
    await connect_db()
    yield
    await disconnect_db()


app = FastAPI(
    title="CineChain",
    description="Real-time multiplayer movie guessing game",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL, "http://localhost:5173", "http://localhost:5174"],
    allow_origin_regex=r"https://.*\.onrender\.com",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount routers
app.include_router(auth_router)
app.include_router(game_router)
app.include_router(ws_router)


@app.get("/")
async def root():
    return {"message": "CineChain API is running"}


from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

@app.exception_handler(StarletteHTTPException)
async def custom_http_exception_handler(request, exc):
    origin = request.headers.get("origin")
    headers = getattr(exc, "headers", None) or {}
    if origin:
        headers["Access-Control-Allow-Origin"] = origin
        headers["Access-Control-Allow-Credentials"] = "true"
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
        headers=headers,
    )
