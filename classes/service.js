console.log("hi");

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
		// try {
		// 	const response = await $.post('/service/edit', data);
		// 	return response.json();
		// } catch (err) {
		// 	return console.log(err);
		// }
		return fetch('/service/edit', data)
			.then((response) => response.json()
			)
			.catch((err) => {
				console.log(err);
			}
		);
	}
}