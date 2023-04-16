from flask import Flask, send_from_directory, request, abort

app = Flask(__name__)

@app.route('/')
def index():
    return send_from_directory('Views', 'index.html')

if __name__ == '__main__':
    app.run(host="localhost",port=8080)