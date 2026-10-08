import json
import os
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from google.cloud import firestore
from google.oauth2 import service_account
from mangum import Mangum
from pydantic import BaseModel

from app.api.routes import health


def init_firestore() -> firestore.Client | None:
    # 1. First priority: Raw JSON string passed via AWS Lambda Environment Variable
    raw_creds = os.getenv("FIREBASE_SERVICE_ACCOUNT_JSON")
    if raw_creds:
        try:
            cred_dict = json.loads(raw_creds)
            creds = service_account.Credentials.from_service_account_info(cred_dict)
            return firestore.Client(credentials=creds, project=cred_dict.get("project_id"))
        except Exception as e:
            print(f"Error loading credentials from JSON env: {e}")
            return None

    # 2. Second priority: File path (useful for local development)
    service_account_path = os.getenv(
        "FIREBASE_SERVICE_ACCOUNT_PATH",
        str(Path(__file__).resolve().parents[1] / "serviceAccountKey.json"),
    )
    if Path(service_account_path).is_file():
        return firestore.Client.from_service_account_json(service_account_path)

    return None


db = init_firestore()

app = FastAPI(
    title="My Project API",
    version="0.1.1",
)

# NOTE: If you configured CORS directly in API Gateway's `cors_configuration`,
# remove this middleware to prevent duplicate "Access-Control-Allow-Origin" headers.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)


class TeamRequest(BaseModel):
    team_name: str


def get_firestore():
    if db is None:
        raise HTTPException(
            status_code=503,
            detail="Firestore is unavailable. Set FIREBASE_SERVICE_ACCOUNT_JSON or FIREBASE_SERVICE_ACCOUNT_PATH.",
        )
    return db


@app.get("/team_randomizer_lambda/")
async def root():
    return {"message": "API is running"}


@app.get("/team_randomizer_lambda/teams")
async def get_teams_L(userId: str):
    user_ref = get_firestore().collection("team_list").document(userId)
    user_document = user_ref.get()

    if not user_document.exists:
        return []

    return user_document.to_dict().get("Teams", [])


@app.post("/team_randomizer_lambda/teams/{team_name}", status_code=201)
async def create_team(team_name: str, userId: str):
    team_name = team_name.strip()
    if not team_name:
        raise HTTPException(status_code=400, detail="team_name cannot be empty")

    firestore_db = get_firestore()
    user_ref = firestore_db.collection("team_list").document(userId)
    user_document = user_ref.get()

    if not user_document.exists:
        user_ref.set({"Teams": [team_name]})
        return {"user_id": userId, "team_name": team_name}

    existing_teams = user_document.to_dict().get("Teams", [])

    if team_name in existing_teams:
        raise HTTPException(status_code=409, detail="Team already exists")

    user_ref.update({"Teams": firestore.ArrayUnion([team_name])})
    return {"user_id": userId, "team_name": team_name}


@app.delete("/team_randomizer_lambda/teams/{team_name}")
async def delete_team(team_name: str, userId: str):
    team_name = team_name.strip()
    user_ref = get_firestore().collection("team_list").document(userId)
    user_document = user_ref.get()

    if not user_document.exists or team_name not in user_document.to_dict().get("Teams", []):
        raise HTTPException(status_code=404, detail="Team not found")

    user_ref.update({"Teams": firestore.ArrayRemove([team_name])})
    return {"user_id": userId, "team_name": team_name, "deleted": True}


# The entrypoint for AWS Lambda:
# lifespan="off" is recommended unless you explicitly use FastAPI lifespan events.
_mangum_handler = Mangum(app, lifespan="off")


def handler(event, context):
    print(f"API Gateway event: {json.dumps(event, default=str)}")

    if event.get("requestContext", {}).get("http", {}).get("method") == "OPTIONS":
        return {
            "statusCode": 200,
            "headers": {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type,Authorization",
                "Access-Control-Allow-Methods": "GET,POST,DELETE,OPTIONS",
            },
            "body": "",
        }

    response = _mangum_handler(event, context)
    print(f"Lambda response: {json.dumps(response, default=str)}")
    return response
