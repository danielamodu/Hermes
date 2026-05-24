import json
import os
from groq import Groq
from dotenv import load_dotenv
load_dotenv()

def load_knowledge_base():
    path = os.path.join(os.path.dirname(__file__), 'chroma_db_fallback.json')
    if os.path.exists(path):
        with open(path, 'r') as f:
            return json.load(f)
    return []

def simple_search(question: str, chunks: list, n: int = 3) -> list:
    question_words = set(question.lower().split())
    scored = []
    for chunk in chunks:
        text_words = set(chunk['text'].lower().split())
        score = len(question_words & text_words)
        scored.append((score, chunk))
    scored.sort(key=lambda x: x[0], reverse=True)
    return [c for _, c in scored[:n]]

def rag_answer(question: str) -> dict:
    chunks = load_knowledge_base()
    if not chunks:
        return {'status': 'error', 'message': 'Knowledge base not found.'}
    
    relevant = simple_search(question, chunks)
    context = '\n\n'.join([c['text'] for c in relevant])
    sources = list(set([c['source'] for c in relevant]))
    
    prompt = f'''You are Hermes, an AI agent for the Portaldot blockchain.
Answer using ONLY the context below. Be concise and technical.
If not in context, say so.

Context:
{context}

Question: {question}
Answer:'''

    try:
        client = Groq(api_key=os.getenv('GROQ_API_KEY'))
        response = client.chat.completions.create(
            model='llama-3.3-70b-versatile',
            messages=[{'role': 'user', 'content': prompt}],
            max_tokens=300
        )
        return {
            'status': 'success',
            'data': {
                'answer': response.choices[0].message.content.strip(),
                'sources': sources
            }
        }
    except Exception as e:
        return {'status': 'error', 'message': str(e)}
