from .base_agent import BaseSQLAgent
from pydantic import BaseModel

class PerformanceEstimate(BaseModel):
    complexity: str
    resource_estimate: dict
    potential_bottlenecks: list[str]
    optimization_suggestions: list[str]

class PerformanceAgent(BaseSQLAgent):
    SYSTEM_PROMPT = """Analyze SQL query performance characteristics:
    1. Estimate computational complexity
    2. Predict resource requirements
    3. Identify potential bottlenecks"""

    def __init__(self):
        super().__init__(self.SYSTEM_PROMPT)

    def estimate_performance(self, sql: str) -> dict:
        result = self.agent_executor.invoke({
            "input": f"Analyze performance of:\n{sql}"
        })
        return PerformanceEstimate.parse_raw(result["output"]).dict()