"""SQLite database connection and initialization."""

import databases
import sqlite3
from app.config import DATABASE_URL


# Async database instance for FastAPI
database = databases.Database(DATABASE_URL)


async def connect_db():
    """Connect to database on startup."""
    await database.connect()
    await create_tables()


async def disconnect_db():
    """Disconnect from database on shutdown."""
    await database.disconnect()


async def create_tables():
    """Create users table if it doesn't exist."""
    # Use synchronous sqlite3 for DDL (databases library limitation)
    db_path = DATABASE_URL.replace("sqlite:///", "")
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL
        )
    """)
    conn.commit()
    conn.close()
