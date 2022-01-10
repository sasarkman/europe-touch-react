console.log('hello');

$(document).ready(function() {
	// const serviceNameField = document.querySelector('#name');
	// const durationField = document.querySelector('#duration');
	// const priceField = document.querySelector('#price');
	// const descriptionField = document.querySelector('#description');
	// const servicesSelector = document.querySelector('#services');
	
	const serviceNameField = $('#name');
	const durationField = $('#duration');
	const priceField = $('#price');
	const descriptionField = $('#description');
	const servicesSelector = $('#services');

	// servicesSelector.addEventListener('change', (e) => {
	servicesSelector.on('change', (e) => {
		const serviceID = e.target.value;
		new Service().getService(serviceID).then((data) => {
			const service = data[0];
			console.log(service);

			// update drop down
			$(`#services [value=${servicesSelector.val()}]`).text(service.name);
			serviceNameField.val(service.name);
			durationField.val(service.duration);
			priceField.val(service.price);
			descriptionField.val(service.description);
		});
	})

	new Service().getAllServices().then((data) => {
		data.forEach(service => {
			const option = document.createElement('option');
			option.value = service._id;
			option.innerHTML = service.name;
			// servicesSelector.appendChild(option);
			servicesSelector.append(option);
		});
		// servicesSelector.dispatchEvent(new Event('change'));
		servicesSelector.trigger('change');
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
				id: servicesSelector.val(),
				name: serviceNameField.val(),
				duration: durationField.val(),
				price: priceField.val(),
				description: descriptionField.val()
			})
		}

		new Service().editService(settings).then(() => {
			// Update the dropdown
			$('#services').trigger('change');

			enableButton($(this));
			$(this).text('Save changes');
		});
	})

	$('#delete-button').on('click', function() {
		disableButton($(this));
		$(this).text('Deleting...');

		const settings = {
			method: 'POST',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				id: servicesSelector.val(),
				// not ideal
				name: serviceNameField.val(),
			})
		}

		new Service().deleteService(settings).then(() => {
			// Update the dropdown
			const option = $('#services option:checked');
			option.remove();

			$('#services').trigger('change');

			enableButton($(this));
			$(this).text('Delete');
		});
	})

	function enableButton(element) {
		$(element).prop('disabled', false);
	}

	function disableButton(element) {
		$(element).prop('disabled', true);
	}
});