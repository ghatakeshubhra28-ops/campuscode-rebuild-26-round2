from flask import Flask, render_template

app = Flask(__name__, static_folder="public", static_url_path="")

@app.route("/")
def landing():
    return render_template("landing.html")

@app.route("/login")
def login():
    return render_template("login.html")

@app.route("/register")
def register():
    return render_template("register.html")

@app.route("/student")
def dashboard():
    return render_template("dashboard.html")

@app.route("/student/events")
def events():
    return render_template("events.html")

@app.route("/student/my-events")
def my_events():
    return render_template("my_events.html")

if __name__ == "__main__":
    app.run(debug=True)