"""Authentication routes: register, login, me."""

from fastapi import APIRouter, HTTPException, Depends, status

from app.database.connection import database
from app.database.models import UserCreate, UserLogin, UserResponse, Token
from app.auth.password import hash_password, verify_password
from app.auth.jwt import create_access_token, get_current_user

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user: UserCreate):
    """Register a new user."""
    # Check if username already exists
    existing = await database.fetch_one(
        query="SELECT id FROM users WHERE username = :username",
        values={"username": user.username},
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already taken",
        )

    # Create user
    hashed = hash_password(user.password)
    query = "INSERT INTO users (username, password_hash) VALUES (:username, :password_hash) RETURNING id"
    user_id = await database.execute(
        query=query,
        values={
            "username": user.username,
            "password_hash": hashed,
        },
    )

    return UserResponse(id=user_id, username=user.username)


@router.post("/login", response_model=Token)
async def login(user: UserLogin):
    """Login and receive a JWT token."""
    query = "SELECT id, username, password_hash FROM users WHERE username = :username"
    db_user = await database.fetch_one(query=query, values={"username": user.username})

    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
        )

    row = dict(db_user._mapping)
    if not verify_password(user.password, row["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
        )

    access_token = create_access_token(data={"sub": str(row["id"]), "username": row["username"]})
    return Token(
        access_token=access_token,
        user=UserResponse(id=row["id"], username=row["username"]),
    )


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    """Get the current logged-in user."""
    return UserResponse(**current_user)
