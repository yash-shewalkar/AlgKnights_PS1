from langchain.agents import AgentExecutor, Tool
from langchain.agents.format_scratchpad.openai_functions import format_to_openai_function_messages
from langchain.agents.output_parsers import OpenAIFunctionsAgentOutputParser
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.runnables import RunnablePassthrough
from src.core.rag.vector_store import VectorStoreManager
from src.core.llm.groq_client import GroqClient
from typing import List, Optional, Dict, Any
import logging

class BaseSQLAgent:
    def __init__(self, system_prompt: str, verbose: bool = True, max_iterations: int = 5):
        self.vector_store = VectorStoreManager()
        self.tools = self._initialize_tools()
        self.llm = GroqClient().llm.bind_tools(self.tools)
        self.system_prompt = system_prompt
        self.verbose = verbose
        self.max_iterations = max_iterations
        self.agent_executor = self._create_agent()

    def _initialize_tools(self) -> List[Tool]:
        return [
            Tool(
                name="DocumentationSearch",
                func=self._search_docs,
                description="Access SQL documentation for syntax verification"
            )
        ]

    def _search_docs(self, query: str, sql_type: str) -> str:
        try:
            # Determine the appropriate FAISS index based on sql_type
            faiss_index = "trino_faiss_index" if sql_type.lower() == "trino" else "spark_faiss_index"

            # Load the selected FAISS index
            db = self.vector_store.load_vector_store(faiss_index)
            
            # Perform similarity search (fetch top 3 relevant documents)
            docs = db.similarity_search(query, k=3)

            # Return the retrieved documentation content
            return "\n\n".join([d.page_content for d in docs])
        
        except Exception as e:
            logging.error(f"Document search failed: {str(e)}")
            return "Documentation unavailable"


    def _create_agent(self) -> AgentExecutor:
        prompt = ChatPromptTemplate.from_messages([
            ("system", self.system_prompt),
            ("user", "Schema: {schema}\nQuery: {query}"),
            MessagesPlaceholder(variable_name="agent_scratchpad"),
        ])

        agent = (
            RunnablePassthrough.assign(
                agent_scratchpad=lambda x: self._format_scratchpad(
                    x.get("intermediate_steps", [])
                )
            )
            | prompt
            | self.llm
            | OpenAIFunctionsAgentOutputParser()
        )

        return AgentExecutor(
            agent=agent,
            tools=self.tools,
            verbose=self.verbose,
            max_iterations=self.max_iterations,
            handle_parsing_errors=self._handle_parsing_error,
        )

    def _format_scratchpad(self, intermediate_steps) -> list:
        try:
            return format_to_openai_function_messages(intermediate_steps)
        except (KeyError, TypeError) as e:
            logging.warning(f"Scratchpad formatting error: {str(e)}")
            return []

    def _handle_parsing_error(self, error: Exception) -> Dict[str, Any]:
        logging.error(f"Parsing error: {str(error)}")
        return {
            "output": {
                "error": f"Parsing error: {str(error)}",
                "raw_response": str(error)
            }
        }