#### App.py code

from flask import Flask, send_from_directory

app = Flask(__name__, template_folder='templates', static_folder='static')

def setup_app():
    """Create a new instance of the flask app"""
    kanban_app = Flask(__name__)
    kanban_app.app_context().push()
    return kanban_app

app = setup_app() # pylint: disable=invalid-name

@app.route("/")
def index():
    return send_from_directory('templates', 'login-page.html')

@app.route("/main", methods=["GET"])
def success():    
    return send_from_directory('templates', 'index.html')

if __name__=='__main__':
    app.run(host="localhost",port=3000, debug = True)
