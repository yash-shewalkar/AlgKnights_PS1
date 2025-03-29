from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from config.settings import settings
from typing import List

class VectorStore:
    def __init__(self):
        self.embeddings = HuggingFaceEmbeddings(model_name=settings.EMBEDDING_MODEL)
        self.splitter = RecursiveCharacterTextSplitter(
            chunk_size=settings.CHUNK_SIZE,
            chunk_overlap=settings.CHUNK_OVERLAP
        )

    def create_vector_store(self, documents: List[str]) -> FAISS:
        """Create FAISS vector store from documents."""
        docs = self.splitter.create_documents(documents)
        return FAISS.from_documents(docs, self.embeddings)
