# pdf_to_schema_agent.py

import json
from langchain_groq import ChatGroq
from src.core.schema_parser import SchemaParser
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

def get_api_key():
    return os.getenv("GROQ_API_KEY", "")

class PDFtoSchemaAgent:
    def __init__(self, model_name="llama3-8b-8192", max_tokens=8192):
        api_key = get_api_key()
        if not api_key:
            raise ValueError("GROQ API key is missing.")
        
        self.llm = ChatGroq(
            groq_api_key=api_key,
            model_name=model_name,
            max_tokens=max_tokens
        )

    def generate_optimized_schema(self, extracted_text,max_tokens=8192):
        prompt = f"""
        Given the following extracted text from a PDF, generate an OLAP-friendly optimized database schema.
        Ensure that the schema follows best practices for data warehousing, including fact and dimension tables,
        appropriate indexing, and normalization where necessary.
        OUTPUT the schema in JSON format.
        Extracted Text:
        {extracted_text}
        
        Output the schema in JSON format.
        """
        
        response = self.llm(prompt, max_tokens=max_tokens)
        return json.loads(response)  # Assuming response structure contains 'answer'
