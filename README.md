# AlgKnights_PS1
# JustQL.ai - AI-Powered SQL Assistant

## Project Overview
**JustQL.ai** is an AI-powered SQL query generator designed to translate natural language inputs into optimized SQL queries. Developed as part of the AlgKnights team for a hackathon, this solution leverages advanced AI models and a structured execution environment.

## Problem Statement
**Problem ID: PS1**
- AI-powered SQL Assistant (English TEXT to SQL Query Translator)

## Solution Approach
- **Natural Language to SQL Translation:** Using **RAG (Retrieval-Augmented Generation) and Llama 3.0** for accurate query generation.
- **SQL Execution & Feedback Loop:** Integrated **Trino (via Docker) and Spark SQL** for execution, with user feedback refining future queries.
- **Schema-Aware Generation:** AI-driven schema suggestions with support for **OLAP** workloads.

## Tech Stack
- **Backend:** Python, Llama 3.0, FAISS, Trino, Spark SQL
- **Frontend:** Web-based UI
- **Infrastructure:** Docker for execution environment

## Unique Selling Points (USPs)
- **Outperforms generic chatbots** like ChatGPT for SQL query generation.
- **Schema-aware query optimization** for Trino/Spark dialects.
- **Open-source LLM-based approach** for transparency and customization.

## Team AlgKnights (VIT Pune)
- **Yash Shewalkar** | TY AI & DS | yash.shewalkar22@vit.edu
- **Qusai Shergardwala** | TY AI & DS | qusai.shergardwala22@vit.edu
- **Satyajit Shinde** | TY AI & DS | satyajit.shinde22@vit.edu
- **Ishita Jasuja** | TY IT | ishita.jasuja221@vit.edu

## References
- [Trino SQL Docs](https://trino.io/docs/current/sql.html)
- [Spark SQL](https://spark.apache.org/docs/latest/sql-ref.html)
- [LangChain RAG](https://python.langchain.com/docs/tutorials/rag/)
- [Blog on Text-to-SQL](https://khadkechetan.medium.com/natural-language-to-sql-query-using-an-open-source-llm-6b4b91a5519a)

## Impact
- **Developers & Data Engineers:** Faster SQL query writing & optimization.
- **Business Analysts & Managers:** Democratized access to complex database queries.

For more details, check the full project documentation or reach out to the team.
