"""Pydantic schemas for authentication requests/responses."""

from pydantic import BaseModel, EmailStr


class UserCreate(BaseModel):
    """Schema for user registration."""
    username: str
    password: str


class UserLogin(BaseModel):
    """Schema for user login."""
    username: str
    password: str


class UserResponse(BaseModel):
    """Schema for user data in responses."""
    id: int
    username: str


class Token(BaseModel):
    """Schema for JWT token response."""
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
