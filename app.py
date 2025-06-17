from flask import Flask, jsonify, request
from pymongo import MongoClient
from flask_cors import CORS
from dotenv import load_dotenv
import os
import requests

load_dotenv()

app = Flask(__name__)
CORS(app)

MONGO_URI = os.getenv('MONGO_URI')
HF_TOKEN = os.getenv('HF_TOKEN')

client = MongoClient(MONGO_URI)
db = client.get_database('mail-dashboard')
collection = db.get_collection('emails')

def generate_tags(text):
    keywords = {
        "invoice": ["invoice", "payment", "due", "balance"],
        "meeting": ["meeting", "schedule", "calendar", "zoom"],
        "personal": ["family", "vacation", "birthday", "dinner"],
        "job": ["resume", "interview", "application", "job"],
        "phishing": ["urgent", "click here", "account suspended", "verify"]
    }
    tags = []
    for tag, triggers in keywords.items():
        if any(word in text.lower() for word in triggers):
            tags.append(tag)
    return tags

@app.route('/hello')
def home():
    return jsonify({'message': 'Hello, Flask!!'})

@app.route('/fetch-emails', methods=['GET'])
def get_emails():
    data = list(collection.find({}, {'_id': 0}))
    return jsonify(data)

@app.route('/add-email', methods=['POST'])
def add_email():
    data = request.json
    collection.insert_one(data)
    return jsonify({'message': 'Email added successfully'})

@app.route('/process-email-agent', methods=['POST'])
def process_email_agent():
    content = request.json.get("text", "")
    content = content[:3000]
    if not content:
        return jsonify({'error': 'Content is required'}), 400
    
    hf_resp = requests.post(
        "https://api-inference.huggingface.co/models/facebook/bart-large-cnn",
        headers={"Authorization": f"Bearer {HF_TOKEN}"},
        json={"inputs": content}
    )

    if hf_resp.status_code != 200:
        return jsonify({'error': 'Failed to process email'}), 500
    
    try:
        summary = hf_resp.json()[0]['summary_text']
    except (KeyError, IndexError, TypeError):
        return jsonify({'error': 'Failed to generate summary'}), 500

    tags = generate_tags(summary)

    record = {
        "original_text": content,
        "summary": summary,
        "tags": tags
    }

    collection.insert_one(record)
    return jsonify({"summary": summary, "tags": tags})

if __name__ == '__main__':
    app.run(debug=True)
