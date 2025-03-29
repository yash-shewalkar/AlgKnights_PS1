import streamlit as st
import json
import os
from src.agents.sql_generation_agent import SQLGenerationAgent
from src.core.schema_parser import SchemaParser
from src.agents.pdf2schema import SchemaAgent
from document_loader import load_document
from config.settings import settings

# Ensure the system is initialized
if not settings.GROQ_API_KEY:
    st.error("⚠️ GROQ_API_KEY is missing! Please set it in your .env file.")
    st.stop()

# Initialize SchemaAgent
schema_agent = SchemaAgent(groq_api_key=settings.GROQ_API_KEY)

def main():
    st.set_page_config(
        page_title="SQL Expert Assistant",
        page_icon="🤖", 
        layout="wide",
        initial_sidebar_state="expanded"
    )

    st.title("🔍 SQL Query Generator")

    # Dropdown for selecting SQL Type (Trino or Spark)
    sql_type = st.selectbox("Select SQL Type:", ["trino", "spark"], index=0)

    # Schema input method
    input_method = st.radio(
        "Input method:",
        ["Natural Language", "CSV File", "SQL File", "PDF/DOCX File"],
        horizontal=True
    )

    schema = None
    if input_method == "Natural Language":
        nl_input = st.text_area(
            "Describe your table structure:",
            height=100,
            placeholder="e.g., Table with columns: id (INT), name (VARCHAR)"
        )
        if nl_input:
            schema = SchemaParser.parse_input(nl_input, "natural_language")

    elif input_method == "CSV File":
        csv_file = st.file_uploader("Upload CSV", type=["csv"])
        if csv_file:
            schema = SchemaParser.parse_input(csv_file.getvalue(), "csv")

    elif input_method == "SQL File":
        sql_file = st.file_uploader("Upload SQL Schema", type=["sql"])
        if sql_file:
            schema = SchemaParser.parse_input(sql_file.read().decode(), "sql")

    elif input_method == "PDF/DOCX File":
        file = st.file_uploader("Upload PDF/DOCX", type=["pdf", "docx"])
        if file:
            with st.spinner("Processing file..."):
                try:
                    # Save file temporarily
                    temp_path = f"temp_{file.name}"
                    with open(temp_path, "wb") as f:
                        f.write(file.getvalue())

                    # Extract document text
                    doc_text = load_document(temp_path)

                    # Generate schema from document
                    schema = schema_agent.create_schema_agent([doc_text], "business requirements")
                    os.remove(temp_path)  # Cleanup temp file

                    st.success("✅ SQL Schema Generated Successfully!")
                    st.code(schema, language="sql")

                except Exception as e:
                    st.error(f"Error processing file: {str(e)}")

    # Query input
    question = st.text_input(
        "Enter your question:",
        placeholder="e.g., Show users created last month"
    )

    if st.button("Generate SQL") and schema and question:
        with st.spinner("Processing..."):
            try:
                agent = SQLGenerationAgent()
                
                # Ensure schema is JSON
                schema_json = schema if isinstance(schema, str) else json.dumps(schema)

                # Validate SQL Type
                if sql_type not in ["trino", "spark"]:
                    st.error("Please select a valid SQL type (Trino or Spark).")
                else:
                    result = agent.generate_query(
                        question=question,
                        schema=schema_json,
                        sql_type=sql_type  # Passing selected SQL type
                    )

                    if "error" in result:
                        st.error(f"Error: {result['error']}")
                        if "raw_response" in result:
                            with st.expander("Debug Details"):
                                st.write("Raw Response:")
                                st.code(result["raw_response"], language="json")
                    else:
                        _display_results(result, schema)

            except Exception as e:
                st.error(f"System error: {str(e)}")

def _display_results(result, schema):
    col1, col2 = st.columns([1, 2])

    with col1:
        st.subheader("Table Schema")
        st.json(schema, expanded=False)

    with col2:
        st.subheader("Generated SQL")
        st.code(result.get("query", "No query generated"), language="sql")

        if "explanation" in result:
            with st.expander("Explanation"):
                st.write(result["explanation"])

        if "potential_issues" in result:
            with st.expander("Potential Issues"):
                st.write("\n".join([f"- {i}" for i in result["potential_issues"]]))

        if "alternatives" in result:
            with st.expander("Alternative Approaches"):
                st.write("\n".join([f"- {a}" for a in result["alternatives"]]))

if __name__ == "__main__":
    main() 