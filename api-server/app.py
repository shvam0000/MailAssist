from flask import Flask, jsonify

app = Flask(__name__)

@app.route('/hello')
def home():
    return jsonify({'message': 'Hello, Flask!!'})

if __name__ == '__main__':
    app.run(debug=True)
