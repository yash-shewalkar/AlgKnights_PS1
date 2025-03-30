from langchain.document_loaders import PyPDFLoader
from docx import Document


def load_document(file_path: str) -> str:
    """Load document content from PDF or DOCX."""
    if file_path.endswith('.pdf'):
        loader = PyPDFLoader(file_path)
        documents = loader.load()
        return " ".join([doc.page_content for doc in documents])
    elif file_path.endswith('.docx'):
        return load_docx(file_path)
    else:
        raise ValueError("Unsupported file format. Only PDF and DOCX are supported.")

def load_docx(file_path: str) -> str:
    """Extract text from DOCX file."""
    doc = Document(file_path)
    return "\n".join([para.text for para in doc.paragraphs])
