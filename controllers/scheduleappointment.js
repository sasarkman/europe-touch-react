console.log("hi");

class Service {
	constructor() {

	}

	getAllServices() {
		fetch('/service/getservices')
			.then((response) => {
				return response.json();
			})
			.then((data) => {
				const services = data;

				console.log(services);

				const servicesSelector = document.querySelector('#services');

				services.forEach(service => {
					const option = document.createElement('option');
					option.value = service._id;
					option.innerHTML = service.name;
					servicesSelector.appendChild(option);
				});
			})
			.catch((err) => {
				console.log(err);
			});

		
	}
}

const s = new Service().getAllServices();