#### App.py code


from flask import Flask, request, redirect, url_for, send_from_directory, session
from flask.json import jsonify

app = Flask(__name__, template_folder='templates', static_folder='static')
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0

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
    app.run(host="localhost",port=8080, debug = True)
    app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0
