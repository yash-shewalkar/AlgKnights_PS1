import json

def self_evaluate_sql(query, schema, sql_type, response, llm):
    try:
        evaluation_prompt = f"""
        You are an expert SQL evaluator. Analyze the following SQL query for correctness and optimization using {sql_type.upper()} SQL reference.

        **SCHEMA:**
        {schema}
        
        **USER QUERY:**
        {query}

        **RESPONSE to evaluate:**
        ```sql
        {response}
        ```
        

        **Evaluation Criteria:**
        1. **Syntax correctness** (Is it valid SQL syntax for {sql_type}?).
        2. **Logical correctness** (Does it correctly retrieve the intended results?).
        3. **Optimization** (Proper indexing, joins, and aggregations?).
        4. **Performance** (Avoids full table scans, redundant joins?).
        5. **Best Practices** (CTEs, partitioning, etc.).

        **Output Format:**
        Return a JSON object with:
        - `confidence_score`: A score between 0-10.
        - `explanation`: A brief analysis.
        - `final_sql_query`: (If any improvements were made).

        **Example JSON Output:**
        {{
            "confidence_score": 8,
            "explanation": "The query uses correct syntax but could be optimized with indexes.",
            "final_sql_query": "SELECT ... FROM ... WHERE ... GROUP BY ..."
        }}
        """

        # Use the agent to get the evaluation response
        evaluation_response = llm.invoke(evaluation_prompt)
        
        # Attempt to parse JSON output
        try:
            evaluation_result = json.loads(evaluation_response)
        except json.JSONDecodeError:
            return {"error": "Invalid JSON response from agent."}

        return {"evaluation_result": evaluation_result}
    
    except Exception as e:
        return {"error": f"Evaluation failed: {str(e)}"}
