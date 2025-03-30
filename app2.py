import streamlit as st
import json
import os
import tempfile
import uuid
import shutil
from pathlib import Path
from pypdf import PdfReader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_groq import ChatGroq
from langchain.vectorstores import FAISS
from langchain.embeddings import HuggingFaceEmbeddings
from langchain.chains import ConversationalRetrievalChain
from langchain.memory import ConversationBufferMemory
from src.agents.sql_generation_agent import SQLGenerationAgent
from src.core.schema_parser import SchemaParser
from main import initialize_system
from dotenv import load_dotenv
from src.agents.pdfSchema_agent import PDFtoSchemaAgent
import PyPDF2
import json
# Load environment variables from .env file if it exists
load_dotenv()

# Constants
MAX_PDF_SIZE_MB = 10
MODELS = {
    "llama3-8b-8192": {"max_tokens": 8192},
    "mixtral-8x7b-32768": {"max_tokens": 32768},
    "gemma-7b-it": {"max_tokens": 8192}
}
DEFAULT_MODEL = "llama3-8b-8192"
VECTOR_STORE_DIR = "temp_vector_stores"

# Initialize session state variables
def init_session_state():
    if "conversation" not in st.session_state:
        st.session_state.conversation = None
    if "chat_history" not in st.session_state:
        st.session_state.chat_history = []
    if "vector_store_id" not in st.session_state:
        st.session_state.vector_store_id = None
    if "pdf_name" not in st.session_state:
        st.session_state.pdf_name = None
    if "processed_text" not in st.session_state:
        st.session_state.processed_text = None
    if "groq_api_key" not in st.session_state:
        st.session_state.groq_api_key = os.getenv("GROQ_API_KEY", "")
     


# Get API key from various sources
def get_api_key():
    # Priority: 1. Session state, 2. Streamlit secrets, 3. Environment variable
    api_key = st.session_state.groq_api_key
    
    if not api_key and hasattr(st, "secrets") and "GROQ_API_KEY" in st.secrets:
        api_key = st.secrets["GROQ_API_KEY"]
        st.session_state.groq_api_key = api_key
        
    return api_key



def extract_text_from_pdf(pdf_file):
    pdf_reader = PyPDF2.PdfReader(pdf_file)
    text = ""
    for page in pdf_reader.pages:
        extracted_text = page.extract_text()
        if extracted_text:
            text += extracted_text + "\n"
    return text

def generate_olap_schema(text, token_limit):
    schema_agent = PDFtoSchemaAgent()
    response = schema_agent.generate_optimized_schema(text, max_tokens=token_limit)
    return response


# Process the uploaded PDF
def process_pdf(pdf_file, token_limit):
    file_size_mb = pdf_file.size / (1024 * 1024)
    if file_size_mb > MAX_PDF_SIZE_MB:
        return None, f"PDF size ({file_size_mb:.2f} MB) exceeds the limit of {MAX_PDF_SIZE_MB} MB"
    
    with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as tmp_file:
        tmp_file.write(pdf_file.getvalue())
        pdf_path = tmp_file.name
    
    try:
        pdf_reader = PdfReader(pdf_path)
        text = "\n".join(filter(None, [page.extract_text() for page in pdf_reader.pages]))

        if not text.strip():
            return None, "Error: Could not extract text from the PDF."

        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            length_function=len
        )
        chunks = text_splitter.split_text(text)
        
        embeddings = HuggingFaceEmbeddings(
            model_name="sentence-transformers/all-MiniLM-L6-v2",
            model_kwargs={'device': 'cpu'}
        )
        
        vector_store_id = str(uuid.uuid4())
        vector_store_path = os.path.join(VECTOR_STORE_DIR, vector_store_id)
        os.makedirs(vector_store_path, exist_ok=True)
        
        vector_store = FAISS.from_texts(texts=chunks, embedding=embeddings)
        vector_store.save_local(vector_store_path)
        
        memory = ConversationBufferMemory(
            memory_key="chat_history",
            return_messages=True
        )
        
        # Generate OLAP schema (if needed)
        schema_response = PDFtoSchemaAgent().generate_optimized_schema(text)
        if not schema_response:
            return None, "Error: Failed to generate schema."

        # Initialize conversational retrieval with an actual LLM
        llm = ChatGroq(
            groq_api_key=get_api_key(),
            model_name=DEFAULT_MODEL,
            max_tokens=token_limit
        )

        conversation = ConversationalRetrievalChain.from_llm(
            llm=llm,
            retriever=vector_store.as_retriever(search_kwargs={"k": 3}),
            memory=memory,
            verbose=True
        )
        
        return {
            "vector_store_id": vector_store_id,
            "conversation": conversation,
            "processed_text": text,
            "schema": schema_response
        }, None
        
    except Exception as e:
        if os.path.exists(vector_store_path):
            shutil.rmtree(vector_store_path)
        return None, f"Error processing PDF: {str(e)}"
    finally:
        if os.path.exists(pdf_path):
            os.unlink(pdf_path)


