import os
from dotenv import load_dotenv
from groq import Groq
from db import supabase

load_dotenv()

client = Groq(
    api_key=os.getenv("GROQ_API_KEY")
)

chat_history = []


def ask_chatbot(user_message):
    global chat_history

    try:
        # Get a small set of incident data from Supabase
        incidents = (
            supabase
            .table("incidents")
            .select("id, hazard_type, trust_score, priority")
            .limit(20)
            .execute()
            .data
        )

        system_prompt = f"""
You are OCEANFUSION AI, an ocean hazard assistant.

Current incident database:
{incidents}

Instructions:
- Answer using only the incident data.
- Mention trust scores and priority levels.
- Keep responses short and useful.
- Help emergency teams understand ocean hazards.
"""

        chat_history.append({
            "role": "user",
            "content": user_message
        })

        messages = [
            {
                "role": "system",
                "content": system_prompt
            }
        ]

        # Keep only the last 6 messages so the request stays small
        messages.extend(chat_history[-6:]) 

        response = client.chat.completions.create(
            model="openai/gpt-oss-20b",
            messages=messages,
            max_tokens=1500,
            temperature=0.3
        )

        reply = response.choices[0].message.content

        chat_history.append({
            "role": "assistant",
            "content": reply
        })

        return reply

    except Exception as e:
        if chat_history and chat_history[-1]["role"] == "user":
            chat_history.pop()
        return f"Chatbot error: {str(e)}"


def clear_chat():
    global chat_history
    chat_history = []
