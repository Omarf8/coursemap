import styles from './Landing.module.css'
import { FcGoogle } from 'react-icons/fc'
import coursemapLogo from '../assets/coursemap.png'

function Landing() {
	const authLogin = async () => {
		const response = await fetch("http://localhost:8000/auth/login/")	
		const data = await response.json()

		window.location.href = data.url
	}

	return (
		<div className={styles.content}>
			<div className={styles["inner-content"]}>
				<div> 
					<div className={styles.brand}>
						<img src={coursemapLogo} alt=""/>
						<h1>CourseMap</h1>
					</div>
					<h4>Quickly Extract Dates From Syllabi and Populate Your Calendar!</h4>
				</div>
				<div>
					<button className={styles.google}onClick={authLogin}><FcGoogle size={20} /> Sign in with Google</button>
				</div>
			</div>
		</div>
	)
}

export default Landing
