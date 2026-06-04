function Landing() {
	const authLogin = async () => {
		const response = await fetch("http://localhost:8000/auth/login/")	
		const data = await response.json()

		window.location.href = data.url
	}

	return (
		<div>
			<div>
				<h1>CourseMap</h1>
				<h4>Quickly Extract Dates From Syllabi and Populate Your Calendar!</h4>
			</div>
			<div>
				<button onClick={authLogin}>Sign in with Google</button>
			</div>
		</div>
	)
}

export default Landing
