console.log("Appointment class");

class Appointment {

	constructor() {
	}

	getAppointments(data) {
		return fetch('/appointment/getall/', data)
			.then((response) => response.json()
			)
			.catch((err) => {
				console.log(err);
			}
		);
	}

	scheduleAppointment(data) {
		return fetch('/schedule', data)
			.then((response) => response.json()
			)
			.catch((err) => {
				console.log(err);
			}
		);
	}

	approveAppointment(data) {
		return fetch(`/appointment/approve`, data)
			.then((response) => response.json()
			)
			.catch((err) => {
				console.log(err);
			}
		);
	}

	unapproveAppointment(data) {
		return fetch(`/appointment/unapprove`, data)
			.then((response) => response.json()
			)
			.catch((err) => {
				console.log(err);
			}
		);
	}

	cancelAppointment(data) {
		return fetch('/appointment/cancel', data)
			.then((response) => response.json()
			)
			.catch((err) => {
				console.log(err);
			}
		);
	}
}