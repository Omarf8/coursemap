import { useState, useRef, useEffect } from 'react'
import './App.css'

function App() {
  const [data, setData] = useState(null)
  const [fileMissing, setMissing] = useState(false)
  const [error, setError] = useState(null)
	const [uploadSuccess, setUploadSuccess] = useState(null)
	const [auth, setAuth] = useState(null)
  const submission = useRef(null)

	useEffect(() => {
		const checkAuth = async () => {
			const response = await fetch("http://localhost:8000/auth/status/")
			const data = await response.json()

			setAuth(data.authenticated)
		}

		checkAuth()
	}, [])

	const authLogin = async () => {
		const response = await fetch("http://localhost:8000/auth/login/")	
		const data = await response.json()

		window.location.href = data.url
	}

  const processFile = async () => {
    const file = submission.current.files[0]
    // Prevent pressing confirm before uploading file
    if(!file) {
      setMissing(true)
      return
    }

    setMissing(false)
    const formData = new FormData()
    formData.append("file", file)

    const response = await fetch("http://localhost:8000/uploadfile/", {
      method: "POST",
      body: formData
    })

    if(!response.ok) {
      setError(true)
      return
    }

    setError(false)

    const parsedData = await response.json()

    setData(parsedData)
  }

	const calendarUpload = async () => {
		try {
			const response = await fetch("http://localhost:8000/calendar/add/", {
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify(data)
			})

			if(!response.ok) {
				throw new Error(`Request failed ${response.status}`)
			}		

			setUploadSuccess(true)
		}
		catch (err) {
			console.log(err)
			setUploadSuccess(false)
		}		
	}

  return (
		<>
			<div className="syllabus-file">
				<div className="syllabus-upload">
					<div className="column-format"> {fileMissing && <p className="red-text">(Missing File)</p>}
						<p>Upload A School Syllabus To Extract Important Dates</p>
						<input ref={submission} type="file" id="upload" onChange={() => setMissing(false)}/>
						<button onClick={processFile}>Confirm</button>
					</div>
				</div>
				<div className="parsed-results">
					<div className="results-box">
						{error && <p className="red-text">Something went wrong, please try again later.</p>}
						{data ?
						data && 
							data.map((s, index) => (
								<p key={index}>Title: {s.title}, Type: {s.type}, Date: {s.date}, Course: {s.course}</p>
						)) 
						:
						<p>Parsed Results Will Be Shown Here</p>}
					</div>
				</div>
			</div>
			<div>
				{auth === false && <button onClick={authLogin}>Connect to Google Calendar</button>}
				{data && <button onClick={calendarUpload}>Upload to Google Calendar</button>}
			</div>
		</>
  )
}

export default App
