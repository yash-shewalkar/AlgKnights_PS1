#src/data_loader/document_loader.py
from langchain_community.document_loaders import WebBaseLoader
from config.urls import TRINO_DOC_URLS, SPARK_DOC_URLS
from config.settings import settings
import os

class DocumentationLoader:
    def __init__(self):
        os.makedirs(settings.RAW_DOCS_PATH, exist_ok=True)

    def load_documents(self):
        self._load_trino_docs()
        self._load_spark_docs()

    def _load_trino_docs(self):
        loader = WebBaseLoader(TRINO_DOC_URLS)
        docs = loader.load()
        self._save_docs(docs, "trino_docs.txt")

    def _load_spark_docs(self):
        loader = WebBaseLoader(SPARK_DOC_URLS)
        docs = loader.load()
        self._save_docs(docs, "spark_docs.txt")

    def _save_docs(self, docs, filename):
      text = "\n".join([d.page_content for d in docs])
      with open(f"{settings.RAW_DOCS_PATH}/{filename}", "w", encoding="utf-8") as f:  # Add encoding
       f.write(text)