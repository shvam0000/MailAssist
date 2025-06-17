from flask import Flask, jsonify, request
from pymongo import MongoClient
from flask_cors import CORS
from dotenv import load_dotenv
import os
import requests
import re

load_dotenv()

app = Flask(__name__)
CORS(app)

MONGO_URI = os.getenv('MONGO_URI')
HF_TOKEN = os.getenv('HF_TOKEN')
SLACK_WEBHOOK_URL = os.getenv('SLACK_WEBHOOK_URL')

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

    # record = {
    #     "original_text": content,
    #     "summary": summary,
    #     "tags": tags
    # }

    # collection.insert_one(record)
    return jsonify({"summary": summary, "tags": tags})


@app.route('/forward-to-slack', methods=['POST'])
def forward_to_slack():
    if not SLACK_WEBHOOK_URL:
        return jsonify({'error': 'Slack webhook URL is not configured on the server.'}), 500
        
    email_data = request.json
    sender = email_data.get('sender', 'Unknown Sender')
    subject = email_data.get('subject', 'No Subject')
    body_html = email_data.get('body', '')


    cleaned_body = re.sub('<[^<]+?>', '', body_html).strip()

    max_length = 2500
    if len(cleaned_body) > max_length:
        truncated_body = cleaned_body[:max_length] + "... *[Email content truncated]*"
    else:
        truncated_body = cleaned_body

    tags = generate_tags(cleaned_body)

    slack_message = {
        "blocks": [
            {
                "type": "header",
                "text": {
                    "type": "plain_text",
                    "text": f"📧 New Email: {subject}",
                    "emoji": True
                }
            },
            {
                "type": "section",
                "fields": [
                    {"type": "mrkdwn", "text": f"*From:*\n{sender}"}
                ]
            },
            {
                "type": "divider"
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": f"*Email Body:*\n{truncated_body}"
                }
            },
            {
                "type": "context",
                "elements": [
                    {"type": "mrkdwn", "text": f"*Tags:* `{'`, `'.join(tags)}`"}
                ]
            }
        ]
    }


    try:
        response = requests.post(SLACK_WEBHOOK_URL, json=slack_message)
        response.raise_for_status()
        return jsonify({'message': 'Email forwarded to Slack successfully!'})
    except requests.exceptions.RequestException as e:
        return jsonify({'error': f"Failed to send message to Slack: {e}"}), 500

if __name__ == '__main__':
    app.run(debug=True)