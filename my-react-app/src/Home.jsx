import './App.css'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'



function getTeams(setTeams) {
  fetch('http://localhost:8000/teamstxt')
    .then((response) => response.json())
    .then((data) => setTeams(data))
}

function createTeam(teamName, onSuccess) {
  fetch(`http://localhost:8000/teamstxt/${encodeURIComponent(teamName)}`, {
    method: 'POST',
  }).then((response) => {
    if (!response.ok) {
      return response.json().then((error) => {
        throw new Error(error.detail || 'Unable to add team')
      })
    }

    onSuccess()
  })
}

function deleteTeam(teamName, onSuccess) {
  fetch(`http://localhost:8000/teamstxt/${encodeURIComponent(teamName)}`, {
    method: 'DELETE',
  }).then((response) => {
    if (!response.ok) {
      return response.json().then((error) => {
        throw new Error(error.detail || 'Unable to delete team')
      })
    }

    onSuccess()
  })
}


// function startPresentation(teams, setSelectedTeam) {
//   const randomIndex = Math.floor(Math.random() * teams.length)
//   const team = teams[randomIndex]
//   setSelectedTeam(team)
// }

function Home() {
  const [teams, setTeams] = useState([])
  const [isAddingTeam, setIsAddingTeam] = useState(false)
  const [newTeamName, setNewTeamName] = useState('')
  const [presentationTime, setPresentationTime] = useState('')
  const [qaTime, setQaTime] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    getTeams(setTeams)
  }, [])

  const handleStart = () => {
  if (!presentationTime || !qaTime) {
    alert('Please enter both Presentation time and Q&A time.')
    return
  }

  navigate('/presentation-view', {
    state: { teams, presentationTime, qaTime },
  })
}

  const handleAddTeam = () => {
    setIsAddingTeam(true)
    setNewTeamName('')
  }

  const handleSaveTeam = (event) => {
    event.preventDefault()
    const teamName = newTeamName.trim()

    if (!teamName) {
      return
    }

    createTeam(teamName, () => {
      getTeams(setTeams)
      setNewTeamName('')
      setIsAddingTeam(false)
    })
  }

  const handleCancelAdd = () => {
    setNewTeamName('')
    setIsAddingTeam(false)
  }

  const handleDeleteTeam = (teamName) => {
    deleteTeam(teamName, () => {
      getTeams(setTeams)
    })
  }

  return (
    <main className="homepage">
      <h1>Team Randomizer</h1>
      <section className="time-card">

        <div className="time-fields">
          <div className="time-group">
            <h3>Presentation</h3>
            <input id="presentation-time" type="number" min="0" step="1" value={presentationTime} onChange={(e) => setPresentationTime(e.target.value)} />
          </div>

          <div className="time-group">
            <h3>Q&A</h3>
            <input id="qa-time" type="number" min="0" step="1" value={qaTime} onChange={(e) => setQaTime(e.target.value)} />
          </div>
        </div>
      </section>

      <div style={{ height: '100px' }}></div>

      <section className="team-list">
        <div className="team-list-header">
          <h2>Teams</h2>
          <button type="button" className="team-add-btn" onClick={handleAddTeam} aria-label="Add team">
            +
          </button>
        </div>

        <ul className="team-scroll">
          {teams.map((team, index) => (
            <li key={index} className="team-item">
              <span className="team-name">{team}</span>
              <button
                type="button"
                className="team-delete-btn"
                onClick={() => handleDeleteTeam(team)}
                aria-label={`Delete ${team}`}
                title={`Delete ${team}`}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path d="M9 3.75A1.75 1.75 0 0 1 10.75 2h2.5A1.75 1.75 0 0 1 15 3.75V4h4a.75.75 0 0 1 0 1.5h-1.06l-.67 12.02A2.75 2.75 0 0 1 14.52 20H9.48a2.75 2.75 0 0 1-2.75-2.48L6.06 5.5H5a.75.75 0 0 1 0-1.5h4v-.25Zm1.5.25V4h3V4a.25.25 0 0 0-.25-.25h-2.5A.25.25 0 0 0 10.5 4Zm-2.93 1.5.62 11.89c.03.68.59 1.21 1.27 1.21h5.05c.68 0 1.24-.53 1.27-1.21L16.4 5.5H7.57ZM10 8.25a.75.75 0 0 1 .75.75v5a.75.75 0 0 1-1.5 0v-5a.75.75 0 0 1 .75-.75Zm4 0a.75.75 0 0 1 .75.75v5a.75.75 0 0 1-1.5 0v-5a.75.75 0 0 1 .75-.75Z" />
                </svg>
              </button>
            </li>
          ))}
          {isAddingTeam && (
            <li className="team-item team-add-row">
              <form className="team-add-form" onSubmit={handleSaveTeam}>
                <input
                  type="text"
                  value={newTeamName}
                  onChange={(event) => setNewTeamName(event.target.value)}
                  placeholder="Enter team name"
                  autoFocus
                  aria-label="New team name"
                />
                <button type="submit" className="team-save-btn">Save</button>
                <button type="button" className="team-cancel-btn" onClick={handleCancelAdd}>Cancel</button>
              </form>
            </li>
          )}
        </ul>
      </section>

      <button
        type="button"
        className="green-btn start-btn"
        onClick={handleStart}
      >
        Start Presentations
      </button>
    </main>
  )
}

export default Home