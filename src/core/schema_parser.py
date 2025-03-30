import pandas as pd
import sqlparse
import json
import re
from io import StringIO
from sqlparse.sql import IdentifierList, Identifier
from sqlparse.tokens import Keyword, Punctuation
from typing import Union
from src.core.llm.groq_client import GroqClient

class SchemaParser:
    @staticmethod
    def parse_input(input_data: Union[str, bytes], input_type: str) -> dict:
        """Handle different input types and return standardized schema"""
        if input_type == "natural_language":
            return SchemaParser._parse_natural_language(input_data)
        elif input_type == "csv":
            return SchemaParser._parse_csv(input_data)
        elif input_type == "sql":
            return SchemaParser._parse_sql(input_data)
        else:
            raise ValueError(f"Invalid input type: {input_type}")

    @staticmethod
    def _parse_natural_language(text: str) -> dict:
        """Convert natural language description to structured schema"""
        llm = GroqClient().llm
        prompt = f"""
        Convert this table description to JSON schema:
        {text}
        
        JSON format:
        {{
            "table_name": "string",
            "columns": ["name (type)", ...],
            "relationships": ["table.column -> related_table.column"]
        }}
        
        Return only valid JSON, no other text.
        """
        response = llm.invoke(prompt).content
        
        try:
            return json.loads(response)
        except json.JSONDecodeError:
            return SchemaParser._handle_llm_fallback(response)

    @staticmethod
    def _handle_llm_fallback(text: str) -> dict:
        """Fallback parsing for malformed LLM responses"""
        table_match = re.search(r'"table_name"\s*:\s*"([^"]+)"', text)
        columns_match = re.findall(r'"columns"\s*:\s*\[([^\]]+)\]', text)
        
        return {
            "table_name": table_match.group(1) if table_match else "unknown_table",
            "columns": [c.strip() for c in columns_match[0].split(",")] if columns_match else [],
            "relationships": []
        }

    @staticmethod
    def _parse_csv(file_data: bytes) -> dict:
        """Infer schema from CSV content"""
        df = pd.read_csv(StringIO(file_data.decode()))
        return {
            "table_name": "uploaded_table",
            "columns": [
                f"{col} ({SchemaParser._infer_sql_type(df[col])})"
                for col in df.columns
            ],
            "relationships": []
        }

    @staticmethod
    def _infer_sql_type(series: pd.Series) -> str:
        """Map pandas dtype to SQL type"""
        dtype = series.dtype
        if pd.api.types.is_integer_dtype(dtype):
            return "INT"
        elif pd.api.types.is_float_dtype(dtype):
            return "FLOAT"
        elif pd.api.types.is_datetime64_any_dtype(dtype):
            return "TIMESTAMP"
        elif pd.api.types.is_bool_dtype(dtype):
            return "BOOLEAN"
        else:
            max_len = series.astype(str).str.len().max()
            return f"VARCHAR({int(max_len) if not pd.isnull(max_len) else 255})"

    @staticmethod
    def _parse_sql(sql: str) -> dict:
        """Extract schema from SQL DDL statements"""
        parsed = sqlparse.parse(sql)[0]
        schema = {"table_name": "", "columns": [], "relationships": []}
        
        for token in parsed.tokens:
            if token.ttype is Keyword and token.value.upper() == 'CREATE TABLE':
                # Get table name from next token after CREATE TABLE
                table_token = parsed.tokens[parsed.tokens.index(token)+2]
                schema["table_name"] = table_token.value.strip('`"')
            elif isinstance(token, IdentifierList):
                for identifier in token.get_identifiers():
                    col_def = str(identifier).strip()
                    if col_def and not col_def.startswith(('PRIMARY KEY', 'FOREIGN KEY')):
                        schema["columns"].append(col_def)
                    elif 'FOREIGN KEY' in col_def:
                        schema["relationships"].append(
                            SchemaParser._parse_relationship(col_def))
        
        return schema

    @staticmethod
    def _parse_relationship(col_def: str) -> str:
        """Extract foreign key relationships"""
        matches = re.findall(r'FOREIGN KEY\s*\(([^)]+)\)\s*REFERENCES\s*([^(]+)\(([^)]+)\)', col_def)
        if matches:
            local_col, ref_table, ref_col = matches[0]
            return f"{local_col.strip()} -> {ref_table.strip()}.{ref_col.strip()}"
        return ""