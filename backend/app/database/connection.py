"""Database connection and initialization using databases and SQLAlchemy."""

import databases
import sqlalchemy
from app.config import DATABASE_URL

# Fix for Render/Supabase PostgreSQL URIs
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# Async database instance for FastAPI (Limit pool size for Supabase session mode)
database = databases.Database(DATABASE_URL, min_size=1, max_size=5)

# SQLAlchemy declarative metadata for DDL (Table creation)
metadata = sqlalchemy.MetaData()

users_table = sqlalchemy.Table(
    "users",
    metadata,
    sqlalchemy.Column("id", sqlalchemy.Integer, primary_key=True, autoincrement=True),
    sqlalchemy.Column("username", sqlalchemy.String, unique=True, nullable=False),
    sqlalchemy.Column("password_hash", sqlalchemy.String, nullable=False)
)

async def connect_db():
    """Connect to database on startup."""
    await database.connect()
    # Create tables synchronously using a temporary SQLAlchemy engine
    engine = sqlalchemy.create_engine(
        # databases requires postgresql, asyncpg, etc. but SQLAlchemy DDL engine uses sync dialect
        DATABASE_URL.replace("+asyncpg", "") if "+asyncpg" in DATABASE_URL else DATABASE_URL,
        connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {},
        poolclass=sqlalchemy.pool.NullPool
    )
    metadata.create_all(engine)

async def disconnect_db():
    """Disconnect from database on shutdown."""
    await database.disconnect()
