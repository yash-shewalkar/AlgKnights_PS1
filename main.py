#main.py
from src.data_loader.document_loader import DocumentationLoader
from src.core.rag.vector_store import VectorStoreManager
from config.settings import settings

def initialize_system():
    # Load documents
    loader = DocumentationLoader()
    loader.load_documents()
    
    # Create vector stores
    vsm = VectorStoreManager()
    
    with open(f"{settings.RAW_DOCS_PATH}/trino_docs.txt", "r", encoding="utf-8") as f:  # Add encoding
        vsm.create_vector_store(f.read(), "trino_faiss_index")
    
    # Process Spark docs
    with open(f"{settings.RAW_DOCS_PATH}/spark_docs.txt", "r", encoding="utf-8") as f:  # Add encoding
        vsm.create_vector_store(f.read(), "spark_faiss_index")

if __name__ == "__main__":
    initialize_system()
    print("✅ System initialized successfully!")