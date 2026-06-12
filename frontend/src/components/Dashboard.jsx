import styles from './Dashboard.module.css'
import { useState, useRef } from 'react'
import pencilIcon from '../assets/pencil.png'
import paperIcon from '../assets/paper.png'
import questionIcon from '../assets/question.png'
import starIcon from '../assets/star.png'
import gearIcon from '../assets/gear.png'
import lightbulbIcon from '../assets/lightbulb.png'

function Dashboard() {
  const [data, setData] = useState(null)
  const [fileMissing, setMissing] = useState(false)
  const [error, setError] = useState(null)
	const [uploadSuccess, setUploadSuccess] = useState(null)
	const [loading, setLoading] = useState(false)
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

		setLoading(true)
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
		setLoading(false)
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

	const getIcon = (input) => {
		let type = input.toLowerCase()
		
		if(type.includes("homework")) return pencilIcon
		else if(type.includes("exam") || type.includes("midterm")) return starIcon
		else if(type.includes("project")) return lightbulbIcon
		else if(type.includes("quiz")) return gearIcon
		else if(type.includes("essay") || type.includes("paper")) return paperIcon
		return questionIcon
	}

	const getTypeClass = (input) => {
		let type = input.toLowerCase()
		
		if(type.includes("homework")) return styles.homework
		else if(type.includes("exam") || type.includes("midterm")) return styles.exam
		else if(type.includes("project")) return styles.project
		else if(type.includes("quiz")) return styles.quiz
		else if(type.includes("essay") || type.includes("paper")) return styles.paper
		return styles.question
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
					{error && <p className={styles["red-text"]}>Something went wrong, please try again later.</p>}
					{!data && <p>Parsed Results Will Be Shown Here</p>}
					{loading && <p>Loading...</p>}
					<div className={styles["results-box"]}>
						{data && 
							data.map((s, index) => (
								<div className={styles["item-card"]} key={index}>
									<div className={styles["top-card"]}>
										<img className={styles.icon} src={getIcon(s.type)} alt={s.type} />
										<div>
											<div className={styles["course-row"]}><div className={styles.course}>{s.course}</div> <span className={`${styles.bubble} ${getTypeClass(s.type)}`}>{s.type}</span></div>
											<div>{new Date(s.date).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' })}</div>
										</div>
									</div>
										{/* <div>{s.course} - <span>{s.type}</span></div> */}
									<div>{s.title}</div>
								</div>
						))}
					</div>
				</div>
			</div>
			<div>
				{data && <button onClick={calendarUpload}>Upload to Google Calendar</button>}
				<img src={pencilIcon} alt="Pencil" />
				<img src={paperIcon} alt="Paper" />
				<img src={questionIcon} alt="Question" />
				<img src={starIcon} alt="Star" />
				<img src={gearIcon} alt="Star" />
				<img src={lightbulbIcon} alt="Star" />
			</div>
		</div>
  )
}

export default Dashboard