# Delete the vector store
def delete_vector_store(vector_store_id):
    if not vector_store_id:
        return
        
    vector_store_path = os.path.join(VECTOR_STORE_DIR, vector_store_id)
    if os.path.exists(vector_store_path):
        shutil.rmtree(vector_store_path)
        st.success("Knowledge base deleted successfully")
        
    # Reset session state
    st.session_state.conversation = None
    st.session_state.vector_store_id = None
    st.session_state.chat_history = []
    st.session_state.pdf_name = None
    st.session_state.processed_text = None

# Main function
def main():
    st.set_page_config(
        page_title="SQL Expert with RAG",
        page_icon="🤖",
        layout="wide",
        initial_sidebar_state="expanded"
    )
    
    # Initialize session state
    init_session_state()
    
    # Create vector store directory if it doesn't exist
    if not os.path.exists(VECTOR_STORE_DIR):
        os.makedirs(VECTOR_STORE_DIR, exist_ok=True)
    
    # Check if system needs initialization
    if not os.path.exists("data/vector_stores"):
        with st.spinner("Initializing system..."):
            initialize_system()
    
    # Sidebar
    with st.sidebar:
        st.title("📋 Settings")
        
        # API Key input
        st.subheader("API Configuration")
        api_key_source = st.radio(
            "API Key Source",
            options=["Enter API Key", "Use Environment Variable"],
            index=0 if not get_api_key() else 1
        )
        
        if api_key_source == "Enter API Key":
            api_key = st.text_input(
                "Groq API Key",
                value=st.session_state.groq_api_key,
                type="password",
                help="Your Groq API key. This will be stored in the session state."
            )
            if api_key:
                st.session_state.groq_api_key = api_key
                
        elif api_key_source == "Use Environment Variable":
            if not os.getenv("GROQ_API_KEY"):
                st.warning("GROQ_API_KEY not found in environment variables")
        
        # PDF Upload
        st.subheader("Context Document")
        pdf_file = st.file_uploader("Upload PDF", type=["pdf"])
        
        # Model Selection
        st.subheader("Model Settings")
        selected_model = st.selectbox(
            "Select Model",
            options=list(MODELS.keys()),
            index=0
        )
        
        # Token limit slider based on model
        max_tokens = MODELS[selected_model]["max_tokens"]
        token_limit = st.slider(
            "Token Limit",
            min_value=1000,
            max_value=max_tokens,
            value=min(4000, max_tokens),
            step=500
        )
        
        # Process PDF button
        if pdf_file and st.button("Process PDF"):
            # Check for API key
            if not get_api_key():
                st.error("Please enter your Groq API key first")
            else:
                with st.spinner("Processing PDF..."):
                    result, error = process_pdf(pdf_file, token_limit)
                    if error:
                        st.error(error)
                    else:
                        st.session_state.conversation = result["conversation"]
                        st.session_state.vector_store_id = result["vector_store_id"]
                        st.session_state.pdf_name = pdf_file.name
                        st.session_state.processed_text = result["processed_text"]
                        st.success(f"PDF processed successfully: {pdf_file.name}")
        
        # Delete Knowledge Base button
        if st.session_state.vector_store_id:
            st.subheader("Current Knowledge Base")
            st.info(f"Active PDF: {st.session_state.pdf_name}")
            
            if st.button("Delete Knowledge Base", type="primary"):
                delete_vector_store(st.session_state.vector_store_id)
    
    # Main area
    st.title("🔍 SQL Query Generator with RAG")
    
    # API key warning
    if not get_api_key():
        st.warning("⚠️ Groq API key not configured. Please enter your API key in the sidebar settings.")
    
    # Tabs for different functionalities
    tab1, tab2 = st.tabs(["SQL Generation", "PDF Context"])
    
    with tab1:
        st.subheader("Generate SQL Queries with PDF Context")
        
        # Schema input
        input_method = st.radio(
            "Schema input method:",
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
            csv_file = st.file_uploader("Upload CSV", type=["csv"], key="csv_upload")
            if csv_file:
                schema = SchemaParser.parse_input(csv_file.getvalue(), "csv")
        
        elif input_method == "SQL File":
            sql_file = st.file_uploader("Upload SQL Schema", type=["sql"], key="sql_upload")
            if sql_file:
                schema = SchemaParser.parse_input(sql_file.read().decode(), "sql")
        
        # Query input
        question = st.text_input(
            "Enter your question:",
            placeholder="e.g., Show users created last month"
        )
        
        # RAG-enhanced SQL generation
        if st.button("Generate SQL") and schema and question:
            # Check if API key is configured
            if not get_api_key():
                st.error("Please configure your Groq API key in the sidebar settings first")
            # Check if PDF has been processed
            elif not st.session_state.conversation:
                st.warning("Please process a PDF document first to use as context")
            else:
                with st.spinner("Processing with RAG context..."):
                    try:
                        # Get context from RAG
                        rag_response = st.session_state.conversation({"question": question})
                        rag_context = rag_response['answer']
                        
                        # Generate SQL with context
                        agent = SQLGenerationAgent()
                        enhanced_question = f"""
                        Question: {question}
                        
                        Additional context from document:
                        {rag_context}
                        """
                        
                        result = agent.generate_query(
                            question=enhanced_question,
                            schema=json.dumps(schema)
                        )
                        
                        if "error" in result:
                            st.error(f"Error: {result['error']}")
                            if "raw_response" in result:
                                with st.expander("Debug Details"):
                                    st.write("Raw Response:")
                                    st.code(result["raw_response"], language="json")
                        else:
                            display_results(result, schema, rag_context)
                            
                    except Exception as e:
                        st.error(f"System error: {str(e)}")
    
    with tab2:
        st.subheader("PDF Context Viewer")
        
        if st.session_state.processed_text:
            with st.expander("View PDF Content", expanded=False):
                st.text_area(
                    "Extracted Text",
                    value=st.session_state.processed_text,
                    height=400,
                    disabled=True
                )
            
            # Chat with PDF
            st.subheader("Chat with PDF")
            pdf_query = st.text_input(
                "Ask a question about the PDF:",
                key="pdf_query",
                placeholder="e.g., What are the main topics covered in this document?"
            )
            
            if st.button("Ask") and pdf_query:
                # Check if API key is configured
                if not get_api_key():
                    st.error("Please configure your Groq API key in the sidebar settings first")
                else:
                    with st.spinner("Thinking..."):
                        try:
                            response = st.session_state.conversation({"question": pdf_query})
                            st.session_state.chat_history.append((pdf_query, response['answer']))
                            
                            # Display the chat history
                            for i, (q, a) in enumerate(st.session_state.chat_history):
                                with st.chat_message("user"):
                                    st.write(q)
                                with st.chat_message("assistant"):
                                    st.write(a)
                                
                        except Exception as e:
                            st.error(f"Error querying PDF: {str(e)}")
        else:
            st.info("Please upload and process a PDF document first")

def display_results(result, schema, rag_context=None):
    col1, col2 = st.columns([1, 2])
    
    with col1:
        st.subheader("Table Schema")
        st.json(schema, expanded=False)
        
        if rag_context:
            with st.expander("RAG Context Used"):
                st.write(rag_context)
    
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