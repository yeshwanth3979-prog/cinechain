"""Application configuration settings."""

import os

# JWT Settings
SECRET_KEY = os.getenv(
    "SECRET_KEY",
    "cinechain-super-secret-key-change-in-production"
)

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24

# Database
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./cinechain.db")

# Game Settings
MIN_PLAYERS = 2
MAX_PLAYERS = 8
DISCONNECT_TIMEOUT_SECONDS = 30

# CORS
FRONTEND_URL = os.getenv(
    "FRONTEND_URL",
    "http://localhost:5174"
)