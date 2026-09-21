import './App.css'
import { useState, useEffect } from 'react'



function getTeams(setTeams) {
  fetch('http://localhost:3000/api/teams')
    .then((response) => response.json())
    .then((data) => setTeams(data))
}


function startPresentation(teams, setSelectedTeam) {
  const randomIndex = Math.floor(Math.random() * teams.length)
  const team = teams[randomIndex]
  setSelectedTeam(team)
}

function Home() {
  const [teams, setTeams] = useState([])
  const [selectedTeam, setSelectedTeam] = useState('')

  useEffect(() => {
    getTeams(setTeams)
  }, [])

  return (
    <main className="homepage">
      <h1>Team Randomizer</h1>
      <section className="time-card">

        <div className="time-fields">
          <div className="time-group">
            <h3>Presentation</h3>
            <input id="presentation-time" type="number" min="0" step="1" />
          </div>

          <div className="time-group">
            <h3>Q&A</h3>
            <input id="qa-time" type="number" min="0" step="1" />
          </div>
        </div>
      </section>

      <div style={{ height: '100px' }}></div>

      <section className="team-list">
        <h2>Teams</h2>

        <ul className="team-scroll">
          {teams.map((team, index) => (
            <li key={index}>{team}</li>
          ))}
        </ul>
      </section>

      <button type="button" className="start-btn" onClick={() => startPresentation(teams, setSelectedTeam)}>Start Presentations</button>

    </main>
  )
}

export default Home
