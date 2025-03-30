import os
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class Settings(BaseSettings):
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY")
    TAVILY_API_KEY: str = os.getenv("TAVILY_API_URL")
    EMBEDDING_MODEL: str = "sentence-transformers/all-MiniLM-L6-v2"
    CHUNK_SIZE: int = 800
    CHUNK_OVERLAP: int = 50
    VECTOR_STORE_PATH: str = "data/vector_stores"
    RAW_DOCS_PATH: str = "data/raw_docs"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

settings = Settings()

