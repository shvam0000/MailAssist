from flask import Flask, jsonify
from pymongo import MongoClient
from dotenv import load_dotenv
import os

load_dotenv()

app = Flask(__name__)

MONGO_URI = os.getenv('MONGO_URI')

client = MongoClient(MONGO_URI)
db = client.get_database('mail-dashboard')
collection = db.get_collection('emails')

@app.route('/hello')
def home():
    return jsonify({'message': 'Hello, Flask!!'})

@app.route('/data', methods=['GET'])
def get_data():
    data = list(collection.find({}, {'_id': 0}))  # Exclude _id
    return jsonify(data)

if __name__ == '__main__':
    app.run(debug=True)
