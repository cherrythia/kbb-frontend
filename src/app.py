#### App.py code

from flask import Flask, flash, render_template, Response, request, redirect, url_for
import cards

app = Flask(__name__, template_folder='templates', static_folder='static')


@app.route("/")
def index():
    return render_template('login-page.html', ovalue=0, message ="")


@app.route("/main", methods=["POST"])
def success():    
    
    #placeholder block for handling the HTTP POST request after form submission 
    name = request.form.get('username')    
    pw = request.form.get('password')     
    # print(name) - for debugging
    # print(pw) - for debugging

    # placeholder logic to implement authentication checks later

    if (pw == "admin"):
        # return render_template('index-placeholder.html')
        return render_template('index.html')
        #return render_template('main-page.html') - for debugging
        #render the main page if auth checks are ok
    else:
        return render_template('login-page.html', ovalue=1.0, message="Login error: wrong username and/or password")
         #render the login page again with error message
        

if __name__=='__main__':
    app.run(host="localhost",port=3000, debug = True)