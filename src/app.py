#### App.py code

from flask import Flask, flash, render_template, Response, request, redirect, url_for, send_from_directory
from flask.json import jsonify

app = Flask(__name__, template_folder='templates', static_folder='static')

pw="default"

def setup_app():
    """Create a new instance of the flask app"""
    kanban_app = Flask(__name__)
    # kanban_app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///kanban.db'
    # kanban_app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    # kanban_app.config['kanban.columns'] = ['To Do', 'Doing', 'Done']
    kanban_app.app_context().push()
    return kanban_app

app = setup_app() # pylint: disable=invalid-name

@app.route("/")
def index():
    return send_from_directory('templates', 'login-page.html')

@app.route("/main", methods=["POST", "GET"])
def success():    
    return send_from_directory('templates', 'index.html')

# for internal testing only; logic for auth check
@app.route("/auth", methods=["POST"])
def check_input():   
    username = request.form.get('username')    
    
    pw = request.form.get('password')
    
    return redirect(url_for('user', name = username))

# for internal testing only; logic for auth check
@app.route('/user/<name>')
def user_name(name):
    retrieved_pw = request.args.get('user_password')
    #retrieved_pw = "default"

    if (pw==retrieved_pw):
        return f'Successful login for {name}'
    else: 
        return f'Wrong inputs'

# for internal testing only; logic for auth check
@app.route('/user', methods=["POST"])
def user():
    return [{'result':'true'}]


if __name__=='__main__':
    app.run(host="localhost",port=3000, debug = True)
