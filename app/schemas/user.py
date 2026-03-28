from pydantic import BaseModel, field_validator


def _is_valid_email(value: str) -> bool:
    # Lightweight email validation to avoid optional EmailStr dependency.
    if not value or '@' not in value:
        return False

    local_part, domain_part = value.split('@', 1)
    return bool(local_part) and bool(domain_part) and '.' in domain_part


class UserCreate(BaseModel):
    name: str
    email: str
    password: str

    @field_validator('email')
    @classmethod
    def validate_email(cls, value: str) -> str:
        if not _is_valid_email(value):
            raise ValueError('Invalid email format')
        return value


class UserLogin(BaseModel):
    email: str
    password: str

    @field_validator('email')
    @classmethod
    def validate_email(cls, value: str) -> str:
        if not _is_valid_email(value):
            raise ValueError('Invalid email format')
        return value


class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    role: str

    class Config:
        from_attributes = True