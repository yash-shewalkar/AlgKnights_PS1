from langchain_groq import ChatGroq
from config.settings import settings

class GroqClient:
    """Client for Groq Cloud API with tool support"""
    
    def __init__(self, model_name: str = "qwen-2.5-coder-32b"):
        self.llm = ChatGroq(
            temperature=0.1,
            model_name=model_name,
            groq_api_key=settings.GROQ_API_KEY,
            max_tokens=4000,
            
        )