from .base_agent import BaseSQLAgent
from pydantic import BaseModel, ValidationError
import json

class OptimizationResult(BaseModel):
    original_query: str
    optimized_query: str
    techniques_used: list[str]
    performance_improvement: str

class QueryOptimizerAgent(BaseSQLAgent):
    SYSTEM_PROMPT = """You are an expert SQL query optimizer.
    Optimize SQL queries based on the following techniques:
    1. Predicate pushdown
    2. Join ordering
    3. Index utilization
    4. Cost-based optimizations
    Ensure that optimizations are specific to the SQL type: {sql_type} (Trino/Spark)."""

    def __init__(self):
        super().__init__(self.SYSTEM_PROMPT)

    def optimize_query(self, sql: str, sql_type: str) -> dict:

        result = None
        try:
            result = self.agent_executor.invoke({
                "query": sql,
                "sql_type": sql_type
            })

            if not result or "output" not in result:
                return {"error": "Empty or invalid response from optimizer"}

            return self._parse_result(result["output"], sql)
        except Exception as e:
            return {
                "error": f"Execution failed: {str(e)}",
                "raw_response": str(result) if result else "No response generated"
            }

    def _parse_result(self, raw_output: str, original_query: str) -> dict:
 
        try:
            parsed = json.loads(raw_output)
            validated = OptimizationResult(**parsed)
            return validated.dict()
        except json.JSONDecodeError as e:
            return {
                "error": f"Invalid JSON format: {str(e)}",
                "raw_response": raw_output
            }
        except ValidationError as e:
            return {
                "error": f"Validation failed: {e.errors()}",
                "raw_response": raw_output
            }
