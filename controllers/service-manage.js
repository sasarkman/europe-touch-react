console.log('hello');

$(document).ready(function() {
	const serviceNameField = document.querySelector('#name');
	const durationField = document.querySelector('#duration');
	const priceField = document.querySelector('#price');
	const descriptionField = document.querySelector('#description');
	const servicesSelector = document.querySelector('#services');

	servicesSelector.addEventListener('change', (e) => {
		const serviceID = e.target.value;
		new Service().getService(serviceID).then((data) => {
			const service = data[0];
			console.log(service);

			serviceNameField.value = service.name;
			durationField.value = service.duration;
			priceField.value = service.price;
			descriptionField.value = service.description;
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

	$('#save-button').on('click', function() {
		disableButton($(this));
		$(this).text('Saving...');

		const settings = {
			method: 'POST',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				id: servicesSelector.value,
				name: serviceNameField.value,
				duration: durationField.value,
				price: priceField.value,
				description: descriptionField.value
			})
		}

		new Service().editService(settings).then(() => {
			// Update the dropdown
			const option = document.querySelector('#services option:checked');
			option.innerHTML = serviceNameField.value;

			enableButton($(this));
			$(this).text('Save changes');
		});
	})

	function enableButton(element) {
		$(element).prop('disabled', false);
	}

	function disableButton(element) {
		$(element).prop('disabled', true);
	}
});