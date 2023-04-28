#### App.py code

from flask import Flask, render_template, request, send_from_directory

app = Flask(__name__, template_folder='templates', static_folder='static')


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

    if (pw == "admin"):
        # return render_template('index-placeholder.html')
        return send_from_directory('templates', 'index.html')
    else:
        return send_from_directory('templates', 'login-page.html', ovalue=1.0, message="Login error: wrong username and/or password")
         #render the login page again with error message
        

if __name__=='__main__':
    app.run(host="localhost",port=3000, debug = True)