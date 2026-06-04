import { useState, useEffect } from 'react'
import './App.css'
import Landing from './components/Landing'
import Dashboard from './components/Dashboard'

function App() {
	const [auth, setAuth] = useState(null)

	useEffect(() => {
		const checkAuth = async () => {
			const response = await fetch("http://localhost:8000/auth/status/")
			const data = await response.json()

			setAuth(data.authenticated)
		}

		checkAuth()
	}, [])

	if(auth === null) return <p>Loading...</p>
	if(auth === false) return <Landing />
  return <Dashboard />
}

export default App
