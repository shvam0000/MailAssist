from flask import Flask, jsonify, request
from pymongo import MongoClient
from flask_cors import CORS
from dotenv import load_dotenv
import os

load_dotenv()

app = Flask(__name__)
CORS(app)

MONGO_URI = os.getenv('MONGO_URI')

client = MongoClient(MONGO_URI)
db = client.get_database('mail-dashboard')
collection = db.get_collection('emails')

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

if __name__ == '__main__':
    app.run(debug=True)
