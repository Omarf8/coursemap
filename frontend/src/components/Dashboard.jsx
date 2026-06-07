import styles from './Dashboard.module.css'
import { useState, useRef } from 'react'

function Dashboard() {
  const [data, setData] = useState(null)
  const [fileMissing, setMissing] = useState(false)
  const [error, setError] = useState(null)
	const [uploadSuccess, setUploadSuccess] = useState(null)
  const submission = useRef(null)

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
		<div>
			<header>
				<h1>CourseMap</h1>
			</header>
			<div className={styles["syllabus-content"]}>
				<div className={styles["syllabus-column"]}> 
					<div className={styles["column-format"]}> {fileMissing && <p className={styles["red-text"]}>(Missing File)</p>}
						<p>Upload A Syllabus To Extract Important Dates</p>
						<input ref={submission} type="file" id="upload" onChange={() => setMissing(false)}/>
						<button onClick={processFile}>Confirm</button>
					</div>
				</div>
				<div className={styles["parsed-column"]}> 
					<div className={styles["results-box"]}>
						{error && <p className={styles["red-text"]}>Something went wrong, please try again later.</p>}
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
				{data && <button onClick={calendarUpload}>Upload to Google Calendar</button>}
			</div>
		</div>
  )
}

export default Dashboard
