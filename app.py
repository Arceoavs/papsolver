from flask import Flask, jsonify, url_for, redirect, request
from services.solver import solveLinear
import os

app = Flask(__name__)

API_NAMESPACE = os.environ.get("API_NAMESPACE")
API_VERSION = os.environ.get("API_VERSION")
namespace = f"/{API_NAMESPACE}/v{API_VERSION}"


# redirect routes
@app.route("/")
def redirectEmpty():
    return redirect(url_for("index"))


@app.route(f"/{API_NAMESPACE}")
def redirectNamespace():
    return redirect(url_for("index"))


@app.route(f"/v{API_VERSION}")
def reedirectVersion():
    return redirect(url_for("index"))


@app.route(f"/{namespace}/")
def index():
    return "Hello"


@app.route(f"/{namespace}/solve", methods=["POST"])
def solve():
    req_data = request.get_json()
    return solveLinear(req_data["tiers"], req_data["target"])
