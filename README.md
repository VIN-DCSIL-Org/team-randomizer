Link to the Repository: https://github.com/VIN-DCSIL-Org/team-randomizer 

# Pre-requisites
You need uv and node(v22+)

# Local Setup to run the application
1. Run the following commands in the my-react-app
```
npm install
npm run dev
```
2. In another terminal, run the following commands in the backend folder
```
uv sync
uv run fastapi dev app/main.py
```

3. To start the app(Can be on some other port: Check the output for npm run dev): http://localhost:5173/
