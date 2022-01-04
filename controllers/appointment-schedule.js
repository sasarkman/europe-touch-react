console.log('hello');

$(document).ready(function() {
	const durationField = document.querySelector('#duration');
	const priceField = document.querySelector('#price');
	const descriptionField = document.querySelector('#description');
	const servicesSelector = document.querySelector('#services');

	document.querySelector('#services').addEventListener('change', (e) => {
		const serviceID = e.target.value;
		new Service().getService(serviceID).then((data) => {
			const service = data[0];

			durationField.innerHTML = service.duration;
			priceField.innerHTML = service.price;
			descriptionField.innerHTML = service.description;
		});
	})

	new Service().getAllServices().then((data) => {
		data.forEach(service => {
			const option = document.createElement('option');
			option.value = service._id;
			option.innerHTML = service.name;
			servicesSelector.appendChild(option);
		});
		servicesSelector.dispatchEvent(new Event('change'));
	});

});