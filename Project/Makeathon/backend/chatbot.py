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

    # Get incident data from Supabase
    incidents = (
        supabase
        .table("incidents")
        .select("*")
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

    messages.extend(chat_history)


    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=messages,
        max_tokens=500,
        temperature=0.3
    )


    reply = response.choices[0].message.content


    chat_history.append({
        "role": "assistant",
        "content": reply
    })


    return reply



def clear_chat():
    global chat_history
    chat_history = []