import styles from './Dashboard.module.css'
import { useState, useRef } from 'react'
import coursemapLogo from '../assets/coursemap.png'
import pencilIcon from '../assets/pencil.png'
import paperIcon from '../assets/paper.png'
import questionIcon from '../assets/question.png'
import starIcon from '../assets/star.png'
import gearIcon from '../assets/gear.png'
import lightbulbIcon from '../assets/lightbulb.png'

function Dashboard() {
  const [data, setData] = useState(null)
	const [empty, setEmpty] = useState(null)
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

		setError(false)
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
			setLoading(false)
      return
    }

    const parsedData = await response.json()

    setData(parsedData)
		setEmpty(parsedData.length === 0)
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
	
	const formatDate = (date) => {
		const [year, month, day] = date.split('-')
		return new Date(year, month - 1, day).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' })
	}

  return (
		<div>
			<header>
				<img src={coursemapLogo} alt="" />
				<span>CourseMap</span>
			</header>
			<div className={styles["syllabus-content"]}>
				<div className={styles["syllabus-column"]}> 
					{loading && <p>Loading...</p>}
					<div className={styles["column-format"]}> {fileMissing && <p className={styles["red-text"]}>(Missing File)</p>}
						<p>Upload A Syllabus To Extract Important Dates</p>
						<input ref={submission} type="file" id="upload" onChange={() => setMissing(false)}/>
						<button onClick={processFile}>Confirm</button>
					</div>
					{data && !empty && <button onClick={calendarUpload}>Upload to Google Calendar</button>}
				</div>
				<div className={styles["parsed-column"]}> 
					{error && <p className={styles["red-text"]}>Something went wrong, please try again later</p>}
					{!data && <p>Parsed Results Will Be Shown Here</p>}
					{data && (empty ? <p>No results were found</p> :
						<div className={styles["results-box"]}>
							{data.map((s, index) => (
								<div className={styles["item-card"]} key={index}>
									<div className={styles["top-card"]}>
										<img className={styles.icon} src={getIcon(s.type)} alt={s.type} />
										<div>
											<div className={styles["course-row"]}><div className={styles.course}>{s.course}</div> <span className={`${styles.bubble} ${getTypeClass(s.type)}`}>{s.type}</span></div>
											<div className={styles.date}>{formatDate(s.date)}</div>
										</div>
									</div>
									<div className={styles.title}>{s.title}</div>
								</div>
							))}
						</div>)
					}
				</div>
			</div>
		</div>
  )
}

export default Dashboard
