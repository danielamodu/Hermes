import os
from groq import Groq
from dotenv import load_dotenv
load_dotenv()

def rag_answer(question: str) -> dict:
    try:
        client = Groq(api_key=os.getenv('GROQ_API_KEY'))
        response = client.chat.completions.create(
            model='llama-3.3-70b-versatile',
            messages=[{
                'role': 'system',
                'content': '''You are Hermes, an AI agent specialized in the Portaldot blockchain. 
Portaldot is a Layer 0 blockchain with LAO NPoS consensus, 10,000 TPS, Python SDK (substrate-interface), POT as native token with 14 decimals, ss58_format=42, supports ink! smart contracts, ZKP privacy, RWA tokenization. 
Answer questions about Portaldot concisely and technically. If you don't know something specific, say so.'''
            }, {
                'role': 'user',
                'content': question
            }],
            max_tokens=200
        )
        return {
            'status': 'success',
            'data': {'answer': response.choices[0].message.content.strip(), 'sources': []}
        }
    except Exception as e:
        return {'status': 'error', 'message': str(e)}
