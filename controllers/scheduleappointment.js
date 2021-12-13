console.log("hi");

class Service {

	constructor() {
		this.services = [];

		this.durationField = document.querySelector('#duration');
		this.priceField = document.querySelector('#price');
		this.descriptionField = document.querySelector('#description');

		document.querySelector('#services').addEventListener('change', (e) => {
			console.log(e.target.value);
			this.getService(e.target.value);
		})
	}

	getAllServices() {
		fetch('/service/getservices')
			.then((response) => {
				return response.json();
			})
			.then((data) => {
				this.services = data;

				console.log(this.services);

				const servicesSelector = document.querySelector('#services');

				this.services.forEach(service => {
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

	getService(id) {
		fetch(`/service/getservice/${id}`)
			.then((response) => {
				return response.json();
			})
			.then((data) => {
				console.log(data);
				const service = data[0];

				const servicesSelector = document.querySelector('#services');

				this.durationField.innerHTML = service.duration;
				this.priceField.innerHTML = service.price;
				this.descriptionField.innerHTML = service.description;
			})
			.catch((err) => {
				console.log(err);
			});
	}
}

window.addEventListener('load', function () {
	const s = new Service().getAllServices();
});
