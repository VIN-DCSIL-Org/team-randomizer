import './App.css'

function Home() {
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
        <h2>Team List</h2>
      </section>
    </main>
  )
}

export default Home
