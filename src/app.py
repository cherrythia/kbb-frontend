#### App.py code

from flask import Flask, flash, render_template, Response, request, redirect, url_for, send_from_directory
from flask.json import jsonify

from database import db
import cards

app = Flask(__name__, template_folder='templates', static_folder='static')

def setup_app(kanban_db):
    """Create a new instance of the flask app"""
    kanban_app = Flask(__name__)
    kanban_app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///kanban.db'
    kanban_app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    kanban_app.config['kanban.columns'] = ['To Do', 'Doing', 'Done']
    kanban_db.init_app(kanban_app)
    kanban_app.app_context().push()
    kanban_db.create_all()
    return kanban_app

app = setup_app(db) # pylint: disable=invalid-name

@app.route("/")
def index():
    return send_from_directory('templates', 'login-page.html')


@app.route("/main", methods=["POST"])
def success():    
    
    #placeholder block for handling the HTTP POST request after form submission 
    name = request.form.get('username')    
    pw = request.form.get('password')     
    # print(name) - for debugging
    # print(pw) - for debugging

    # placeholder logic to implement authentication checks later
    return render_template('index.html')
    if (pw == "admin"):
        # return render_template('index-placeholder.html')
        return send_from_directory('templates', 'index.html')
    else:
        return send_from_directory('templates', 'login-page.html', ovalue=1.0, message="Login error: wrong username and/or password")
         #render the login page again with error message

@app.route('/cards')
def get_cards():
    """Get an order list of cards"""
    return jsonify(cards.all_cards())

@app.route('/card', methods=['POST'])
def create_card():
    """Create a new card"""

    # TODO: validation
    cards.create_card(
        text=request.form.get('text'),
        column=request.form.get('column', app.config.get('kanban.columns')[0]),
        color=request.form.get('color', None),
    )

    # TODO: handle errors
    return 'Success'

if __name__=='__main__':
    app.run(host="localhost",port=3000, debug = True)