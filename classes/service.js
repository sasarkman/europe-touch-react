class Service {

	constructor() {
	}

	getAllServices() {
		return fetch('/service/getservices')
			.then((response) => response.json()
			)
			.catch((err) => {
				console.log(err);
			}
		);
	}

	getService(id) {
		return fetch(`/service/getservice/${id}`)
			.then((response) => response.json()
			)
			.catch((err) => {
				console.log(err);
			}
		);
	}

	editService(data) {
		return fetch('/service/edit', data)
			.then((response) => response.json()
			)
			.catch((err) => {
				console.log(err);
			}
		);
	}

	deleteService(data) {
		return fetch('/service/delete', data)
			.then((response) => response.json()
			)
			.catch((err) => {
				console.log(err);
			}
		);
	}
}