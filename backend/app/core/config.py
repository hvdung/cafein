from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
  model_config = SettingsConfigDict(env_file=".env", extra="ignore")

  APP_ENV: str = "development"
  SECRET_KEY: str = "change-me-in-production"
  API_V1_PREFIX: str = "/api/v1"

  # CORS
  CORS_ORIGINS: list[str] = ["http://localhost:3000"]

  # Database
  DATABASE_URL: str = "postgresql+asyncpg://user:pass@localhost:5432/restaurants_db"

  # Qdrant
  QDRANT_URL: str = "http://localhost:6333"
  QDRANT_API_KEY: str = ""
  QDRANT_COLLECTION: str = "restaurants"

  # AI
  ANTHROPIC_API_KEY: str = ""
  ANTHROPIC_MODEL: str = "claude-sonnet-4-6"

  # Redis
  REDIS_URL: str = "redis://localhost:6379"
  REDIS_TTL_SECONDS: int = 3600

  # Google Maps (for geocoding)
  GOOGLE_MAPS_API_KEY: str = ""


settings = Settings()
