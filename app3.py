import streamlit as st
import os
import shutil
import tempfile
from PyPDF2 import PdfReader
from langchain.embeddings import OpenAIEmbeddings
from langchain.vectorstores import FAISS
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.llms import OpenAI
from langchain.chains import RetrievalQA

# Constants
PDF_SIZE_LIMIT_MB = 10  # Max PDF file size (MB)
TEMP_DIR = "temp_data"

def save_pdf(file):
    os.makedirs(TEMP_DIR, exist_ok=True)
    file_path = os.path.join(TEMP_DIR, file.name)
    with open(file_path, "wb") as f:
        f.write(file.getbuffer())
    return file_path

def process_pdf(pdf_path):
    reader = PdfReader(pdf_path)
    text = "\n".join([page.extract_text() for page in reader.pages if page.extract_text()])
    
    # Split text for better embedding handling
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
    texts = text_splitter.split_text(text)
    
    # Create temporary vector store
    embeddings = OpenAIEmbeddings()
    vector_store = FAISS.from_texts(texts, embeddings)
    return vector_store

def delete_vectors():
    if os.path.exists(TEMP_DIR):
        shutil.rmtree(TEMP_DIR)
    st.success("Temporary vector store deleted!")

def main():
    st.set_page_config(page_title="Dynamic RAG with PDFs", layout="wide")
    st.title("📄 PDF-powered RAG Chatbot")
    
    uploaded_file = st.file_uploader("Upload a PDF", type=["pdf"])
    
    if uploaded_file:
        if uploaded_file.size > PDF_SIZE_LIMIT_MB * 1024 * 1024:
            st.error(f"File too large! Max size allowed: {PDF_SIZE_LIMIT_MB}MB")
            return
        
        pdf_path = save_pdf(uploaded_file)
        vector_store = process_pdf(pdf_path)
        retriever = vector_store.as_retriever()
        llm = OpenAI(model_name="gpt-4", max_tokens=1000)
        qa_chain = RetrievalQA(llm=llm, retriever=retriever)
        
        query = st.text_input("Ask a question based on the PDF:")
        if st.button("Get Answer") and query:
            with st.spinner("Generating answer..."):
                response = qa_chain.run(query)
                st.write(response)
        
        if st.button("Delete Vectorized Data"):
            delete_vectors()
    
    # Additional Section: SQL Query Generator
    st.title("🔍 SQL Query Generator")
    
    # Schema input
    input_method = st.radio(
        "Input method:",
        ["Natural Language", "CSV File", "SQL File"],
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
    
    # Query input
    question = st.text_input(
        "Enter your question:",
        placeholder="e.g., Show users created last month"
    )
    
    if st.button("Generate SQL") and schema and question:
        with st.spinner("Processing..."):
            try:
                agent = SQLGenerationAgent()
                result = agent.generate_query(
                    question=question,
                    schema=json.dumps(schema)
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
