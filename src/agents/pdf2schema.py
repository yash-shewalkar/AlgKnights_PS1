from langchain_groq import ChatGroq
from langchain_core.prompts import PromptTemplate
from langchain_core.runnables import RunnablePassthrough
from vector_store import VectorStore
from config.settings import settings

class SchemaAgent:
    def __init__(self, groq_api_key: str, model_name: str = "qwen-2.5-coder-32b"):
        if not groq_api_key:
            raise ValueError("GROQ_API_KEY must be provided")

        self.llm = ChatGroq(
            temperature=0.1,
            model_name=model_name,
            groq_api_key=groq_api_key,
            max_tokens=4000
        )
        self.vector_store = VectorStore()

    def generate_sql_schema(self, document_text: str) -> str:
        """Generate SQL schema using an AI model."""
        schema_prompt_template = """
        Generate optimized SQL schema from these business requirements:
        {document_text}

        Include:
        - Table names
        - Columns with data types
        - Primary/Foreign keys
        - Constraints
        """
        prompt = PromptTemplate.from_template(schema_prompt_template)
        chain = (
            {"document_text": RunnablePassthrough()}
            | prompt
            | self.llm
        )
        return chain.invoke(document_text).content

    def create_schema_agent(self, documents: list, query: str) -> str:
        """Main processing workflow."""
        vector_store = self.vector_store.create_vector_store(documents)
        similar_docs = vector_store.similarity_search(query)
        context = " ".join([doc.page_content for doc in similar_docs])
        return self.generate_sql_schema(context)
