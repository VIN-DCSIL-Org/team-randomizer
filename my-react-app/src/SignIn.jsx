import { Authenticator } from '@aws-amplify/ui-react'
import '@aws-amplify/ui-react/styles.css'
import { Navigate } from 'react-router-dom'

function SignIn() {
  return (
    <Authenticator>
      {() => (
        <Navigate to="/" replace />
      )}
    </Authenticator>
  )
}

export default SignIn