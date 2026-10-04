import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import Home from './Home.jsx'
import PresentationView from './presentation-view.jsx'
import SignIn from './SignIn.jsx'
import { Amplify } from 'aws-amplify'
import { Authenticator } from '@aws-amplify/ui-react'
import ProtectedRoute from './ProtectedRoute.jsx'


Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: 'ca-central-1_eTHXTCAiO',
      userPoolClientId: '7p8kh6ta4hklhcc6j23lh9lanj',
      loginWith: {
        email: true,
      },
    },
  },
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Authenticator.Provider>
      <BrowserRouter>
        <Routes>
          <Route path="/sign-in" element={<SignIn />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />

          <Route
            path="/presentation-view"
            element={
              <ProtectedRoute>
                <PresentationView />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </Authenticator.Provider>
  </StrictMode>,
)
