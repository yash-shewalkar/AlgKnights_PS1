from .base_agent import BaseSQLAgent
from pydantic import BaseModel, ValidationError
import json
from typing import Optional, Dict, Any

class GenerationResult(BaseModel):
    query: str
    explanation: str
    potential_issues: list[str]
    alternatives: list[str]

class SQLGenerationAgent(BaseSQLAgent):
    SYSTEM_PROMPT = """
    You are a SQL expert. Follow these rules:
        ## **Supported Features ✅**
    **Use the following features in queries: for SPARK only**
    - **Date Functions:** `date_trunc`, `date_add`, `current_date`, `unix_timestamp`
    - **Filtering:** `WHERE`, `BETWEEN`
    - **Aggregations:** `GROUP BY`, `HAVING`
    - **Joins:** `INNER, LEFT, RIGHT, FULL OUTER JOIN`
    - **CTEs (WITH clause):** Use for complex queries
    - **Window Functions:** `RANK(), ROW_NUMBER(), LEAD(), LAG()`
    - **JSON Handling:** `get_json_object(), json_tuple()`
    - **Bucketing & Partitioning:** `PARTITIONED BY`, `CLUSTERED BY`

        **DO NOT generate queries using the following: for TRINO only**
    `CREATE INDEX` (Use **partitioning** instead)  
    `CREATE MATERIALIZED VIEW` (Use **regular views** instead)  
    `MERGE INTO` (Use `INSERT INTO ... SELECT` instead)  
    `UPDATE/DELETE` (Limited support; Use **CTAS or INSERT INTO ... SELECT** instead)  
    `AUTO_INCREMENT` (Use `UUID()` or `ROW_NUMBER()`)  
    `BEGIN TRANSACTION` (Use **ETL pipelines** instead)  
    `CREATE PROCEDURE / TRIGGER` (Use **external orchestration** tools like Airflow) 

    1. Return JSON with EXACTLY these fields:
       - query: Valid SQL string
       - explanation: Technical rationale
       - potential_issues: List of strings
       - alternatives: List of Top 3 optimized SQL queries using CTEs, indexing, partitioning, etc. in markdown format
    2. Use this schema:
       {schema}  # ✅ Proper variable
    3. Use this SQL-Type (Trino / Spark): 
       {sql_type} # ✅ Proper variable
    4. Example response:
       {{
         "query": "SELECT id FROM users",  # ✅ No stray formatting
         "explanation": "Simple ID retrieval",
         "potential_issues": ["No index on id"],
         "alternatives": [```SELECT user_id FROM accounts```, ```SELECT id FROM users WHERE created_at > '2023-01-01'```]"]
       }}
       
       
       """

    def __init__(self):
        super().__init__(self.SYSTEM_PROMPT)

    def generate_query(self, question: str, schema: str, sql_type: str) -> Dict[str, Any]:

        result: Optional[dict] = None

        # Select the correct FAISS index
        faiss_index = self.select_faiss_index(sql_type)

        # Retrieve relevant documentation snippets
        documentation_snippets = self.documentation_search(faiss_index, question)

        try:
            result = self.agent_executor.invoke({
                "query": question,
                "schema": schema,
                "sql_type": sql_type,
                "docs": documentation_snippets  # Pass documentation search results
            })

            if not result:
                return {"error": "Empty response from SQL agent"}

            return self._parse_result(result)
        except Exception as e:
            return {
                "error": f"Execution failed: {str(e)}",
                "raw_response": str(result) if result else "No response generated"
            }

    def select_faiss_index(self, sql_type: str):
        return "trino_faiss_index" if sql_type.lower() == "trino" else "spark_faiss_index"

    def documentation_search(self, faiss_index: str, query: str):
        """
        Searches documentation for SQL-specific syntax related to the query.

        Args:
            faiss_index (str): The FAISS index for the SQL dialect.
            query (str): The natural language query.

        Returns:
            list: Relevant documentation snippets.
        """
        return self.use_tool("DocumentationSearch", {"index": faiss_index, "query": query})
    
    def use_tool(self, tool_name: str, params: dict):
        """
        Uses a tool (e.g., FAISS documentation search) if available.

        Args:
            tool_name (str): Name of the tool to use.
            params (dict): Parameters for the tool.

        Returns:
            list: Output from the tool.
        """
        if tool_name in self.tools:
            return self.tools[tool_name].invoke(params)
        return []
    
    def _parse_result(self, result: dict) -> Dict[str, Any]:

        if "output" not in result:
            return {"error": "Missing 'output' in agent response"}

        raw_output = result["output"]
        try:
            parsed = json.loads(raw_output)
            validated = GenerationResult(**parsed)
            return validated.dict()
        except json.JSONDecodeError as e:
            return {
                "error": f"Invalid JSON: {str(e)}",
                "raw_response": raw_output
            }
        except ValidationError as e:
            return {
                "error": f"Validation errors: {e.errors()}",
                "raw_response": raw_output
            },