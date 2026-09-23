import os
from pathlib import Path

from google.cloud import firestore
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
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

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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


@app.post("/teams/{team_name}", status_code=201)
async def create_team(team_name: str):
    team_name = team_name.strip()
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


teams_txt_path = Path(__file__).resolve().parents[1] / "teams.txt"


@app.get("/teamstxt")
async def get_teams():
    if not teams_txt_path.exists():
        return []

    return [
        team_name
        for team_name in teams_txt_path.read_text(encoding="utf-8").splitlines()
        if team_name.strip()
    ]


@app.post("/teamstxt/{team_name}", status_code=201)
async def create_team(team_name: str):
    team_name = team_name.strip()
    if not team_name:
        raise HTTPException(status_code=400, detail="team_name cannot be empty")

    teams = await get_teams()
    if team_name in teams:
        raise HTTPException(status_code=409, detail="Team already exists")

    with teams_txt_path.open("a", encoding="utf-8") as teams_file:
        teams_file.write(f"\n{team_name}\n")

    return {"team_name": team_name}


@app.delete("/teamstxt/{team_name}")
async def delete_team(team_name: str):
    team_name = team_name.strip()
    teams = await get_teams()
    if team_name not in teams:
        raise HTTPException(status_code=404, detail="Team not found")

    remaining_teams = [team for team in teams if team != team_name]
    teams_txt_path.write_text(
        "\n".join(remaining_teams) + ("\n" if remaining_teams else ""),
        encoding="utf-8",
    )

    return {"team_name": team_name, "deleted": True}