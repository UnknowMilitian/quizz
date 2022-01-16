const url = window.location.href

const quizBox = document.getElementById('quiz-box')
const scoreBox = document.getElementById('score-box')
const resultBox = document.getElementById('result-box')
const timerBox = document.getElementById('timer-box')

const activateTimer = (time) => {

	if (time.toString().length < 2) {
		timerBox.innerHTML = `<b>0${time}:00</b>`
	} else {
		timerBox.innerHTML = `<b>${time}:00</b>`
	}

	let minutes = time - 1
	let seconds = 60
	let displaySeconds	
	let displayMinutes

	const timer = setInterval(() =>{
		seconds --
		if(seconds < 0){
			seconds = 59
			minutes -- 
		}
		if (minutes.toString().length < 2){
			displayMinutes = '0' + minutes
		}else{
			displayMinutes = minutes
		}
		if(seconds.toString().length < 2){
			displaySeconds = '0' + seconds
		}else{
			displaySeconds = seconds
		}
		if(minutes === 0 && seconds === 0){
			timerBox.innerHTML = "<b>00:00</b>"
			setTimeout(() =>{
				console.log('Time Over')
				clearInterval(timer)
				alert('Time Over')
				sendData()
			}, 500)
			
		}

		timerBox.innerHTML = `<b>${displayMinutes}:${displaySeconds}</b>`
	}, 1000)	
}

$.ajax({
	type: 'GET',
	url: `${url}/data`,

	success: function(response){
		const data = response.data
		data.forEach(el => {
			for(const [question, answers] of Object.entries(el)){
				quizBox.innerHTML += `

				<hr>
				<br>
				<div class="mb-4">
					<h4 class="text-light">${question}</h4>
				</div>
			`

			answers.forEach(answer =>{
				quizBox.innerHTML += `
					<div>
						<div id="qcard" class="card mt-3">
							<div class="m-3">
								<div class="row">
									<div class="col-1"><input type="radio" class="ans" id="${question}-${answer}" name="${question}" value="${answer}"></div>
									<div class="col-11"><lable for="${question}">${answer}</label></div>
								</div>
							</div>
						</div>
					</div>
			`
			});
			}
		});
		activateTimer(response.time)
	},
	error: function(error){
		console.log(error)
	}
})


const quizForm = document.getElementById('quiz-form')
const csrf = document.getElementsByName('csrfmiddlewaretoken')

const sendData = () => {
	const elements = [...document.getElementsByClassName('ans')]
	const data = {}
	data['csrfmiddlewaretoken'] = csrf[0].value,
	elements.forEach(el => {
		if(el.checked){
			data[el.name] = el.value
		}else{
			if(!data[el.name]){
				data[el.name] = null
			}
		}
	});

	$.ajax({
		type: 'POST',
		url: `${url}/save`,
		data: data,
		success: function(response){
			// console.log(response)
			const results = response.results
			console.log(results)
			console.log(response.passed)
			quizForm.classList.add('not-visible')

			scoreBox.innerHTML += `${response.passed ? 'Congratulations !!! ' : 'Ups... '}You result is ${response.score.toFixed(2)}%`
			

			results.forEach(res=>{
				const resDiv = document.createElement('div')
				for(const [question, resp] of Object.entries(res)){
					// console.log(question)
					// console.log(resp)
					// console.log('*****')
					resDiv.innerHTML += question
					const cls = ['container', 'p-3', 'text-light', 'h6']
					resDiv.classList.add(...cls)

					if (resp == 'not answered'){
						resDiv.innerHTML += ' -not answered'
						resDiv.classList.add('bg-danger')
					}
					else{
						const answer = resp['answered']
						const correct = resp['correct_answer']

						if (answer == correct){
							resDiv.classList.add('bg-success')
							resDiv.innerHTML += ` answered: ${answer}`
						}else{
							resDiv.classList.add('bg-danger')
							resDiv.innerHTML += ` | correct answer: ${correct}`
							resDiv.innerHTML += ` | answered: ${answer}`
						}
					}
				}
				resultBox.append(resDiv)
			});
		},
		error: function(error){
			console.log(error)
		}
	})
}

quizForm.addEventListener('submit', e =>{
	e.preventDefault()

	sendData()
})