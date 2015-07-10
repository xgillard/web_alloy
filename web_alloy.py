#! /usr/bin/python
# -*- encoding: utf-8 -*-

"""
This is the flask module that backs the alloy web application.
"""
from flask import *
from time import time
from io import open
from subprocess import Popen, PIPE
from logging import getLogger, ERROR

# Initializes the Flask micro webserver
app = Flask(__name__)


@app.route('/')
def index():
    """
    This function serves the main page of the Alloy editor
    """
    return render_template("editor.html")

@app.route("/execute", methods=["GET","POST"])
def reaction():
    """
    This page provokes the analysis of the input written in the
    text editor to be run using alloy editor
    """
    tempfile = "{}.als".format(time())
    with open(tempfile, mode='w') as f:
        f.write( request.form["content"] )

    command = ["java", "-jar", "a4cli.jar", "-i", tempfile, "-d"]
    p = Popen(command, stdin=PIPE, stdout=PIPE, stderr=PIPE)
    p.wait()
    (data, err) = p.communicate()

    return wrap_success(data) if err == '' else wrap_error(err)

## This method only serves the purpose of serving a mock page while developing the frontend
@app.route("/execute_mock", methods=["GET", "POST"])
def mock():
    with open("examples/instance.xml", "r") as f:
        return wrap_success(f.read())

def wrap_success(answer):
    """
    Wraps an answer into a format that can easily be displayed in html page
    """
    return "<success>{}</success>".format(answer)

def wrap_error(error):
    """
    Wraps an error into a format that can easily be displayed in html page
    """
    return "<error>{}></error>".format(error)

#
# This shields the module from being run in case it wasn't called
# as the main application
#
if __name__ == "__main__":
    getLogger('werkzeug').setLevel(ERROR)

    public = dict(host='0.0.0.0',  port=80)
    local  = dict(host='127.0.0.1',port=5000)

    app.run(**local)
