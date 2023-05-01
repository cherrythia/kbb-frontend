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
    #return render_template('login-page.html', ovalue=0, message ="")

# test 
@app.route("/main", methods=["POST", "GET"])
def success():    
    return send_from_directory('templates', 'index.html')

    #placeholder block for handling the HTTP POST request after form submission 
    #name = request.form.get('username')    
    #pw = request.form.get('password')     
    # print(name) - for debugging
    # print(pw) - for debugging

    # placeholder logic to implement authentication checks later
    #if (pw == "admin"):
        # return render_template('index-placeholder.html')
    #    return send_from_directory('templates', 'index.html')
    #else:
        #return send_from_directory('templates', 'login-page.html', ovalue=1.0, message="Login error: wrong username and/or password")
        #return render_template('login-page.html', ovalue=1.0, message="Login error: wrong username and/or password")
        #render the login page again with error message

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