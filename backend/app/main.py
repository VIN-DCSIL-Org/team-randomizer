import os
from pathlib import Path

from google.cloud import firestore
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from app.api.routes import health


service_account_path = os.getenv(
    "FIREBASE_SERVICE_ACCOUNT_PATH",
    str(Path(__file__).resolve().parents[1] / "serviceAccountKey.json"),
)
db = firestore.Client.from_service_account_json(service_account_path)

app = FastAPI(
    title="My Project API",
    version="0.1.0",
)

app.include_router(health.router)


class TeamRequest(BaseModel):
    team_name: str


@app.get("/")
async def root():
    return {"message": "API is running"}

@app.get("/teams")
async def get_teams():
    teams_ref = db.collection("teams")
    teams = teams_ref.get()
    return [team.to_dict()["TeamName"] for team in teams]


@app.post("/teams", status_code=201)
async def create_team(team: TeamRequest):
    team_name = team.team_name.strip()
    if not team_name:
        raise HTTPException(status_code=400, detail="team_name cannot be empty")

    existing_team = (
        db.collection("teams")
        .where("TeamName", "==", team_name)
        .limit(1)
        .get()
    )
    if existing_team:
        raise HTTPException(status_code=409, detail="Team already exists")

    team_ref = db.collection("teams").document()
    team_ref.set({"TeamName": team_name})
    return {"id": team_ref.id, "team_name": team_name}


@app.delete("/teams/{team_name}")
async def delete_team(team_name: str):
    team_name = team_name.strip()
    matching_teams = (
        db.collection("teams")
        .where("TeamName", "==", team_name)
        .limit(1)
        .get()
    )
    if not matching_teams:
        raise HTTPException(status_code=404, detail="Team not found")

    team_ref = matching_teams[0].reference
    team_ref.delete()
    return {"team_name": team_name, "deleted": True}