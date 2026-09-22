import { useLocation } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { CountdownCircleTimer } from 'react-countdown-circle-timer'

function PresentationView() {
  const location = useLocation()
  const navigate = useNavigate()
  const shuffledTeams = [...(location.state?.teams || [])].sort(() => Math.random() - 0.5)
  const [teams, setTeams] = useState(shuffledTeams)
  const [team, setTeam] = useState('')
  const presentationTime = Number(location.state?.presentationTime || 0)
  const qaTime = Number(location.state?.qaTime || 0)

  const [phase, setPhase] = useState('presentation')
  const [warnTwoMinutes, setWarnTwoMinutes] = useState(false)
  const [timerStarted, setTimerStarted] = useState(false)

  const presentationSeconds = presentationTime * 60
  const qaSeconds = qaTime * 60
  const totalSeconds = phase === 'presentation' ? presentationSeconds : qaSeconds
  const timerColors = phase === 'presentation' ? ['#16a34a'] : ['#2563eb']

  useEffect(() => {
    if (phase === 'presentation' && presentationSeconds <= 120) {
      setWarnTwoMinutes(true)
    }
  }, [phase, presentationSeconds])

  function handleTimerComplete() {
    if (phase === 'presentation') {
      setPhase('qa')
      setWarnTwoMinutes(false)
      return { shouldRepeat: true, delay: 0 }
    }

    return { shouldRepeat: false }
  }

  // should run once when the component mounts
  useEffect(() => {
    nextTeam()
  }, [])

  function nextTeam() {
    if (teams.length === 0) {
      navigate('/', { replace: true })
      return
    }

    const updatedTeams = [...teams]
    const next = updatedTeams.pop()

    setTeams(updatedTeams)
    setTeam(next)
    console.log(`teams: ${updatedTeams}, next: ${next}`)
  }

  return (
    <main className="presentation-page">
      <h1>{phase === 'presentation' ? 'Presentation View' : 'Q & A View'}</h1>
      <h2>Current Team: {team}</h2>

      <div className="circle-timer">
        <CountdownCircleTimer
          key={phase}
          isPlaying={timerStarted}
          size={320}
          duration={totalSeconds}
          colors={warnTwoMinutes ? ['#dc2626'] : timerColors}
          colorsTime={warnTwoMinutes ? [totalSeconds] : [totalSeconds]}
          onUpdate={(remainingTime) => {
            if (phase === 'presentation' && remainingTime === 120) {
              setWarnTwoMinutes(true)
            }
          }}
          onComplete={handleTimerComplete}
        >
          {({ remainingTime }) => (
            <div className="timer-value">
              {Math.floor(remainingTime / 60)}:{String(remainingTime % 60).padStart(2, '0')}
            </div>
          )}
        </CountdownCircleTimer>
      </div>

      <div className="button-row">
        <button className="green-btn" type="button" onClick={() => setTimerStarted((current) => !current)}>
          {timerStarted ? 'Stop' : 'Start'}
        </button>

        <button className="green-btn" type="button" onClick={nextTeam}>
          Next Team
        </button>
      </div>

      {warnTwoMinutes && phase === 'presentation' && (
        <p className="timer-warning">Less than 2 minutes remaining</p>
      )}
    </main>
  )
}

export default PresentationView