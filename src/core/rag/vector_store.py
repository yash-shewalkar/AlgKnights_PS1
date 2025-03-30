#src/core/rag/vector_store.py
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from config.settings import settings

class VectorStoreManager:
    def __init__(self):
        self.embeddings = HuggingFaceEmbeddings(model_name=settings.EMBEDDING_MODEL)
        self.splitter = RecursiveCharacterTextSplitter(
            chunk_size=settings.CHUNK_SIZE,
            chunk_overlap=settings.CHUNK_OVERLAP
        )

    def create_vector_store(self, text, store_name):
        docs = self.splitter.create_documents([text])
        vector_store = FAISS.from_documents(docs, self.embeddings)
        vector_store.save_local(f"{settings.VECTOR_STORE_PATH}/{store_name}")
        return vector_store

    def load_vector_store(self, store_name):
        return FAISS.load_local(
            f"{settings.VECTOR_STORE_PATH}/{store_name}",
            self.embeddings,
            allow_dangerous_deserialization=True
        )