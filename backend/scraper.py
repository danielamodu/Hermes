import requests
from bs4 import BeautifulSoup
import re
import json

try:
    import chromadb
    HAS_HEAVY = True
except ImportError:
    HAS_HEAVY = False

DOCS_URLS = [
    'https://portaldot-dev.readthedocs.io/en/latest/',
    'https://portaldot-dev.readthedocs.io/en/latest/Introduction.html',
    'https://portaldot-dev.readthedocs.io/en/latest/getting-started/index.html',
    'https://portaldot-dev.readthedocs.io/en/latest/getting-started/local_test.html',
    'https://portaldot-dev.readthedocs.io/en/latest/chain-info.html',
    'https://portaldot-dev.readthedocs.io/en/latest/python-sdk/index.html',
    'https://portaldot-dev.readthedocs.io/en/latest/python-sdk/Install.html',
    'https://portaldot-dev.readthedocs.io/en/latest/python-sdk/Examples.html',
    'https://portaldot-dev.readthedocs.io/en/latest/python-sdk/usage/usage.html',
    'https://portaldot-dev.readthedocs.io/en/latest/python-sdk/usage/keypair-creation-and-signing.html',
    'https://portaldot-dev.readthedocs.io/en/latest/python-sdk/usage/query-storage.html',
    'https://portaldot-dev.readthedocs.io/en/latest/python-sdk/usage/extrinsics.html',
    'https://portaldot-dev.readthedocs.io/en/latest/python-sdk/usage/call-runtime-apis.html',
    'https://portaldot-dev.readthedocs.io/en/latest/python-sdk/usage/cleanup-and-context-manager.html',
    'https://portaldot-dev.readthedocs.io/en/latest/python-sdk/usage/ink-contract-interfacing.html',
    'https://portaldot-dev.readthedocs.io/en/latest/extension.html',
    'https://portaldot-dev.readthedocs.io/en/latest/module-interface/index.html',
]

def scrape_and_chunk(url: str, chunk_size: int = 500) -> list[dict]:
    try:
        res = requests.get(url, timeout=30)
        soup = BeautifulSoup(res.text, 'html.parser')
        # target the main content div specifically (ReadTheDocs specific classes)
        content = soup.find('div', {'class': 'wy-nav-content'}) or \
                  soup.find('div', {'class': 'rst-content'}) or \
                  soup.find('div', {'class': 'document'}) or \
                  soup
        # remove nav, sidebar, footer, script, and style tags
        for tag in content.find_all(['nav', 'footer', 'script', 'style']):
            tag.decompose()
        # remove ReadTheDocs-specific menus, toctree-wrapper, and TOC classes
        for tag in content.find_all(class_=['toctree-wrapper', 'toc', 'wy-menu', 'wy-menu-vertical', 'rst-versions']):
            tag.decompose()
        # get paragraphs and code blocks separately
        chunks = []
        for element in content.find_all(['p', 'pre', 'li', 'h1', 'h2', 'h3']):
            text = element.get_text(strip=True)
            if len(text) > 20:  # skip short nav fragments, but keep titles/commands
                chunks.append({'text': text, 'source': url})
        return chunks
    except Exception as e:
        print(f'Failed to scrape {url}: {e}')
        return []

def build_knowledge_base():
    print('Building Portaldot knowledge base...')
    all_chunks = []
    for url in DOCS_URLS:
        chunks = scrape_and_chunk(url)
        all_chunks.extend(chunks)
        print(f'Scraped {len(chunks)} chunks from {url}')
    
    if not all_chunks:
        print('No chunks scraped')
        return

    # Always save a fallback copy in case chroma is not available
    try:
        with open('chroma_db_fallback.json', 'w') as f:
            json.dump(all_chunks, f)
        print(f'Saved {len(all_chunks)} chunks to chroma_db_fallback.json')
    except Exception as e:
        print(f'Failed to save fallback database: {e}')
    
    if HAS_HEAVY:
        try:
            from chromadb.utils import embedding_functions
            ef = embedding_functions.DefaultEmbeddingFunction()
            client = chromadb.PersistentClient(path='./chroma_db')
            
            # delete existing collection if rebuilding
            try:
                client.delete_collection('portaldot_docs')
            except:
                pass
            
            collection = client.create_collection('portaldot_docs', embedding_function=ef)
            
            texts = [c['text'] for c in all_chunks]
            sources = [c['source'] for c in all_chunks]
            ids = [f'chunk_{i}' for i in range(len(all_chunks))]
            
            collection.add(
                documents=texts,
                metadatas=[{'source': s} for s in sources],
                ids=ids
            )
            print(f'Knowledge base built with {len(all_chunks)} chunks in ChromaDB')
        except Exception as e:
            print(f'ChromaDB construction failed (using JSON fallback): {e}')
    else:
        print('chromadb not installed. Skipping ChromaDB creation.')

if __name__ == '__main__':
    build_knowledge_base()
